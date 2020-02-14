import React from 'react';
import { Link } from 'react-router-dom';
import { escape } from 'lodash';

import Button from './Button';

function PaperCard({ paper }) {
  const data = paper.data();
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h3 className="card-title">
          {escape(data.title)}
          <br />
          <small className="text-muted">
            by {data.authors.map(author => escape(author)).join(', ')}
          </small>
        </h3>
        <p className="card-text">{escape(data.abstract)}</p>
        <Link className="btn btn-secondary" to={`/papers/${paper.id}`}>
          Detail
        </Link>
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
