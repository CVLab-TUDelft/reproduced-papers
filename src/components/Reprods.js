import React, { useCallback, useState } from 'react';

import {
  useFirebase,
  useRequest,
  useCollection,
  useReprodActions,
} from '../hooks';
import Spinner from './Spinner';
import DeleteDialog from './DeleteDialog';
import ReprodList from './ReprodList';

function Reprods({ paper }) {
  const firebase = useFirebase();

  // fetch reproductions
  const reprodsFetcher = useCallback(() => firebase.getPaperReprods(paper.id), [
    paper.id,
    firebase,
  ]);
  const { data, loading } = useRequest(reprodsFetcher);
  const [state, dispatch] = useCollection(data);
  const { byId, ids } = state;

  const { doTogglePublish, doDelete } = useReprodActions();
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

  return loading ? (
    <Spinner />
  ) : (
    ids.length > 0 && (
      <>
        <h3 className="mt-3">Reproductions</h3>
        <ReprodList
          {...state}
          onDeleteClick={setForDelete}
          onPublishClick={handlePublishClick}
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
