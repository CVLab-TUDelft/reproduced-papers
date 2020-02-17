import React, { useCallback } from 'react';
import { useParams, Switch, Route } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useRequest } from '../hooks';
import Spinner from './Spinner';
import PaperItem from './PaperItem';
import SubmitReprod from './SubmitReprod';

function Paper({ authUser }) {
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

  if (!paper.exists) {
    return (
      <p className="text-center">Paper with id {paperId} could not found.</p>
    );
  }

  return (
    <Switch>
      <Route exact path="/papers/:paperId">
        <PaperItem paper={paper} />
      </Route>
      <Route path="/papers/:paperId/submit-reproduction">
        <SubmitReprod paper={paper} authUser={authUser} />
      </Route>
    </Switch>
  );
}

export default Paper;
