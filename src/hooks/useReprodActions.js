import { useToasts } from 'react-toast-notifications';

import { useFirebase, useAlgolia } from './';

export default function useReprodActions() {
  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();

  async function doStatusUpdate(id, paperId, status) {
    try {
      const data = { status };
      const doc = await firebase.updateReprod(paperId, id, data);
      await algolia.updateReprod(id, data);
      addToast(`The reproduction was ${status}`, { appearance: 'success' });
      return await doc.get();
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
      throw error;
    }
  }

  async function doDelete(id, paperId) {
    try {
      await firebase.deleteReprod(paperId, id);
      await algolia.deleteReprod(id);
      addToast('The reproduction was deleted', { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
      throw error;
    }
  }

  return { doStatusUpdate, doDelete };
}
