import React, { useCallback, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Link } from 'react-router-dom';

import {
  useFirebase,
  useRequest,
  useCollection,
  usePaperActions,
} from '../../hooks';
import Button from '../Button';
import DeleteDialog from '../DeleteDialog';

function Papers({ user, me }) {
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
  );

  // fetch user's papers
  const userPaperFetcher = useCallback(() => firebase.getUserPapers(user.id), [
    user.id,
    firebase,
  ]);
  const { data, loading } = useRequest(userPaperFetcher, onError);
  const [state, dispatch] = useCollection(data);
  const { byId, ids } = state;

  function handleMoreClick() {
    // TODO
  }

  const { doTogglePublish, doDelete } = usePaperActions();
  async function handlePublishClick(id) {
    try {
      const data = await doTogglePublish(id, byId[id]);
      dispatch({ type: 'SET', id, data });
    } catch (error) {}
  }

  const [selected, setSelected] = useState(null);
  async function handleDelete(id) {
    try {
      await doDelete(id);
      setSelected(null);
      dispatch({ type: 'DELETE', id });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    }
  }

  const userRole = user.data().role;
  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Paper ID</th>
              <th>Title</th>
              <th>Author(s)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ids.map(id => (
              <tr key={id}>
                <td>
                  <Link to={`/papers/${id}`}>{id}</Link>
                </td>
                <td>{byId[id].title}</td>
                <td>{byId[id].authors.join(', ')}</td>
                <td>
                  <span
                    className={`badge badge-${
                      byId[id].published ? 'success' : 'secondary'
                    }`}
                  >
                    {byId[id].published ? 'Published' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    {(userRole === 'admin' || me) && (
                      <Link
                        className="btn btn-primary"
                        to={`/papers/${id}/edit`}
                      >
                        Edit
                      </Link>
                    )}
                    {(userRole === 'admin' || (me && !byId[id].published)) && (
                      <Button
                        className="btn btn-danger"
                        onClick={() => setSelected(id)}
                      >
                        Delete
                      </Button>
                    )}
                    {userRole === 'admin' && (
                      <Button
                        className="btn btn-success"
                        onClick={() => handlePublishClick(id)}
                      >
                        {byId[id].published ? 'Unpublish' : 'Publish'}
                      </Button>
                    )}
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

export default Papers;
