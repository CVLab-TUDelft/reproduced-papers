import React, {
  useReducer,
  useState,
  useEffect,
  useRef,
  Fragment,
} from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory, Link } from 'react-router-dom';
import { cloneDeep } from 'lodash';

import Button from './Button';
import Spinner from './Spinner';
import { useFirebase, useAlgolia, useSearch } from '../hooks';

const INITIAL_STATE = {
  title: '',
  abstract: '',
  authors: [],
  urlAbstract: '',
  urlPDF: '',
  tables: {},
  status: 'pending',
};

function init(data) {
  return {
    title: data.title,
    abstract: data.abstract,
    authors: Array.isArray(data.authors)
      ? data.authors.join(', ')
      : data.authors,
    urlAbstract: data.urlAbstract,
    urlPDF: data.urlPDF,
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

function PaperForm({ paper }) {
  const [state, dispatch] = useReducer(
    reducer,
    paper ? { ...INITIAL_STATE, ...paper.data() } : INITIAL_STATE,
    init
  );
  const { title, abstract, authors, urlAbstract, urlPDF, tables } = state;

  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const history = useHistory();
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const searcher = useSearch('papers');

  function handleChange(event) {
    dispatch({
      type: 'SET',
      name: event.target.name,
      value: event.target.value,
    });
  }

  function addTable() {
    const keys = Object.keys(tables);
    if (keys.length > 0 && !tables[keys[keys.length - 1]].title) {
      addToast('Fill in the added table(s) first', { appearance: 'warning' });
      return;
    }
    const key = keys.length > 0 ? parseInt(keys[keys.length - 1]) + 1 : 0;
    const nextTables = { ...tables, [key]: { ...INITIAL_TABLE } };
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

  function handleTableChange(key, event) {
    const nextTables = {
      ...tables,
      [key]: { ...tables[key], [event.target.name]: event.target.value },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function addCol(key) {
    const table = tables[key];
    const colKeys = Object.keys(table.cols);
    if (colKeys.length > 0 && !table.cols[colKeys[colKeys.length - 1]].name) {
      addToast('Fill in the added column(s) first', { appearance: 'warning' });
      return;
    }
    const colKey =
      colKeys.length > 0 ? parseInt(colKeys[colKeys.length - 1]) + 1 : 0;
    const cols = {
      ...table.cols,
      [colKey]: { ...INITIAL_COL },
    };
    const values = {};
    for (const rowKey in table.rows) {
      values[rowKey] = { ...table.values[rowKey], [colKey]: '' };
    }
    const nextTables = {
      ...tables,
      [key]: {
        ...table,
        cols,
        values,
      },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function removeCol(key, colKey) {
    const table = tables[key];
    const cols = { ...table.cols };
    delete cols[colKey];
    const values = {};
    for (const rowKey in table.values) {
      values[rowKey] = { ...table.values[rowKey] };
      delete values[rowKey][colKey];
    }
    const nextTables = {
      ...tables,
      [key]: {
        ...table,
        cols,
        values,
      },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function handleColValueChange(key, colKey, name, value) {
    const table = tables[key];
    const cols = {
      ...table.cols,
      [colKey]: {
        ...table.cols[colKey],
        [name]: value,
      },
    };
    const nextTables = {
      ...tables,
      [key]: {
        ...table,
        cols,
      },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function handleColChange(key, colKey, event) {
    handleColValueChange(key, colKey, event.target.name, event.target.value);
  }

  function addRow(key) {
    const table = tables[key];
    const rowKeys = Object.keys(table.rows);
    if (rowKeys.length > 0 && !table.rows[rowKeys[rowKeys.length - 1]].name) {
      addToast('Fill in the added row(s) first', { appearance: 'warning' });
      return;
    }
    const rowKey =
      rowKeys.length > 0 ? parseInt(rowKeys[rowKeys.length - 1]) + 1 : 0;
    const rows = {
      ...table.rows,
      [rowKey]: { ...INITIAL_ROW },
    };
    const values = { ...table.values };
    values[rowKey] = Object.keys(table.cols).reduce((row, colKey) => {
      row[colKey] = '';
      return row;
    }, {});
    const nextTables = {
      ...tables,
      [key]: {
        ...table,
        rows,
        values,
      },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function removeRow(key, rowKey) {
    const table = tables[key];
    const rows = { ...table.rows };
    delete rows[rowKey];
    const values = { ...table.values };
    delete values[rowKey];
    const nextTables = {
      ...tables,
      [key]: {
        ...table,
        rows,
        values,
      },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function handleRowValueChange(key, rowKey, name, value) {
    const table = tables[key];
    const rows = {
      ...table.rows,
      [rowKey]: {
        ...table.rows[rowKey],
        [name]: value,
      },
    };
    const nextTables = {
      ...tables,
      [key]: {
        ...table,
        rows,
      },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  function handleRowChange(key, rowKey, event) {
    handleRowValueChange(key, rowKey, event.target.name, event.target.value);
  }

  function handleValueChange(key, rowKey, colKey, event) {
    const table = tables[key];
    const values = { ...table.values };
    values[rowKey][colKey] = event.target.value;
    const nextTables = {
      ...tables,
      [key]: {
        ...table,
        values,
      },
    };
    dispatch({
      type: 'SET',
      name: 'tables',
      value: nextTables,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      // search for already published papers and if it exists don't save it
      setLoading(true);
      await searcher.search(title);
      if (
        !paper &&
        searcher.hits.length > 0 &&
        searcher.hits.find(
          hit => hit.title.trim().toLowerCase() === title.trim().toLowerCase()
        )
      ) {
        throw new Error('The paper has already been submitted');
      }

      // if it does not exist save it
      const validatedTables = cloneDeep(tables);
      for (const tableKey in validatedTables) {
        const table = validatedTables[tableKey];
        const values = table.values;
        for (const rowKey in values) {
          const row = values[rowKey];
          for (const colKey in row) {
            if (table.cols[colKey].type === 'numeric') {
              row[colKey] = parseFloat(row[colKey]);
            }
          }
        }
      }
      const data = {
        ...state,
        tables: validatedTables,
        authors: authors.split(',').map(s => s.trim()),
      };
      let doc;
      let message;
      let snapshot;
      if (paper) {
        doc = await firebase.updatePaper(paper.id, data);
        await algolia.updatePaper(doc.id, data);
        message = 'The paper has been updated';
      } else {
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
            value={title}
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
            value={abstract}
            required
            rows="10"
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
            value={authors}
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
            value={urlAbstract}
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
            value={urlPDF}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tables">
            Comparison Table(s) <span className="text-muted">(optional)</span>
          </label>
          <small className="form-text text-muted mb-2">
            There should be reproducible and comparable results in the tables
            that give readers a chance to take sneak peek of the results.
          </small>
          {Object.keys(tables || {}).map((key, index) => (
            <Fragment key={key}>
              <div className="form-row">
                <label
                  htmlFor={`title${key}`}
                  className="col-form-label mr-sm-2 mb-2"
                >
                  Table {index + 1}:
                </label>
                <div className="col-auto">
                  <input
                    type="text"
                    id={`title${key}`}
                    className="form-control mr-sm-2 mb-2"
                    style={{ display: 'inline', width: 'auto' }}
                    name="title"
                    onChange={event => handleTableChange(key, event)}
                    value={tables[key].title}
                    placeholder="Title"
                    required
                  />
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-outline-danger mr-sm-2 mb-2"
                    onClick={() => removeTable(key)}
                  >
                    Remove Table
                  </button>
                </div>
              </div>
              <div className="table-responsive">
                <table
                  className="table table-bordered table-sm"
                  style={{ width: 'auto' }}
                >
                  <thead>
                    <tr>
                      <th colSpan={2}></th>
                      {Object.keys(tables[key].cols).map(colKey => (
                        <td
                          key={`name${key}_${colKey}`}
                          className="align-bottom"
                        >
                          <div className="custom-control custom-radio">
                            <input
                              type="radio"
                              id={`numeric${key}_${colKey}`}
                              name={`type${key}_${colKey}`}
                              className="custom-control-input"
                              checked={
                                tables[key].cols[colKey].type === 'numeric'
                              }
                              onChange={() =>
                                handleColValueChange(
                                  key,
                                  colKey,
                                  'type',
                                  'numeric'
                                )
                              }
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={`numeric${key}_${colKey}`}
                            >
                              Numeric
                            </label>
                          </div>
                          {tables[key].cols[colKey].type === 'numeric' && (
                            <div className="ml-3">
                              <div className="custom-control custom-radio">
                                <input
                                  type="radio"
                                  id={`highest${key}_${colKey}`}
                                  name={`best${key}_${colKey}`}
                                  className="custom-control-input"
                                  checked={
                                    tables[key].cols[colKey].best === 'highest'
                                  }
                                  onChange={() =>
                                    handleColValueChange(
                                      key,
                                      colKey,
                                      'best',
                                      'highest'
                                    )
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor={`highest${key}_${colKey}`}
                                >
                                  Hightest best
                                </label>
                              </div>
                              <div className="custom-control custom-radio">
                                <input
                                  type="radio"
                                  id={`lowest${key}_${colKey}`}
                                  name={`best${key}_${colKey}`}
                                  className="custom-control-input"
                                  checked={
                                    tables[key].cols[colKey].best === 'lowest'
                                  }
                                  onChange={() =>
                                    handleColValueChange(
                                      key,
                                      colKey,
                                      'best',
                                      'lowest'
                                    )
                                  }
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor={`lowest${key}_${colKey}`}
                                >
                                  Lowest best
                                </label>
                              </div>
                            </div>
                          )}
                          <div className="custom-control custom-radio custom-radio-sm">
                            <input
                              type="radio"
                              id={`text${key}_${colKey}`}
                              name={`type${key}_${colKey}`}
                              className="custom-control-input"
                              checked={tables[key].cols[colKey].type === 'text'}
                              onChange={() =>
                                handleColValueChange(
                                  key,
                                  colKey,
                                  'type',
                                  'text'
                                )
                              }
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={`text${key}_${colKey}`}
                            >
                              Text
                            </label>
                          </div>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control form-control-sm d-inline"
                              name="name"
                              onChange={event =>
                                handleColChange(key, colKey, event)
                              }
                              value={tables[key].cols[colKey].name}
                              placeholder="Column header"
                              required
                            />
                            <div className="input-group-append">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeCol(key, colKey)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </td>
                      ))}
                      <th>
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm"
                          onClick={() => addCol(key)}
                        >
                          Add Column
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(tables[key].rows).map((rowKey, index) => (
                      <tr key={`row${key}_${rowKey}`}>
                        {index === 0 && (
                          <th
                            className="align-middle"
                            rowSpan={Object.keys(tables[key].rows).length + 1}
                          >
                            The paper
                          </th>
                        )}
                        <th>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control form-control-sm d-inline"
                              name="name"
                              onChange={event =>
                                handleRowChange(key, rowKey, event)
                              }
                              value={tables[key].rows[rowKey].name}
                              placeholder="Row header"
                              required
                            />
                            <div className="input-group-append">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeRow(key, rowKey)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </th>
                        {Object.keys(tables[key].cols).map(colKey => (
                          <td key={`value${key}_${rowKey}_${colKey}`}>
                            <input
                              type={
                                tables[key].cols[colKey].type === 'numeric'
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
                              value={tables[key].values[rowKey][colKey]}
                              required
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm"
                          onClick={() => addRow(key)}
                        >
                          Add Row
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Fragment>
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
        <Button loading={loading}>{paper ? 'Save' : 'Submit'}</Button>
      </form>
    </>
  );
}

export default PaperForm;
