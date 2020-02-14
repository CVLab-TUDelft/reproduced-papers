import React, { useReducer } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory, Link } from 'react-router-dom';
import { escape } from 'lodash/fp';

import Button from './Button';
import { useFirebase, useAlgolia } from '../hooks';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, [action.name]: action.value };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function ReprodForm({ paper }) {
  const [state, dispatch] = useReducer(reducer, {
    title: '',
    description: '',
    authors: '',
    urlBlog: '',
    urlCode: '',
    publish: false,
  });
  const firebase = useFirebase();
  const authUser = firebase.authUser;
  console.log(authUser);

  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const history = useHistory();
  const paperId = paper.id;

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
    const reprod = {
      ...state,
      authors: state.authors.split(',').map(s => s.trim()),
      createdAt: firebase.FieldValue.serverTimestamp(),
      createdBy: authUser.uid,
    };
    try {
      const doc = await firebase.reprods(paperId).add(reprod);
      await algolia.addReprod({ ...reprod, objectID: doc.id, paperId });
      addToast('The reproduction was submitted', { appearance: 'success' });
      history.push(`/papers/${paperId}`);
    } catch (err) {
      addToast(err.message, { appearance: 'error' });
    }
  }

  const data = paper.data();
  return (
    <>
      <h1>Submit Reproduction</h1>
      <h4>
        for <Link to={`/papers/${paperId}`}>{escape(data.title)}</Link>
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
        <Button loading={false} />
      </form>
    </>
  );
}

export default ReprodForm;
