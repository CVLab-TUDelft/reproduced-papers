import React, { useCallback } from 'react';

import ReprodForm from './ReprodForm';
import Spinner from './Spinner';
import withAuthentication from './withAuthentication';
import { useFirebase, useRequest } from '../hooks';

function SubmitReprod({ paper }) {
  const firebase = useFirebase();

  // fetch reproductions
  const reprodsFetcher = useCallback(() => firebase.getPaperReprods(paper.id), [
    paper.id,
    firebase,
  ]);
  const { data: reprods, loading } = useRequest(reprodsFetcher);

  if (loading) {
    return <Spinner />;
  }

  const tables = reprods
    ? reprods.reduce((prev, curr) => ({ ...prev, ...curr.get('tables') }), {})
    : {};

  return <ReprodForm paper={paper} paperTables={tables} />;
}

export default withAuthentication(SubmitReprod);
