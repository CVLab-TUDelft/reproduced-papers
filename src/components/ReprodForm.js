import React, { useReducer, useState, Fragment } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory, Link } from 'react-router-dom';
import { get, setWith, cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import Button from './Button';
import TableEditor from './TableEditor';
import Image from './Image';
import { useFirebase, useAlgolia } from '../hooks';
import { BADGES } from '../constants';

const INITIAL_STATE = {
  title: '',
  description: '',
  authors: [],
  imagePath: '',
  imageUrl: '',
  urlBlog: '',
  urlCode: '',
  visibility: 'public',
  badges: [],
  tables: {},
  tableValues: {},
  status: 'pending',
};

function init(data) {
  return {
    title: data.title,
    description: data.description,
    authors: Array.isArray(data.authors)
      ? data.authors.join(', ')
      : data.authors,
    imagePath: data.imagePath,
    imageUrl: data.imageUrl,
    urlBlog: data.urlBlog,
    urlCode: data.urlCode,
    visibility: data.visibility,
    badges: data.badges,
    tables: data.tables,
    tableValues: data.tableValues,
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

const INITIAL_COL = {
  name: '',
  type: 'numeric',
  best: 'highest',
};

const INITIAL_ROW = {
  name: '',
};

const INITIAL_TABLE = {
  title: '',
  cols: { '0': { ...INITIAL_COL } },
  rows: { '0': { ...INITIAL_ROW } },
  values: { '0': { '0': '' } },
};

function ReprodForm({ paper, paperTables = {}, reprod }) {
  const [state, dispatch] = useReducer(
    reducer,
    reprod ? { ...INITIAL_STATE, ...reprod.data() } : INITIAL_STATE,
    init
  );
  const {
    title,
    description,
    authors,
    imagePath,
    imageUrl,
    urlBlog,
    urlCode,
    visibility,
    badges,
    tables,
    tableValues,
  } = state;

  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const history = useHistory();
  const paperId = paper.id;
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);

  const paperData = paper.data();
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
    const nextValues = { ...tableValues };
    setWith(nextValues, [key, rowKey, colKey], event.target.value, Object);
    dispatch({
      type: 'SET',
      name: 'tableValues',
      value: nextValues,
    });
  }

  function convertNumbers(values, tableKey) {
    const allTables = { ...tables, ...paperTables };
    const validatedValues = cloneDeep(values);
    for (const rowKey in validatedValues) {
      const row = validatedValues[rowKey];
      for (const colKey in row) {
        if (allTables[tableKey].cols[colKey].type === 'numeric') {
          row[colKey] = parseFloat(row[colKey]);
        }
      }
    }
    return validatedValues;
  }

  function loadImage(event) {
    const file = event.target.files[0];
    let error;
    if (!file.type.match(/^image\/*/)) {
      error = 'Selected file should be an image file.';
    }
    if (file.size > 2 * 1024 * 1024) {
      error = 'Selected file size should be less than 2MB.';
    }
    if (error) {
      addToast(error, {
        appearance: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setImage(event.target.result);
      setFile(file);
    };
    reader.onerror = event => {
      addToast('Selected file could not read.', {
        appearance: 'error',
      });
      reader.abort();
    };
    reader.readAsDataURL(file);
  }

  async function uploadImage(file) {
    const storageRef = firebase.storage.ref();

    // delete old photo if exists
    if (imagePath) {
      const oldFileRef = storageRef.child(imagePath);
      await oldFileRef.delete().then(
        () => {},
        error => error
      );
    }

    // upload photo if exists
    const userId = firebase.authUser.uid;
    const filePath = `${userId}/images/reprods/${uuidv4()}`;
    const fileRef = storageRef.child(filePath);
    const snapshot = await fileRef.put(file);
    const fileUrl = await snapshot.ref.getDownloadURL();
    return { filePath, fileUrl };
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
      table.values = convertNumbers(table.values, tableKey);
    }
    const validatedTableValues = cloneDeep(tableValues);
    for (const tableKey in validatedTableValues) {
      const values = validatedTableValues[tableKey];
      validatedTableValues[tableKey] = convertNumbers(values, tableKey);
    }
    try {
      setLoading(true);

      const reprodData = {
        ...state,
        tables: validatedTables,
        tableValues: validatedTableValues,
        authors: authors.split(',').map(s => s.trim()),
        paperId,
      };

      // first upload image
      if (file) {
        const { filePath, fileUrl } = await uploadImage(file);
        reprodData.imagePath = filePath;
        reprodData.imageUrl = fileUrl;
      }

      let doc;
      let message;
      let snapshot;

      if (reprod) {
        doc = await firebase.updateReprod(paperId, reprod.id, reprodData);
        await algolia.updateReprod(doc.id, reprodData);
        message = 'Reproduction has been updated';
      } else {
        doc = await firebase.addReprod(paperId, reprodData);
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

  // Table releated functions
  function addTable() {
    const keys = Object.keys(tables);
    if (keys.length > 0 && !tables[keys[keys.length - 1]].title) {
      addToast('Fill in the added table(s) first', { appearance: 'warning' });
      return;
    }
    const key = uuidv4();
    const nextTables = { ...tables, [key]: cloneDeep(INITIAL_TABLE) };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function removeTable(key) {
    const nextTables = { ...tables };
    delete nextTables[key];
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function handleTableChange(key, table) {
    const nextTables = {
      ...tables,
      [key]: table,
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  return (
    <>
      <h1>{reprod ? 'Edit Reproduction' : 'Submit Reproduction'}</h1>
      <h4>
        for <Link to={`/papers/${paperId}`}>{paperData.title}</Link>
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
          <label htmlFor="image">
            Image <span className="text-muted">(optional)</span>
          </label>
          <div className="custom-file">
            <input
              type="file"
              id="image"
              name="image"
              aria-describedby="imageHelp"
              onChange={loadImage}
              className="custom-file-input"
            />
            <label className="custom-file-label" htmlFor="image">
              {file ? 'Selected' : 'Choose file'}
            </label>
          </div>
          <small id="imageHelp" className="form-text text-muted">
            An image to describe the reproduction. It should have 4/3 aspect
            ratio at best.
          </small>
          <Image
            src={image || imageUrl}
            className="img-thumbnail mt-2"
            style={{
              width: '400px',
              height: '300px',
            }}
          />
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
          <legend className="col-form-label">Visibility</legend>
          <div className="form-check">
            <input
              className="form-check-input"
              id="publicRadio"
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === 'public'}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="publicRadio">
              Public
              <br />
              <small className="form-text text-muted">
                Everyone can see this reproduction.
              </small>
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              id="privateRadio"
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === 'private'}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="privateRadio">
              Private
              <br />
              <small className="form-text text-muted">
                Only you and the administrators can see this reproduction.
              </small>
            </label>
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
        <div className="form-group">
          <label htmlFor="tables">
            Comparison Table(s) <span className="text-muted">(optional)</span>
          </label>
          <small className="form-text text-muted mb-2">
            Fill in the tables which have comparable results with your results.
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
                    {Object.keys(paperTables[key].rows).map((rowKey, index) => (
                      <tr key={`row${key}_${rowKey}`}>
                        {index === 0 && (
                          <th
                            className="align-middle"
                            rowSpan={Object.keys(paperTables[key].rows).length}
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
                    ))}
                    {Object.keys(paperTables[key].rows).map((rowKey, index) => (
                      <tr key={`row${key}_${rowKey}`}>
                        {index === 0 && (
                          <th
                            className="align-middle"
                            rowSpan={Object.keys(paperTables[key].rows).length}
                          >
                            The reproduction
                          </th>
                        )}
                        <th>{paperTables[key].rows[rowKey].name}</th>
                        {Object.keys(paperTables[key].cols).map(colKey => (
                          <td key={`value${key}_${rowKey}_${colKey}`}>
                            <input
                              type={
                                paperTables[key].cols[colKey].type === 'numeric'
                                  ? 'number'
                                  : 'text'
                              }
                              step="any"
                              className="form-control form-control-sm"
                              style={{ minWidth: '75px' }}
                              name="value"
                              onChange={event =>
                                handleValueChange(key, rowKey, colKey, event)
                              }
                              value={get(
                                tableValues,
                                [key, rowKey, colKey],
                                ''
                              )}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Fragment>
          ))}
        </div>
        <div className="form-group">
          <label htmlFor="tables">
            New Comparison Table(s){' '}
            <span className="text-muted">(optional)</span>
          </label>
          <small className="form-text text-muted mb-2">
            If there is no existing table relating to your results, you can add
            new tables.
          </small>
          {Object.keys(tables || {}).map(key => (
            <TableEditor
              key={key}
              tableKey={key}
              table={tables[key]}
              values={tableValues[key]}
              onTableChange={table => handleTableChange(key, table)}
              onValueChange={(...params) => handleValueChange(key, ...params)}
              onRemoveClick={() => removeTable(key)}
            />
          ))}
          <div>
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={addTable}
            >
              Add Table
            </button>
          </div>
        </div>
        <Button loading={loading}>{reprod ? 'Save' : 'Submit'}</Button>
      </form>
    </>
  );
}

export default ReprodForm;
