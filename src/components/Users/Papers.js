import React, { useCallback, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Link, useParams } from 'react-router-dom';

import {
  useFirebase,
  useRequest,
  useCollection,
  usePaperActions,
} from '../../hooks';
import Button from '../Button';
import DeleteDialog from '../DeleteDialog';
import { LIMIT, STATUSES } from '../../constants';
import StatusDropdown from '../StatusDropdown';

// params should be outside of the component
// otherwise useMemo
const params = { limit: LIMIT };

function Papers({ user, me }) {
  const { paperId } = useParams();
  const firebase = useFirebase();
  const { addToast } = useToasts();

  // fetch user's papers
  const userPaperFetcher = useCallback(
    params => firebase.getUserPapers(user.id, params),
    [user.id, firebase]
  );
  const { data, loading, hasMore, fetchMore } = useRequest(
    userPaperFetcher,
    params
  );
  const [state, dispatch] = useCollection(data);
  const { byId, ids } = state;

  const { doStatusUpdate, doDelete } = usePaperActions();
  async function handleStatusChange(id, status) {
    try {
      const doc = await doStatusUpdate(id, status);
      dispatch({ type: 'SET', id, doc });
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

  const userRole = firebase.authUser.profile.role;
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
              <tr
                key={id}
                className={`${id === paperId ? 'table-primary ' : ''}`}
              >
                <td>
                  <Link to={`/papers/${id}`}>{id}</Link>
                </td>
                <td>{byId[id].title}</td>
                <td>{byId[id].authors.join(', ')}</td>
                <td>
                  <span
                    className={`badge badge-${
                      byId[id].status === 'pending'
                        ? 'secondary'
                        : byId[id].status === 'rejected'
                        ? 'warning'
                        : 'success'
                    }`}
                  >
                    {STATUSES[byId[id].status].label}
                  </span>
                </td>
                <td>
                  <div
                    className="btn-toolbar"
                    role="toolbar"
                    aria-label="Toolbar with button groups"
                  >
                    <div
                      className="btn-group mr-2 mb-2"
                      role="group"
                      aria-label="Add group"
                    >
                      <Link
                        className="btn btn-success"
                        to={`/papers/${id}/submit-reproduction`}
                      >
                        Add Reproduction
                      </Link>
                    </div>
                    <div
                      className="btn-group mb-2"
                      role="group"
                      aria-label="Edit group"
                    >
                      {(userRole === 'admin' ||
                        (me && byId[id].status !== 'published')) && (
                        <>
                          <Link
                            className="btn btn-primary"
                            to={`/papers/${id}/edit`}
                          >
                            Edit
                          </Link>
                          <Button
                            className="btn btn-danger"
                            onClick={() => setSelected(id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {userRole === 'admin' && (
                        <StatusDropdown
                          status={byId[id].status}
                          onStatusChange={status =>
                            handleStatusChange(id, status)
                          }
                        />
                      )}
                    </div>
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
