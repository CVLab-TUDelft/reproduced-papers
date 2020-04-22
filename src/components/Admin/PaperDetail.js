import React from 'react';
import { Link } from 'react-router-dom';

function PaperDetail({ paperId, paper }) {
  return (
    <dl>
      <dt>Paper ID</dt>
      <dd>
        <Link to={`/papers/${paperId}`}>{paperId}</Link>
      </dd>
      <dt>Abstract</dt>
      <dd>{paper.abstract}</dd>
      <dt>Author(s)</dt>
      <dd>{paper.authors.join(', ')}</dd>
      {paper.urlAbstract && (
        <>
          <dt>URL to abstract</dt>
          <dd>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={paper.urlAbstract}
            >
              {paper.urlAbstract}
            </a>
          </dd>
        </>
      )}
      {paper.urlPDF && (
        <>
          <dt>URL to PDF</dt>
          <dd>
            <a target="_blank" rel="noopener noreferrer" href={paper.urlPDF}>
              {paper.urlPDF}
            </a>
          </dd>
        </>
      )}
      <dt>Submitted by</dt>
      <dd>
        <Link to={`/users/${paper.createdBy}`}>{paper.createdBy}</Link>
      </dd>
      <dt>Submitted at</dt>
      <dd>{paper.createdAt.toDate().toString()}</dd>
      {paper.updatedBy && (
        <>
          <dt>Updated by</dt>
          <dd>
            <Link to={`/users/${paper.updatedBy}`}>{paper.updatedBy}</Link>
          </dd>
          <dt>Updated at</dt>
          <dd>{paper.updatedAt.toDate().toString()}</dd>
        </>
      )}
    </dl>
  );
}

export default PaperDetail;
