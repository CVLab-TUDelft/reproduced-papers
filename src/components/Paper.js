import React, { useCallback } from 'react';
import { useParams, Switch, Route } from 'react-router-dom';

import { useFirebase, useRequest } from '../hooks';
import Spinner from './Spinner';
import PaperItem from './PaperItem';
import PaperForm from './PaperForm';
import SubmitReprod from './SubmitReprod';
import Reprod from './Reprod';
import ErrorAlert from './ErrorAlert';

function Paper() {
  const { paperId } = useParams();
  const firebase = useFirebase();

  // fetch paper
  const paperFetcher = useCallback(() => firebase.getPaper(paperId), [
    paperId,
    firebase,
  ]);
  const { data: paper, loading } = useRequest(paperFetcher);

  if (loading) {
    return <Spinner />;
  }

  if (!paper || !paper.exists) {
    return (
      <ErrorAlert>
        Paper with id <em>{paperId}</em> could not found.
      </ErrorAlert>
    );
  }

  return (
    <Switch>
      <Route exact path="/papers/:paperId">
        <PaperItem paper={paper} />
      </Route>
      <Route exact path="/papers/:paperId/edit">
        <PaperForm paper={paper} />
      </Route>
      <Route exact path="/papers/:paperId/submit-reproduction">
        <SubmitReprod paper={paper} />
      </Route>
      <Route path="/papers/:paperId/reproductions/:reprodId">
        <Reprod paper={paper} />
      </Route>
    </Switch>
  );
}

export default Paper;
