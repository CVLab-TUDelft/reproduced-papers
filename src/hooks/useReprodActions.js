import { useToasts } from 'react-toast-notifications';

import { useFirebase, useAlgolia } from './';

export default function useReprodActions() {
  const firebase = useFirebase();
  const algolia = useAlgolia();
  const { addToast } = useToasts();

  async function doTogglePublish(id, reprod) {
    try {
      const published = !reprod.published;
      const data = { published };
      if (published) {
        data.publishedAt = firebase.FieldValue.serverTimestamp();
        data.publishedBy = firebase.authUser.uid;
      }
      await firebase.updateReprod(reprod.paperId, id, data);
      await algolia.updateReprod(id, data);
      const message = published
        ? 'The reproduction was published'
        : 'The reproduction was unpublished';
      addToast(message, { appearance: 'success' });
      return data;
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

  return { doTogglePublish, doDelete };
}
