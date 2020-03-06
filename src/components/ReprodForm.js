import React, { useReducer, useState, Fragment } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory, Link } from 'react-router-dom';
import { get, setWith, cloneDeep } from 'lodash';

import Button from './Button';
import { useFirebase, useAlgolia } from '../hooks';
import { BADGES } from '../constants';

const INITIAL_STATE = {
  title: '',
  description: '',
  authors: [],
  urlBlog: '',
  urlCode: '',
  badges: [],
  tables: {},
  status: 'pending',
};

function init(data) {
  return {
    title: data.title,
    description: data.description,
    authors: Array.isArray(data.authors)
      ? data.authors.join(', ')
      : data.authors,
    urlBlog: data.urlBlog,
    urlCode: data.urlCode,
    badges: data.badges,
    tables: data.tables,
    status: 'pending',
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.name]: action.value };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function ReprodForm({ paper, reprod }) {
  const [state, dispatch] = useReducer(
    reducer,
    reprod ? { ...INITIAL_STATE, ...reprod.data() } : INITIAL_STATE,
    init
  );
  const {
    title,
    description,
    authors,
    urlBlog,
    urlCode,
    badges,
    tables,
  } = state;

  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const history = useHistory();
  const paperId = paper.id;
  const [loading, setLoading] = useState(false);

  const data = paper.data();
  const paperTables = data.tables || {};
  const paperTableKeys = Object.keys(paperTables);

  function handleChange(event) {
    dispatch({
      type: 'SET',
      name: event.target.name,
      value: event.target.value,
    });
  }

  function handleBadgeChange(event) {
    let nextBadges;
    if (event.target.checked) {
      nextBadges = [...badges, event.target.value];
    } else {
      nextBadges = badges.filter(badge => badge !== event.target.value);
    }
    dispatch({
      type: 'SET',
      name: 'badges',
      value: nextBadges,
    });
  }

  function handleValueChange(key, rowKey, colKey, event) {
    const nextTables = { ...tables };
    setWith(
      nextTables,
      [key, 'values', rowKey, colKey],
      event.target.value,
      Object
    );
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!urlCode.match(/[^\s]+\/[^\s]+/)) {
      addToast(
        <span>
          Github repository should be in format <b>username/repository</b>
        </span>,
        { appearance: 'error' }
      );
      return;
    }

    const validatedTables = cloneDeep(tables);
    for (const tableKey in validatedTables) {
      const table = validatedTables[tableKey];
      const values = table.values;
      for (const rowKey in values) {
        const row = values[rowKey];
        for (const colKey in row) {
          if (paperTables[tableKey].cols[colKey].type === 'numeric') {
            row[colKey] = parseFloat(row[colKey]);
          }
        }
      }
    }
    const data = {
      ...state,
      tables: validatedTables,
      authors: authors.split(',').map(s => s.trim()),
      paperId,
    };
    try {
      setLoading(true);
      let doc;
      let message;
      let snapshot;
      if (reprod) {
        doc = await firebase.updateReprod(paperId, reprod.id, data);
        await algolia.updateReprod(doc.id, data);
        message = 'Reproduction has been updated';
      } else {
        doc = await firebase.addReprod(paperId, data);
        snapshot = await doc.get();
        await algolia.saveReprod(doc.id, snapshot.data());
        message = 'Reproduction has been submitted';
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
            value={title}
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
            value={description}
            required
            rows="5"
          />
        </div>
        <div className="form-group">
          <label htmlFor="authors">Author(s) of the reproduction</label>
          <input
            type="text"
            className="form-control"
            id="authors"
            name="authors"
            aria-describedby="authorsHelp"
            onChange={handleChange}
            value={authors}
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
            value={urlBlog}
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
              <span className="input-group-text" id="urlCodeAddon">
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
              value={urlCode}
              required
              placeholder="username/repository"
            />
          </div>
        </div>
        <div className="form-group">
          <legend className="col-form-label">Badges</legend>
          {Object.keys(BADGES).map(key => (
            <div key={key} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={key}
                value={key}
                checked={badges.includes(key)}
                onChange={handleBadgeChange}
              />
              <label className="form-check-label" htmlFor={key}>
                <div className={`badge badge-${BADGES[key].color}`}>
                  {BADGES[key].label}
                </div>
                <small className="form-text text-muted">
                  {BADGES[key].description}
                </small>
              </label>
            </div>
          ))}
        </div>
        {paperTableKeys.length > 0 && (
          <div className="form-group">
            <label htmlFor="tables">
              Comparison Table(s) <span className="text-muted">(optional)</span>
            </label>
            <small className="form-text text-muted mb-2">
              There should be reproduced results to compare them quickly with
              the paper and the others reproductions.
            </small>
            {paperTableKeys.map((key, index) => (
              <Fragment key={key}>
                <div className="table-responsive">
                  <table
                    className="table table-bordered table-sm"
                    style={{ width: 'auto' }}
                  >
                    <caption style={{ captionSide: 'top' }}>
                      {`Table ${index + 1}: ${paperTables[key].title}`}
                    </caption>
                    <thead>
                      <tr>
                        <th colSpan={2}></th>
                        {Object.keys(paperTables[key].cols).map(colKey => (
                          <th
                            key={`name${key}_${colKey}`}
                            className="align-bottom"
                          >
                            {paperTables[key].cols[colKey].name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(paperTables[key].rows).map(
                        (rowKey, index) => (
                          <tr key={`row${key}_${rowKey}`}>
                            {index === 0 && (
                              <th
                                className="align-middle"
                                rowSpan={
                                  Object.keys(paperTables[key].rows).length
                                }
                              >
                                The paper
                              </th>
                            )}
                            <th>{paperTables[key].rows[rowKey].name}</th>
                            {Object.keys(paperTables[key].cols).map(colKey => (
                              <td key={`value${key}_${rowKey}_${colKey}`}>
                                {paperTables[key].values[rowKey][colKey]}
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                      {Object.keys(paperTables[key].rows).map(
                        (rowKey, index) => (
                          <tr key={`row${key}_${rowKey}`}>
                            {index === 0 && (
                              <th
                                className="align-middle"
                                rowSpan={
                                  Object.keys(paperTables[key].rows).length
                                }
                              >
                                The reproduction
                              </th>
                            )}
                            <th>{paperTables[key].rows[rowKey].name}</th>
                            {Object.keys(paperTables[key].cols).map(colKey => (
                              <td key={`value${key}_${rowKey}_${colKey}`}>
                                <input
                                  type={
                                    paperTables[key].cols[colKey].type ===
                                    'numeric'
                                      ? 'number'
                                      : 'text'
                                  }
                                  step="any"
                                  className="form-control form-control-sm"
                                  style={{ minWidth: '75px' }}
                                  name="value"
                                  onChange={event =>
                                    handleValueChange(
                                      key,
                                      rowKey,
                                      colKey,
                                      event
                                    )
                                  }
                                  value={get(
                                    tables,
                                    [key, 'values', rowKey, colKey],
                                    ''
                                  )}
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </Fragment>
            ))}
          </div>
        )}
        <Button loading={loading}>{reprod ? 'Save' : 'Submit'}</Button>
      </form>
    </>
  );
}

export default ReprodForm;
