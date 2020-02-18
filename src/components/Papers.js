import React, { useCallback } from 'react';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useRequest } from '../hooks';
import PaperList from './PaperList';

function Papers() {
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
  );
  const { data, loading } = useRequest(firebase.getPapers, onError);

  function handleMoreClick() {
    // TODO
  }

  return (
    <PaperList papers={data} loading={loading} onMoreClick={handleMoreClick} />
  );
}

export default Papers;
