import React, { useCallback, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Link, useLocation } from 'react-router-dom';

import {
  useFirebase,
  useRequest,
  useCollection,
  useAlgolia,
} from '../../hooks';
import Button from '../Button';
import DeleteDialog from '../DeleteDialog';

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

function Reprods() {
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
  );
  const { data, loading } = useRequest(firebase.getReprods, onError);
  const [state, dispatch] = useCollection(data);
  const { byId } = state;

  function handleMoreClick() {
    // TODO
  }

  const algolia = useAlgolia();
  async function handlePublishClick(id) {
    try {
      const published = !byId[id].published;
      const data = { published };
      await firebase.updateReprod(byId[id].paperId, id, data);
      await algolia.updateReprod(id, data);
      dispatch({ type: 'SET', id, data });
      const message = published
        ? 'The reproduction was published'
        : 'The reproduction was unpublished';
      addToast(message, { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    }
  }

  const [selected, setSelected] = useState(null);
  async function handleDelete(id) {
    try {
      await firebase.deleteReprod(byId[id].paperId, id);
      await algolia.deleteReprod(id);
      setSelected(null);
      dispatch({ type: 'DELETE', id });
      addToast('The reproduction was deleted', { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    }
  }

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
                    <Link
                      className="btn btn-primary"
                      to={`/admin/reproductions/${byId[id].paperId}/${id}/edit`}
                    >
                      Edit
                    </Link>
                    <Button
                      className="btn btn-danger"
                      onClick={() => setSelected(id)}
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
        <div className="text-center mb-3">
          <Button type="button" loading={loading} onClick={handleMoreClick}>
            More
          </Button>
        </div>
        <DeleteDialog
          isOpen={!!selected}
          onDelete={() => handleDelete(selected)}
          onToggle={() => setSelected(null)}
          itemName={selected && byId[selected].title}
        />
      </div>
    </>
  );
}

export default Reprods;
