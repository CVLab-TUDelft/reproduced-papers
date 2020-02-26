import React from 'react';
import { Link } from 'react-router-dom';
import { get, truncate } from 'lodash/fp';

import Button from './Button';
import { useFirebase } from '../hooks';
import StatusDropdown from './StatusDropdown';

function PaperCard({ paper, onDeleteClick, onStatusChange }) {
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
        <p className="card-text">{truncate({ length: 250 })(data.abstract)}</p>
        <div
          className="btn-toolbar"
          role="toolbar"
          aria-label="Toolbar with button groups"
        >
          <div
            className="btn-group mr-2 mb-2"
            role="group"
            aria-label="View group"
          >
            <Link className="btn btn-primary" to={`/papers/${paper.id}`}>
              Detail
            </Link>
          </div>
          {(userRole === 'admin' || userId === data.createdBy) && (
            <div
              className="btn-group mb-2"
              role="group"
              aria-label="Edit group"
            >
              {(userRole === 'admin' || data.status !== 'published') && (
                <>
                  <Link
                    className="btn btn-primary"
                    to={`/papers/${paper.id}/edit`}
                  >
                    Edit
                  </Link>
                  <Button className="btn btn-danger" onClick={onDeleteClick}>
                    Delete
                  </Button>
                </>
              )}
              {userRole === 'admin' && (
                <StatusDropdown
                  status={data.status}
                  onStatusChange={onStatusChange}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaperList({ byId, ids, onDeleteClick, onStatusChange }) {
  return ids.map(id => (
    <PaperCard
      key={id}
      paper={byId[id].doc}
      onDeleteClick={() => onDeleteClick(id)}
      onStatusChange={onStatusChange}
    />
  ));
}

export default PaperList;
