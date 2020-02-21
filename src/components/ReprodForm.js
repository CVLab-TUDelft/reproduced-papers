import React, { useReducer, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory, Link } from 'react-router-dom';

import Button from './Button';
import { useFirebase, useAlgolia } from '../hooks';

const INITIAL_STATE = {
  title: '',
  description: '',
  authors: [],
  urlBlog: '',
  urlCode: '',
  published: false,
};

function init(data) {
  return {
    title: data.title,
    description: data.description,
    authors: data.authors.join(', '),
    urlBlog: data.urlBlog,
    urlCode: data.urlCode,
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

function ReprodForm({ paper, reprod }) {
  const [state, dispatch] = useReducer(
    reducer,
    reprod ? reprod.data() : INITIAL_STATE,
    init
  );
  const firebase = useFirebase();
  const authUser = firebase.authUser;
  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const history = useHistory();
  const paperId = paper.id;
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
    if (!state.urlCode.match(/[^\s]+\/[^\s]+/)) {
      addToast(
        <span>
          Github repository should be in format <b>username/repository</b>
        </span>,
        { appearance: 'error' }
      );
      return;
    }
    const data = {
      ...state,
      authors: state.authors.split(',').map(s => s.trim()),
      paperId,
    };
    try {
      setLoading(true);
      let doc;
      let message;
      let snapshot;
      if (reprod) {
        data.updatedAt = firebase.FieldValue.serverTimestamp();
        data.updatedBy = authUser.uid;
        doc = await firebase.updateReprod(paperId, reprod.id, data);
        await algolia.updateReprod(doc.id, data);
        message = 'The reproduction has been updated';
      } else {
        data.createdAt = firebase.FieldValue.serverTimestamp();
        data.createdBy = authUser.uid;
        doc = await firebase.addReprod(paperId, data);
        snapshot = await doc.get();
        await algolia.saveReprod(doc.id, snapshot.data());
        message = 'The reproduction has been submitted';
      }
      addToast(message, { appearance: 'success' });
      history.push(
        `/users/${
          reprod ? reprod.get('createdBy') : snapshot.get('createdBy')
        }/reproductions/${doc.id}`
      );
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
      setLoading(false);
    }
  }

  const data = paper.data();
  return (
    <>
      <h1>{reprod ? 'Edit Reproduction' : 'Submit Reproduction'}</h1>
      <h4>
        for <Link to={`/papers/${paperId}`}>{data.title}</Link>
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            onChange={handleChange}
            value={state.title}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            onChange={handleChange}
            value={state.description}
            required
            rows="5"
          />
        </div>
        <div className="form-group">
          <label htmlFor="Authors">Author(s)</label>
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
            Comma seperated authors of the reproduction
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="urlBlog">
            URL to blog post <span className="text-muted">(optional)</span>
          </label>
          <input
            type="url"
            className="form-control"
            id="urlBlog"
            name="urlBlog"
            aria-describedby="urlBlogHelp"
            value={state.urlBlog}
            onChange={handleChange}
          />
          <small id="urlBlogHelp" className="form-text text-muted">
            Url to a blog post or a paper if any that explains the reproduction
            procedure
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="urlCode">Github repository</label>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="urlCode-addon">
                https://github.com/
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              id="urlCode"
              name="urlCode"
              aria-describedby="urlCode-addon"
              onChange={handleChange}
              value={state.urlCode}
              required
            />
          </div>
        </div>
        <Button loading={loading}>{reprod ? 'Save' : 'Submit'}</Button>
      </form>
    </>
  );
}

export default ReprodForm;
