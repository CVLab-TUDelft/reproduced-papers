import React, { useReducer, useState, useEffect, useRef } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory, Link } from 'react-router-dom';

import Button from './Button';
import Spinner from './Spinner';
import { useFirebase, useAlgolia, useSearch } from '../hooks';

const INITIAL_STATE = {
  title: '',
  abstract: '',
  authors: [],
  urlAbstract: '',
  urlPDF: '',
  published: false,
};

function init(data) {
  return {
    title: data.title,
    abstract: data.abstract,
    authors: data.authors.join(', '),
    urlAbstract: data.urlAbstract,
    urlPDF: data.urlPDF,
    published: false,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, [action.name]: action.value };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function PaperForm({ paper }) {
  const [state, dispatch] = useReducer(
    reducer,
    paper ? paper.data() : INITIAL_STATE,
    init
  );
  const firebase = useFirebase();
  const authUser = firebase.authUser;
  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const history = useHistory();
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const searcher = useSearch('papers');

  function handleChange(event) {
    dispatch({
      type: 'SET_VALUE',
      name: event.target.name,
      value: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      // search for already published papers and if it exists don't save it
      setLoading(true);
      await searcher.search(state.title);
      if (
        !paper &&
        searcher.hits.length > 0 &&
        searcher.hits.find(
          hit =>
            hit.title.trim().toLowerCase() === state.title.trim().toLowerCase()
        )
      ) {
        throw new Error('The paper has already been submitted');
      }

      // if it does not exist save it
      const data = {
        ...state,
        authors: state.authors.split(',').map(s => s.trim()),
      };
      let doc;
      let message;
      let snapshot;
      if (paper) {
        data.updatedAt = firebase.FieldValue.serverTimestamp();
        data.updatedBy = authUser.uid;
        doc = await firebase.updatePaper(paper.id, data);
        await algolia.updatePaper(doc.id, data);
        message = 'The paper has been updated';
      } else {
        data.createdAt = firebase.FieldValue.serverTimestamp();
        data.createdBy = authUser.uid;
        doc = await firebase.addPaper(data);
        snapshot = await doc.get();
        await algolia.savePaper(doc.id, snapshot.data());
        message = 'The paper has been submitted';
      }
      addToast(message, { appearance: 'success' });
      history.push(
        `/users/${
          paper ? paper.get('createdBy') : snapshot.get('createdBy')
        }/papers/${doc.id}`
      );
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
      setLoading(false);
    }
  }

  function showPapers(event) {
    searcher.search(event.target.value);
  }

  // settimeout may fire after unmount so prevent this situation
  let willUnmount = useRef(false);
  useEffect(() => {
    willUnmount.current = false;
    return () => {
      willUnmount.current = true;
    };
  });
  function handleBlur() {
    setTimeout(() => {
      if (!willUnmount.current) {
        setFocused(false);
      }
    }, 300);
  }

  return (
    <>
      <h1>{paper ? 'Edit Paper' : 'Submit Paper'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group position-relative">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            onChange={event => {
              handleChange(event);
              showPapers(event);
            }}
            value={state.title}
            required
            onBlur={handleBlur}
            onFocus={() => setFocused(true)}
            autoComplete="off"
          />
          {focused && (
            <div className="list-group position-absolute w-100 mt-1">
              {searcher.loading && (
                <div className="list-group-item search-item">
                  <Spinner />
                </div>
              )}
              {searcher.hits.length > 0 && (
                <>
                  <a
                    href="#papers"
                    className="list-group-item list-group-item-action disabled"
                    tabIndex="-1"
                    aria-disabled="true"
                  >
                    Already Submitted Papers
                  </a>
                  {searcher.hits.map(hit => (
                    <Link
                      key={hit.objectID}
                      className="list-group-item list-group-item-action"
                      to={`/papers/${hit.objectID}`}
                    >
                      {hit.title}
                    </Link>
                  ))}
                </>
              )}
              {searcher.hits.length > 0 && (
                <div className="list-group-item list-group-item-light text-right">
                  <small>
                    Search by{' '}
                    <a
                      className="text-black-50"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://algolia.com"
                    >
                      Algolia
                    </a>
                  </small>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="abstract">Abstract</label>
          <textarea
            className="form-control"
            id="abstract"
            name="abstract"
            onChange={handleChange}
            value={state.abstract}
            required
            rows="5"
          />
        </div>
        <div className="form-group">
          <label htmlFor="authors">Author(s) of the paper</label>
          <input
            type="text"
            className="form-control"
            id="authors"
            name="authors"
            aria-describedby="authorsHelp"
            onChange={handleChange}
            value={state.authors}
            required
          />
          <small id="authorsHelp" className="form-text text-muted">
            Comma seperated authors of the paper
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="urlAbstract">URL to abstract</label>
          <input
            type="url"
            className="form-control"
            id="urlAbstract"
            name="urlAbstract"
            value={state.urlAbstract}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="urlPDF">
            URL to PDF <span className="text-muted">(optional)</span>
          </label>
          <input
            type="url"
            className="form-control"
            id="urlPDF"
            name="urlPDF"
            onChange={handleChange}
            value={state.urlPDF}
          />
        </div>
        <Button loading={loading}>{paper ? 'Save' : 'Submit'}</Button>
      </form>
    </>
  );
}

export default PaperForm;
