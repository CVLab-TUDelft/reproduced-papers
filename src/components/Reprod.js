import React, { useCallback } from 'react';
import { useParams, Switch, Route } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useRequest } from '../hooks';
import Spinner from './Spinner';
import ReprodForm from './ReprodForm';

function Reprod({ paper }) {
  const { paperId, reprodId } = useParams();
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
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

  if (reprodLoading) {
    return <Spinner />;
  }

  if (!reprod.exists) {
    return (
      <p className="text-center">Reprod with id {reprodId} could not found.</p>
    );
  }

  return (
    <Switch>
      <Route exact path="/papers/:paperId/reproductions/:reprodId/edit">
        <ReprodForm paper={paper} reprod={reprod} />
      </Route>
    </Switch>
  );
}

export default Reprod;
