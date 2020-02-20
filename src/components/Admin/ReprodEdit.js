import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useRequest } from '../../hooks';
import Spinner from '../Spinner';
import ReprodForm from '../ReprodForm';

function ReprodEdit() {
  const { paperId, reprodId } = useParams();
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

  // fetch reprod
  const reprodFetcher = useCallback(
    () => firebase.getPaperReprod(paperId, reprodId),
    [paperId, reprodId, firebase]
  );
  const { data: reprod, loading: reprodLoading } = useRequest(
    reprodFetcher,
    onError
  );

  if (paperLoading || reprodLoading) {
    return <Spinner />;
  }

  if (!paper.exists) {
    return (
      <p className="text-center">Paper with id {paperId} could not found.</p>
    );
  }

  if (!reprod || !reprod.exists) {
    return (
      <p className="text-center">Reprod with id {reprodId} could not found.</p>
    );
  }

  return <ReprodForm paper={paper} reprod={reprod} />;
}

export default ReprodEdit;
