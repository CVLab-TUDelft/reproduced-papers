import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useFirebase, useRequest } from '../../hooks';
import Spinner from '../Spinner';
import ReprodForm from '../ReprodForm';
import ErrorAlert from '../ErrorAlert';

function ReprodEdit() {
  const { paperId, reprodId } = useParams();
  const firebase = useFirebase();

  // fetch paper
  const paperFetcher = useCallback(() => firebase.getPaper(paperId), [
    paperId,
    firebase,
  ]);
  const { data: paper, loading: paperLoading } = useRequest(paperFetcher);

  // fetch reprod
  const reprodFetcher = useCallback(
    () => firebase.getPaperReprod(paperId, reprodId),
    [paperId, reprodId, firebase]
  );
  const { data: reprod, loading: reprodLoading } = useRequest(reprodFetcher);

  // fetch tables
  const tableFetcher = useCallback(() => firebase.getPaperTables(paperId), [
    paperId,
    firebase,
  ]);
  const { data: tables, loading: tablesLoading } = useRequest(tableFetcher);

  if (paperLoading || reprodLoading || tablesLoading) {
    return <Spinner />;
  }

  if (!paper && !paper.exists) {
    return (
      <ErrorAlert>
        Paper with id <em>{paperId}</em> could not found.
      </ErrorAlert>
    );
  }

  if (!reprod || !reprod.exists) {
    return (
      <ErrorAlert>
        Reprod with id <em>{reprodId}</em> could not found.
      </ErrorAlert>
    );
  }

  return <ReprodForm paper={paper} reprod={reprod} paperTables={tables} />;
}

export default ReprodEdit;
