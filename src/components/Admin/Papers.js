import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  useFirebase,
  useRequest,
  useCollection,
  usePaperActions,
} from '../../hooks';
import Button from '../Button';
import DeleteDialog from '../DeleteDialog';
import Dialog from '../Dialog';
import { LIMIT } from '../../constants';

const filters = {
  all: 'All',
  unpublished: 'Unpublished',
  published: 'Published',
};
const defaultFilter = 'all';
function getFilteredIds(filter, state) {
  if (filter === 'all') {
    return state.ids;
  }
  return state.ids.filter(
    id =>
      (filter === 'published' && state.byId[id].published) ||
      (filter === 'unpublished' && !state.byId[id].published)
  );
}

// params should be outside of the component
// otherwise useMemo
const params = { limit: LIMIT };

function Papers() {
  const firebase = useFirebase();
  const { data, loading, hasMore, fetchMore } = useRequest(
    firebase.getPapers,
    params
  );
  const [state, dispatch] = useCollection(data);
  const { byId } = state;

  const { doTogglePublish, doDelete } = usePaperActions();
  async function handlePublishClick(id) {
    try {
      const doc = await doTogglePublish(id, byId[id]);
      dispatch({ type: 'SET', id, doc });
    } catch (error) {}
  }

  const [forDelete, setForDelete] = useState(null);
  async function handleDelete(id) {
    try {
      await doDelete(id);
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
              <th>Paper ID</th>
              <th>Title</th>
              <th>Author(s)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIds.map(id => (
              <tr key={id}>
                <td>
                  <Link to={`/papers/${id}`}>{id}</Link>
                </td>
                <td>{byId[id].title}</td>
                <td>{byId[id].authors.join(', ')}</td>
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
                      to={`/admin/papers/${id}/edit`}
                    >
                      Edit
                    </Link>
                    <Button
                      className="btn btn-danger"
                      onClick={() => setForDelete(id)}
                    >
                      Delete
                    </Button>
                    <Button
                      className="btn btn-success"
                      onClick={() => handlePublishClick(id)}
                    >
                      {byId[id].published ? 'Unpublish' : 'Publish'}
                    </Button>
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
              <dt>Paper ID</dt>
              <dd>
                <Link to={`/papers/${forDetail}`}>{forDetail}</Link>
              </dd>
              <dt>Abstract</dt>
              <dd>{byId[forDetail].abstract}</dd>
              <dt>Author(s)</dt>
              <dd>{byId[forDetail].authors.join(', ')}</dd>
              {byId[forDetail].urlAbstract && (
                <>
                  <dt>URL to abstract</dt>
                  <dd>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={byId[forDetail].urlAbstract}
                    >
                      {byId[forDetail].urlAbstract}
                    </a>
                  </dd>
                </>
              )}
              {byId[forDetail].urlPDF && (
                <>
                  <dt>URL to PDF</dt>
                  <dd>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={byId[forDetail].urlPDF}
                    >
                      {byId[forDetail].urlPDF}
                    </a>
                  </dd>
                </>
              )}
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
              {byId[forDetail].publishedBy && (
                <>
                  <dt>
                    {byId[forDetail].published ? 'Published' : 'Unpublished'} by
                  </dt>
                  <dd>
                    <Link to={`/users/${byId[forDetail].publishedBy}`}>
                      {byId[forDetail].publishedBy}
                    </Link>
                  </dd>
                  <dt>
                    {byId[forDetail].published ? 'Published' : 'Unpublished'} at
                  </dt>
                  <dd>{byId[forDetail].publishedAt.toDate().toString()}</dd>
                </>
              )}
            </dl>
          )}
        </Dialog>
      </div>
    </>
  );
}

export default Papers;
