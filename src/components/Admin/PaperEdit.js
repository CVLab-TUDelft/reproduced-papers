import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useFirebase, useRequest } from '../../hooks';
import Spinner from '../Spinner';
import PaperForm from '../PaperForm';
import ErrorAlert from '../ErrorAlert';

function PaperEdit() {
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

  return <PaperForm paper={paper} />;
}

export default PaperEdit;
