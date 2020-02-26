import { useToasts } from 'react-toast-notifications';

import { useFirebase, useAlgolia } from './';

export default function usePaperActions() {
  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();

  async function doStatusUpdate(id, status) {
    try {
      const data = { status };
      const doc = await firebase.updatePaper(id, data);
      await algolia.updatePaper(id, data);
      addToast(`The paper was ${status}`, { appearance: 'success' });
      return await doc.get();
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
      throw error;
    }
  }

  async function doDelete(id) {
    try {
      await firebase.deletePaper(id);
      await algolia.deletePaper(id);
      addToast('The paper was deleted', { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
      throw error;
    }
  }

  return { doStatusUpdate, doDelete };
}
