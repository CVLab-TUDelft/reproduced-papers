import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { escape } from 'lodash/fp';

import { useFirebase, useRequest } from '../hooks';
import Spinner from './Spinner';

function ReprodCard({ reprod }) {
  const data = reprod.data();
  return (
    <div id={reprod.id} className="card mb-3">
      <div className="card-body">
        <h3 className="card-title">
          {escape(data.title)}
          <br />
          <small className="text-muted">
            by {data.authors.map(author => escape(author)).join(', ')}
          </small>
        </h3>
        <p className="card-text">{escape(data.description)}</p>
        <div className="btn-group" role="group">
          <a
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
            href={data.urlBlog}
          >
            Detail
          </a>
          <a
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/${data.urlCode}`}
          >
            Code
          </a>
        </div>
      </div>
    </div>
  );
}

function PaperItem({ paper }) {
  const paperId = paper.id;
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
  );

  // fetch reproductions
  const reprodsFetcher = useCallback(
    () => firebase.getReprodsOfPaper(paperId),
    [paperId, firebase]
  );
  const { data: reprods, loading: reprodsLoading } = useRequest(
    reprodsFetcher,
    onError
  );

  const data = paper.data();
  return (
    <>
      <h1>
        {escape(data.title)}
        <br />
        <small className="text-muted">
          by {data.authors.map(author => escape(author)).join(', ')}
        </small>
      </h1>
      <p>{escape(data.abstract)}</p>
      <div className="btn-group" role="group">
        <a
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
          href={data.urlAbstract}
        >
          Abstract
        </a>
        <a
          className="btn btn-secondary"
          target="_blank"
          rel="noopener noreferrer"
          href={data.urlPDF}
        >
          PDF
        </a>
        <Link
          className="btn btn-success"
          to={`/papers/${paper.id}/submit-reproduction`}
        >
          Add Reproduction
        </Link>
      </div>
      {reprodsLoading && <Spinner />}
      {!reprodsLoading && reprods.length > 0 && (
        <>
          <h3 className="mt-3">Reproductions</h3>
          {reprods.map(reprod => (
            <ReprodCard key={reprod.id} reprod={reprod} />
          ))}
        </>
      )}
    </>
  );
}

export default PaperItem;
