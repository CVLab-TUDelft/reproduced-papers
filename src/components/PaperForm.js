import React, { useReducer, useState, useEffect, useRef } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';

import Button from './Button';
import Spinner from './Spinner';
import { useFirebase, useAlgolia, useSearch } from '../hooks';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, [action.name]: action.value };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function PaperForm() {
  const [state, dispatch] = useReducer(reducer, {
    title: '',
    abstract: '',
    authors: '',
    urlAbstract: '',
    urlPDF: '',
    published: false,
  });
  const firebase = useFirebase();
  const authUser = firebase.authUser;
  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const history = useHistory();
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    dispatch({
      type: 'SET_VALUE',
      name: event.target.name,
      value: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const paper = {
      ...state,
      authors: state.authors.split(',').map(s => s.trim()),
      createdAt: firebase.FieldValue.serverTimestamp(),
      createdBy: authUser.uid,
    };
    try {
      setLoading(true);
      const doc = await firebase.papers().add(paper);
      const snapshot = await doc.get();
      await algolia.addPaper({ ...snapshot.data(), objectID: doc.id });
      addToast('The paper was submitted', { appearance: 'success' });
      history.push(`/papers/${doc.id}`);
    } catch (err) {
      addToast(err.message, { appearance: 'error' });
      setLoading(false);
    }
  }

  const searcher = useSearch('papers');
  function showPapers() {
    searcher.search(state.title);
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
      <h1>Submit Paper</h1>
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
              showPapers();
            }}
            value={state.title}
            required
            onBlur={handleBlur}
            onFocus={() => setFocused(true)}
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
                    <div className="list-group-item" key={hit.objectID}>
                      {hit.title}
                    </div>
                  ))}
                </>
              )}
              {searcher.hits.length > 0 && (
                <div className="list-group-item text-black-50">
                  Search by{' '}
                  <a
                    className="text-black-50"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://algolia.com"
                  >
                    Algolia
                  </a>
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
          <label htmlFor="Authors">Authors</label>
          <input
            type="text"
            className="form-control"
            id="Authors"
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
          <label htmlFor="urlPDF">URL to PDF</label>
          <input
            type="url"
            className="form-control"
            id="urlPDF"
            name="urlPDF"
            onChange={handleChange}
            value={state.urlPDF}
            required
          />
        </div>
        <Button loading={loading} />
      </form>
    </>
  );
}

export default PaperForm;
