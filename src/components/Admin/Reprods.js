import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  useFirebase,
  useRequest,
  useCollection,
  useReprodActions,
} from '../../hooks';
import Button from '../Button';
import DeleteDialog from '../DeleteDialog';
import Dialog from '../Dialog';
import { LIMIT } from '../../constants';
import StatusDropdown from '../StatusDropdown';

const filters = {
  all: 'All',
  pending: 'Pending',
  rejected: 'Rejected',
  published: 'Published',
};
const defaultFilter = 'all';
function getFilteredIds(filter, state) {
  if (filter === 'all') {
    return state.ids;
  }
  return state.ids.filter(
    id =>
      (filter === 'pending' && state.byId[id].status === 'pending') ||
      (filter === 'rejected' && state.byId[id].status === 'rejected') ||
      (filter === 'published' && state.byId[id].status === 'published')
  );
}

// params should be outside of the component
// otherwise useMemo
const params = { limit: LIMIT };

function Reprods() {
  const firebase = useFirebase();
  const { data, loading, hasMore, fetchMore } = useRequest(
    firebase.getReprods,
    params
  );
  const [state, dispatch] = useCollection(data);
  const { byId } = state;

  const { doStatusUpdate, doDelete } = useReprodActions();
  async function handleStatusChange(id, status) {
    try {
      const doc = await doStatusUpdate(id, byId[id].paperId, status);
      dispatch({ type: 'SET', id, doc });
    } catch (error) {}
  }

  const [forDelete, setForDelete] = useState(null);
  async function handleDelete(id) {
    try {
      await doDelete(id, byId[id].paperId);
      setForDelete(null);
      dispatch({ type: 'DELETE', id });
    } catch (error) {}
  }

  const [forDetail, setForDetail] = useState(null);

  const { hash } = useLocation();
  const [filter, setFilter] = useState(hash ? hash.substr(1) : defaultFilter);
  let filteredIds = getFilteredIds(filter, state);

  return (
    <>
      <ul className="nav nav-pills mb-3">
        {Object.keys(filters).map(key => (
          <li key={key} className="nav-item">
            <a
              className={`nav-link${key === filter ? ' active' : ''}`}
              onClick={() => setFilter(key)}
              href={`#${filter}`}
            >
              {filters[key]}
            </a>
          </li>
        ))}
      </ul>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Reproduction ID</th>
              <th>Title</th>
              <th>Author(s)</th>
              <th>Paper ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIds.map(id => (
              <tr key={id}>
                <td>
                  <Link to={`/papers/${byId[id].paperId}#${id}`}>{id}</Link>
                </td>
                <td>{byId[id].title}</td>
                <td>{byId[id].authors.join(', ')}</td>
                <td>
                  <Link to={`/papers/${byId[id].paperId}`}>
                    {byId[id].paperId}
                  </Link>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <Button
                      className="btn btn-secondary"
                      onClick={() => setForDetail(id)}
                    >
                      Detail
                    </Button>
                    <Link
                      className="btn btn-primary"
                      to={`/admin/reproductions/${byId[id].paperId}/${id}/edit`}
                    >
                      Edit
                    </Link>
                    <Button
                      className="btn btn-danger"
                      onClick={() => setForDelete(id)}
                    >
                      Delete
                    </Button>
                    <StatusDropdown
                      status={byId[id].status}
                      onStatusChange={status => handleStatusChange(id, status)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hasMore && (
          <div className="text-center mb-3">
            <Button type="button" loading={loading} onClick={fetchMore}>
              More
            </Button>
          </div>
        )}
        <DeleteDialog
          isOpen={!!forDelete}
          onDelete={() => handleDelete(forDelete)}
          onToggle={() => setForDelete(null)}
          itemName={forDelete && byId[forDelete].title}
        />
        <Dialog
          isOpen={!!forDetail}
          onToggle={() => setForDetail(null)}
          title={forDetail && byId[forDetail].title}
          size="xl"
        >
          {forDetail && (
            <dl>
              <dt>Reprod ID</dt>
              <dd>
                <Link to={`/papers/${byId[forDetail].paperId}#${forDetail}`}>
                  {forDetail}
                </Link>
              </dd>
              <dt>Description</dt>
              <dd>{byId[forDetail].description}</dd>
              <dt>Author(s)</dt>
              <dd>{byId[forDetail].authors.join(', ')}</dd>
              {byId[forDetail].urlBlog && (
                <>
                  <dt>URL to blog post</dt>
                  <dd>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={byId[forDetail].urlBlog}
                    >
                      {byId[forDetail].urlBlog}
                    </a>
                  </dd>
                </>
              )}
              <dt>URL to code</dt>
              <dd>
                {byId[forDetail].urlCode && (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://github.com/${byId[forDetail].urlCode}`}
                  >
                    {byId[forDetail].urlCode}
                  </a>
                )}
              </dd>
              <dt>Submitted by</dt>
              <dd>
                <Link to={`/users/${byId[forDetail].createdBy}`}>
                  {byId[forDetail].createdBy}
                </Link>
              </dd>
              <dt>Submitted at</dt>
              <dd>{byId[forDetail].createdAt.toDate().toString()}</dd>
              {byId[forDetail].updatedBy && (
                <>
                  <dt>Updated by</dt>
                  <dd>
                    <Link to={`/users/${byId[forDetail].updatedBy}`}>
                      {byId[forDetail].updatedBy}
                    </Link>
                  </dd>
                  <dt>Updated at</dt>
                  <dd>{byId[forDetail].updatedAt.toDate().toString()}</dd>
                </>
              )}
            </dl>
          )}
        </Dialog>
      </div>
    </>
  );
}

export default Reprods;
