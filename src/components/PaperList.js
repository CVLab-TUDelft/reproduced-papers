import React from 'react';
import { Link } from 'react-router-dom';
import { get } from 'lodash/fp';

import Button from './Button';
import { useFirebase } from '../hooks';

function PaperCard({ paper }) {
  const firebase = useFirebase();
  const userId = get('uid', firebase.authUser);
  const userRole = get('profile.role', firebase.authUser);
  const data = paper.data();
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h3 className="card-title">
          {data.title}
          <br />
          <small className="text-muted">by {data.authors.join(', ')}</small>
        </h3>
        <p className="card-text">{data.abstract}</p>
        <div className="btn-group" role="group">
          <Link className="btn btn-secondary" to={`/papers/${paper.id}`}>
            Detail
          </Link>
          {(userRole === 'admin' || userId === data.createdBy) && (
            <Link className="btn btn-success" to={`/papers/${paper.id}/edit`}>
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PaperList({ papers, loading, onMoreClick }) {
  return (
    <>
      <h1>Papers</h1>
      {(papers || []).map(paper => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
      <div className="text-center mb-3">
        <Button type="button" loading={loading} onClick={onMoreClick}>
          More
        </Button>
      </div>
    </>
  );
}

export default PaperList;
