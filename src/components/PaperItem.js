import React, { useState, Fragment } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { get } from 'lodash';

import { useFirebase, usePaperActions } from '../hooks';
import Reprods from './Reprods';
import DeleteDialog from './DeleteDialog';
import Button from './Button';
import StatusDropdown from './StatusDropdown';
import Badge from './Badge';

function findBests(tables, reprods, paperId) {
  let bests = {};
  if (!reprods) {
    return bests;
  }
  for (const tableKey in tables) {
    const table = tables[tableKey];
    for (const colKey in table.cols) {
      const col = table.cols[colKey];
      if (col.type === 'numeric') {
        const defaultVal = col.best === 'highest' ? -Infinity : Infinity;
        let vals = {};
        for (const rowKey in table.rows) {
          for (const reprodId in reprods.byId) {
            const val = parseFloat(
              get(reprods.byId, [
                reprodId,
                'tableValues',
                tableKey,
                rowKey,
                colKey,
              ])
            );
            vals[`${tableKey}_${rowKey}_${colKey}_${reprodId}`] = isNaN(val)
              ? defaultVal
              : val;
          }
          const val = parseFloat(table.values[rowKey][colKey]);
          vals[`${tableKey}_${rowKey}_${colKey}_${paperId}`] = isNaN(val)
            ? defaultVal
            : val;
        }
        const bestKey = Object.keys(vals).reduce((b, c) =>
          col.best === 'highest'
            ? vals[c] > vals[b]
              ? c
              : b
            : vals[c] < vals[b]
            ? c
            : b
        );
        bests[bestKey] = true;
      }
    }
  }
  return bests;
}

function PaperItem({ paper }) {
  const [data, setData] = useState(paper.data());
  const [reprods, setReprods] = useState(null);
  const firebase = useFirebase();
  const userId = get(firebase.authUser, 'uid');
  const userRole = get(firebase.authUser, 'profile.role');

  const { doStatusUpdate, doDelete } = usePaperActions();
  async function handleStatusChange(status) {
    try {
      const doc = await doStatusUpdate(paper.id, status);
      setData(doc.data());
    } catch (error) {}
  }

  const history = useHistory();
  const [open, setOpen] = useState(false);
  async function handleDelete() {
    try {
      await doDelete(paper.id);
      setOpen(false);
      history.push('/papers');
    } catch (error) {}
  }

  // find all tables
  const tables = reprods
    ? reprods.ids.reduce(
        (prev, curr) => ({ ...prev, ...reprods.byId[curr].tables }),
        {}
      )
    : {};
  const tableKeys = Object.keys(tables);

  // find all badges
  const badges = new Set();
  if (reprods) {
    reprods.ids.forEach(id =>
      get(reprods.byId[id], 'badges', []).forEach(badge => badges.add(badge))
    );
  }

  // find best values
  const bests = findBests(tables, reprods, paper.id);
  return (
    <>
      <div className="mb-2">
        {Array.from(badges).map(badgeKey => (
          <Badge key={badgeKey} badgeKey={badgeKey} />
        ))}
      </div>
      <h1>
        {data.title}
        <br />
        <small className="text-muted">by {data.authors.join(', ')}</small>
      </h1>
      <p>{data.abstract}</p>
      {tableKeys.length > 0 &&
        tableKeys.map((key, index) => (
          <Fragment key={key}>
            <div className="table-responsive d-flex justify-content-center">
              <table
                className="table table-bordered table-sm"
                style={{ width: 'auto' }}
              >
                <caption style={{ captionSide: 'top' }}>
                  {`Table ${index + 1}: ${tables[key].title}`}
                </caption>
                <thead>
                  <tr>
                    <th colSpan={2}></th>
                    {Object.keys(tables[key].cols).map(colKey => (
                      <th key={`name${key}_${colKey}`} className="align-bottom">
                        {tables[key].cols[colKey].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(tables[key].rows).map((rowKey, index) => (
                    <tr key={`row${key}_${rowKey}`}>
                      {index === 0 && (
                        <th
                          className="align-middle"
                          rowSpan={Object.keys(tables[key].rows).length}
                        >
                          The paper
                        </th>
                      )}
                      <th>{tables[key].rows[rowKey].name}</th>
                      {Object.keys(tables[key].cols).map(colKey => (
                        <td
                          key={`value${key}_${rowKey}_${colKey}`}
                          className={`${
                            bests[`${key}_${rowKey}_${colKey}_${paper.id}`]
                              ? 'font-weight-bold'
                              : ''
                          }`}
                        >
                          {tables[key].values[rowKey][colKey]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {reprods &&
                    reprods.ids.map((reprodId, reprodIndex) =>
                      Object.keys(tables[key].rows).map(
                        (rowKey, index) =>
                          get(reprods.byId[reprodId], ['tableValues', key]) && (
                            <tr key={`row${key}_${rowKey}`}>
                              {index === 0 && (
                                <th
                                  className="align-middle"
                                  rowSpan={Object.keys(tables[key].rows).length}
                                >
                                  <a
                                    href={`#${reprods.byId[reprodId].id}`}
                                  >{`Reproduction #${reprodIndex + 1}`}</a>
                                </th>
                              )}
                              <th>{tables[key].rows[rowKey].name}</th>
                              {Object.keys(tables[key].cols).map(colKey => (
                                <td
                                  key={`value${key}_${rowKey}_${colKey}`}
                                  className={`${
                                    bests[
                                      `${key}_${rowKey}_${colKey}_${reprodId}`
                                    ]
                                      ? 'font-weight-bold'
                                      : ''
                                  }`}
                                >
                                  {get(reprods.byId[reprodId], [
                                    'tableValues',
                                    key,
                                    rowKey,
                                    colKey,
                                  ]) || '-'}
                                </td>
                              ))}
                            </tr>
                          )
                      )
                    )}
                </tbody>
              </table>
            </div>
          </Fragment>
        ))}
      <div
        className="btn-toolbar"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div
          className="btn-group mr-2 mb-2"
          role="group"
          aria-label="View group"
        >
          <a
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
            href={data.urlAbstract}
          >
            Abstract
          </a>
          {data.urlPDF && (
            <a
              className="btn btn-success"
              target="_blank"
              rel="noopener noreferrer"
              href={data.urlPDF}
            >
              PDF
            </a>
          )}
          {data.urlCode && (
            <a
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              href={data.urlCode}
            >
              Code
            </a>
          )}
        </div>
        <div
          className="btn-group mr-2 mb-2"
          role="group"
          aria-label="Add group"
        >
          <Link
            className="btn btn-primary"
            to={`/papers/${paper.id}/submit-reproduction`}
          >
            Add Reproduction
          </Link>
        </div>
        {(userRole === 'admin' || userId === data.createdBy) && (
          <div className="btn-group mb-2" role="group" aria-label="Edit group">
            {(userRole === 'admin' || data.status !== 'published') && (
              <>
                <Link
                  className="btn btn-success"
                  to={`/papers/${paper.id}/edit`}
                >
                  Edit
                </Link>
                <Button
                  className="btn btn-danger"
                  onClick={() => setOpen(true)}
                >
                  Delete
                </Button>
              </>
            )}
            {userRole === 'admin' && (
              <StatusDropdown
                status={data.status}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        )}
      </div>
      <DeleteDialog
        isOpen={open}
        onDelete={handleDelete}
        onToggle={() => setOpen(false)}
        itemName={data.title}
      />
      <Reprods paper={paper} onReprodsFetched={setReprods} />
    </>
  );
}

export default PaperItem;
