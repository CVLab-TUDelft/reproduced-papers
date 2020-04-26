import React, { useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import ReprodForm from './ReprodForm';
import Spinner from './Spinner';
import PaperPicker from './PaperPicker';
import withAuthentication from './withAuthentication';
import { useFirebase, useRequest } from '../hooks';
import MoreText from './MoreText';

function SubmitReprod() {
  const { paperId } = useParams();
  const [selected, setSelected] = useState(paperId);
  const [show, setShow] = useState(false);
  const firebase = useFirebase();

  // fetch paper
  const paperFetcher = useCallback(() => firebase.getPaper(selected), [
    selected,
    firebase,
  ]);
  const { data: paper, loading: paperLoading } = useRequest(paperFetcher);

  // fetch tables
  const tableFetcher = useCallback(() => firebase.getPaperTables(selected), [
    selected,
    firebase,
  ]);
  const { data: tables, loading: tablesLoading } = useRequest(tableFetcher);

  const isPaperReady = selected && paper && paper.exists;

  return (
    <>
      <PaperPicker
        title="Choose a paper to add reproduction"
        action="Select"
        onSelect={paperId => {
          setShow(false);
          setSelected(paperId);
        }}
        onClose={() => setShow(false)}
        isOpen={show}
      />
      {selected && (paperLoading || tablesLoading) && <Spinner />}
      {paperId && !(paperLoading || tablesLoading) && isPaperReady && (
        <ReprodForm paper={paper} paperTables={tables} />
      )}
      {!paperId && (
        <>
          <h1>Select Paper</h1>
          <p>Select a paper first to add reproduction</p>
          <div className="card">
            <div className="card-body">
              {isPaperReady && (
                <>
                  <h3 className="card-title">{paper.get('title')}</h3>
                  <MoreText
                    className="card-text"
                    text={paper.get('abstract')}
                  />
                </>
              )}
              <button className="btn btn-primary" onClick={() => setShow(true)}>
                {isPaperReady ? 'Reselect' : 'Select'}
              </button>{' '}
              {isPaperReady && (
                <Link
                  className="btn btn-success"
                  disabled={!isPaperReady}
                  to={`submit-reproduction/${selected}`}
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default withAuthentication(SubmitReprod);
