import React, { useCallback } from 'react';
import { useParams, Switch, Route } from 'react-router-dom';

import { useFirebase, useRequest } from '../hooks';
import Spinner from './Spinner';
import ReprodForm from './ReprodForm';
import ErrorAlert from './ErrorAlert';

function Reprod({ paper }) {
  const { paperId, reprodId } = useParams();
  const firebase = useFirebase();

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

  if (reprodLoading || tablesLoading) {
    return <Spinner />;
  }

  if (!reprod || !reprod.exists) {
    return (
      <ErrorAlert>
        Reprod with id <em>{reprodId}</em> could not found.
      </ErrorAlert>
    );
  }

  return (
    <Switch>
      <Route exact path="/papers/:paperId/reproductions/:reprodId/edit">
        <ReprodForm paper={paper} reprod={reprod} paperTables={tables} />
      </Route>
    </Switch>
  );
}

export default Reprod;
