import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useRequest } from '../../hooks';
import Spinner from '../Spinner';
import PaperForm from '../PaperForm';

function PaperEdit() {
  const { paperId } = useParams();
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
  );

  // fetch paper
  const paperFetcher = useCallback(() => firebase.getPaper(paperId), [
    paperId,
    firebase,
  ]);
  const { data: paper, loading: paperLoading } = useRequest(
    paperFetcher,
    onError
  );

  if (paperLoading) {
    return <Spinner />;
  }

  if (!paper || !paper.exists) {
    return (
      <p className="text-center">Paper with id {paperId} could not found.</p>
    );
  }

  return <PaperForm paper={paper} />;
}

export default PaperEdit;
