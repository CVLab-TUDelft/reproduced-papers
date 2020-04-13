import React, { Fragment } from 'react';
import { useToasts } from 'react-toast-notifications';
import { get } from 'lodash';

const INITIAL_COL = {
  name: '',
  type: 'numeric',
  best: 'highest',
};

const INITIAL_ROW = {
  name: '',
};

function TableEditor({
  tableKey,
  table,
  values,
  onTableChange,
  onValueChange,
  onRemoveClick,
}) {
  const { addToast } = useToasts();

  function handleTableChange(event) {
    onTableChange({ ...table, [event.target.name]: event.target.value });
  }

  function addCol() {
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
    onTableChange({
      ...table,
      cols,
      values,
    });
  }

  function removeCol(colKey) {
    const cols = { ...table.cols };
    delete cols[colKey];
    const values = {};
    for (const rowKey in table.values) {
      values[rowKey] = { ...table.values[rowKey] };
      delete values[rowKey][colKey];
    }
    onTableChange({
      ...table,
      cols,
      values,
    });
  }

  function handleColValueChange(colKey, name, value) {
    const cols = {
      ...table.cols,
      [colKey]: {
        ...table.cols[colKey],
        [name]: value,
      },
    };
    onTableChange({
      ...table,
      cols,
    });
  }

  function handleColChange(colKey, event) {
    handleColValueChange(colKey, event.target.name, event.target.value);
  }

  function addRow() {
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
    onTableChange({
      ...table,
      rows,
      values,
    });
  }

  function removeRow(rowKey) {
    const rows = { ...table.rows };
    delete rows[rowKey];
    const values = { ...table.values };
    delete values[rowKey];
    onTableChange({
      ...table,
      rows,
      values,
    });
  }

  function handleRowValueChange(rowKey, name, value) {
    const rows = {
      ...table.rows,
      [rowKey]: {
        ...table.rows[rowKey],
        [name]: value,
      },
    };
    onTableChange({
      ...table,
      rows,
    });
  }

  function handleRowChange(rowKey, event) {
    handleRowValueChange(rowKey, event.target.name, event.target.value);
  }

  function handleTableValueChange(rowKey, colKey, event) {
    const values = { ...table.values };
    values[rowKey][colKey] = event.target.value;
    onTableChange({ ...table, values });
  }

  return (
    <Fragment key={tableKey}>
      <div className="form-row mt-2">
        <div className="col-auto">
          <input
            type="text"
            id={`title${tableKey}`}
            className="form-control mr-sm-2 mb-2"
            style={{ display: 'inline', width: 'auto' }}
            name="title"
            onChange={event => handleTableChange(event)}
            value={table.title}
            placeholder="Title"
            required
          />
        </div>
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-outline-danger mr-sm-2 mb-2"
            onClick={onRemoveClick}
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
              {Object.keys(table.cols).map(colKey => (
                <td key={`col${tableKey}_${colKey}`} className="align-bottom">
                  <div className="custom-control custom-radio">
                    <input
                      type="radio"
                      id={`numeric${tableKey}_${colKey}`}
                      name={`type${tableKey}_${colKey}`}
                      className="custom-control-input"
                      checked={table.cols[colKey].type === 'numeric'}
                      onChange={() =>
                        handleColValueChange(colKey, 'type', 'numeric')
                      }
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`numeric${tableKey}_${colKey}`}
                    >
                      Numeric
                    </label>
                  </div>
                  {table.cols[colKey].type === 'numeric' && (
                    <div className="ml-3">
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          id={`highest${tableKey}_${colKey}`}
                          name={`best${tableKey}_${colKey}`}
                          className="custom-control-input"
                          checked={table.cols[colKey].best === 'highest'}
                          onChange={() =>
                            handleColValueChange(colKey, 'best', 'highest')
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor={`highest${tableKey}_${colKey}`}
                        >
                          Hightest best
                        </label>
                      </div>
                      <div className="custom-control custom-radio">
                        <input
                          type="radio"
                          id={`lowest${tableKey}_${colKey}`}
                          name={`best${tableKey}_${colKey}`}
                          className="custom-control-input"
                          checked={table.cols[colKey].best === 'lowest'}
                          onChange={() =>
                            handleColValueChange(colKey, 'best', 'lowest')
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor={`lowest${tableKey}_${colKey}`}
                        >
                          Lowest best
                        </label>
                      </div>
                    </div>
                  )}
                  <div className="custom-control custom-radio custom-radio-sm">
                    <input
                      type="radio"
                      id={`text${tableKey}_${colKey}`}
                      name={`type${tableKey}_${colKey}`}
                      className="custom-control-input"
                      checked={table.cols[colKey].type === 'text'}
                      onChange={() =>
                        handleColValueChange(colKey, 'type', 'text')
                      }
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`text${tableKey}_${colKey}`}
                    >
                      Text
                    </label>
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm d-inline"
                      name="name"
                      onChange={event => handleColChange(colKey, event)}
                      value={table.cols[colKey].name}
                      placeholder="Column header"
                      required
                    />
                    <div className="input-group-append">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeCol(colKey)}
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
                  onClick={() => addCol()}
                >
                  Add Column
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(table.rows).map((rowKey, index) => (
              <Fragment key={`row${tableKey}_${rowKey}`}>
                <tr>
                  <th className="align-middle">The paper</th>
                  <th>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm d-inline"
                        name="name"
                        onChange={event => handleRowChange(rowKey, event)}
                        value={table.rows[rowKey].name}
                        placeholder="Row header"
                        required
                      />
                      <div className="input-group-append">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeRow(rowKey)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </th>
                  {Object.keys(table.cols).map(colKey => (
                    <td key={`value${tableKey}_${rowKey}_${colKey}`}>
                      <input
                        type={
                          table.cols[colKey].type === 'numeric'
                            ? 'number'
                            : 'text'
                        }
                        step="any"
                        className="form-control form-control-sm"
                        style={{ minWidth: '75px' }}
                        name="value"
                        onChange={event =>
                          handleTableValueChange(rowKey, colKey, event)
                        }
                        value={table.values[rowKey][colKey]}
                        required
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="align-middle">The reproduction</th>
                  <th>{table.rows[rowKey].name}</th>
                  {Object.keys(table.cols).map(colKey => (
                    <td key={`value${tableKey}_${rowKey}_${colKey}`}>
                      <input
                        type={
                          table.cols[colKey].type === 'numeric'
                            ? 'number'
                            : 'text'
                        }
                        step="any"
                        className="form-control form-control-sm"
                        style={{ minWidth: '75px' }}
                        name="value"
                        onChange={event => onValueChange(rowKey, colKey, event)}
                        value={get(values, [rowKey, colKey], '')}
                      />
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
            <tr>
              <td>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={() => addRow()}
                >
                  Add Row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Fragment>
  );
}

export default TableEditor;
