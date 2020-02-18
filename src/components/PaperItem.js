import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { get } from 'lodash/fp';

import { useFirebase, useRequest } from '../hooks';
import Spinner from './Spinner';

function ReprodCard({ reprod }) {
  const firebase = useFirebase();
  const userId = get('uid', firebase.authUser);
  const userRole = get('profile.role', firebase.authUser);
  const data = reprod.data();
  return (
    <div id={reprod.id} className="card mb-3">
      <div className="card-body">
        <h3 className="card-title">
          {data.title}
          <br />
          <small className="text-muted">by {data.authors.join(', ')}</small>
        </h3>
        <p className="card-text">{data.description}</p>
        <div className="btn-group" role="group">
          {data.urlBlog && (
            <a
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              href={data.urlBlog}
            >
              Detail
            </a>
          )}
          <a
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/${data.urlCode}`}
          >
            Code
          </a>
          {(userRole === 'admin' || userId === data.createdBy) && (
            <Link
              className="btn btn-success"
              to={`/papers/${data.paperId}/reproductions/${reprod.id}/edit`}
            >
              Edit
            </Link>
          )}
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
        {data.title}
        <br />
        <small className="text-muted">by {data.authors.join(', ')}</small>
      </h1>
      <p>{data.abstract}</p>
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
