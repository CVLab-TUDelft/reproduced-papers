import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  useFirebase,
  useRequest,
  useCollection,
  useReprodActions,
} from '../hooks';
import DeleteDialog from './DeleteDialog';
import ReprodCard from './ReprodCard';
import Button from './Button';
import { LIMIT } from '../constants';

// params should be outside of the component
// otherwise useMemo
const params = { limit: LIMIT };

function Home() {
  const firebase = useFirebase();

  // fetch reproductions
  const { data, loading, hasMore, fetchMore } = useRequest(
    firebase.getReprods,
    params
  );
  const [state, dispatch] = useCollection(data);
  const { byId, ids } = state;

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

  return (
    ids.length > 0 && (
      <>
        <h1>
          <Link
            className="btn btn-primary float-right"
            to="/submit-reproduction"
          >
            Submit Reproduction
          </Link>
          <span>Reproductions</span>
        </h1>
        {ids.map((id, index) => (
          <ReprodCard
            key={id}
            reprod={byId[id].doc}
            onDeleteClick={() => setForDelete(id)}
            onStatusChange={status => handleStatusChange(id, status)}
            forHome={true}
          />
        ))}
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
      </>
    )
  );
}

export default Home;
