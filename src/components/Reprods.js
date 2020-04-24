import React, { useCallback, useState, useEffect } from 'react';

import {
  useFirebase,
  useRequest,
  useCollection,
  useReprodActions,
} from '../hooks';
import Spinner from './Spinner';
import DeleteDialog from './DeleteDialog';
import ReprodList from './ReprodList';

function Reprods({ paper, onReprodsFetched }) {
  const firebase = useFirebase();

  // fetch reproductions
  const reprodsFetcher = useCallback(() => firebase.getPaperReprods(paper.id), [
    paper.id,
    firebase,
  ]);
  const { data, loading } = useRequest(reprodsFetcher);
  const [state, dispatch] = useCollection(data);
  const { byId, ids } = state;

  useEffect(() => {
    onReprodsFetched(state);
  }, [state, onReprodsFetched]);

  const { doStatusUpdate, doDelete } = useReprodActions();
  async function handleStatusChange(id, status) {
    try {
      const doc = await doStatusUpdate(id, paper.id, status);
      dispatch({ type: 'SET', id, doc });
    } catch (error) {}
  }

  const [forDelete, setForDelete] = useState(null);
  async function handleDelete(id) {
    try {
      await doDelete(id, paper.id);
      setForDelete(null);
      dispatch({ type: 'DELETE', id });
    } catch (error) {}
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    ids.length > 0 && (
      <>
        <h3 className="mt-3">Reproductions</h3>
        <ReprodList
          {...state}
          onDeleteClick={setForDelete}
          onStatusChange={handleStatusChange}
        />
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

export default Reprods;
