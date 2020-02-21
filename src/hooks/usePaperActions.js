import { useToasts } from 'react-toast-notifications';

import { useFirebase, useAlgolia } from './';

export default function usePaperActions() {
  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();

  async function doTogglePublish(id, paper) {
    try {
      const published = !paper.published;
      const data = { published };
      if (published) {
        data.publishedAt = firebase.FieldValue.serverTimestamp();
        data.publishedBy = firebase.authUser.uid;
      }
      const doc = await firebase.updatePaper(id, data);
      await algolia.updatePaper(id, data);
      const message = published
        ? 'The paper was published'
        : 'The paper was unpublished';
      addToast(message, { appearance: 'success' });
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

  return { doTogglePublish, doDelete };
}
