import React, { useState } from 'react';

import {
  useFirebase,
  useRequest,
  useCollection,
  usePaperActions,
} from '../hooks';
import Button from './Button';
import DeleteDialog from './DeleteDialog';
import PaperList from './PaperList';
import { LIMIT } from '../constants';

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

  return (
    <>
      <h1>Papers</h1>
      <PaperList
        {...state}
        onDeleteClick={setForDelete}
        onPublishClick={handlePublishClick}
      />
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
  );
}

export default Papers;
