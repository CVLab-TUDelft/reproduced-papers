import React, { useState } from 'react';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useAlgolia } from '../../hooks';
import Button from '../Button';

function Actions() {
  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();

  const [loading, setLoading] = useState({ paper: false, reprod: false });

  async function reindexPapers() {
    try {
      setLoading({ ...loading, paper: true });
      await algolia.paperIndex.clearObjects();
      const papers = await firebase.getPapers();
      for (const paper of papers) {
        await algolia.savePaper(paper.id, paper.data());
      }
      addToast('Papers have been reindexed', { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    } finally {
      setLoading({ ...loading, paper: false });
    }
  }

  async function reindexReprods() {
    try {
      setLoading({ ...loading, reprod: true });
      await algolia.reprodIndex.clearObjects();
      const reprods = await firebase.getReprods();
      for (const reprod of reprods) {
        await algolia.saveReprod(reprod.id, reprod.data());
      }
      addToast('Reproductions have been reindexed', {
        appearance: 'success',
      });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    } finally {
      setLoading({ ...loading, reprod: false });
    }
  }

  return (
    <>
      <div className="card">
        <h5 className="card-header">Search Index Actions</h5>
        <div className="card-body">
          <Button
            type="button"
            className="btn btn-primary"
            onClick={reindexPapers}
            loading={loading['paper']}
          >
            Reindex Papers
          </Button>{' '}
          <Button
            type="button"
            className="btn btn-primary"
            onClick={reindexReprods}
            loading={loading['reprod']}
          >
            Reindex Reproductions
          </Button>
        </div>
      </div>
    </>
  );
}

export default Actions;
