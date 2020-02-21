import React from 'react';
import { Link } from 'react-router-dom';
import { get } from 'lodash/fp';

import { useFirebase } from '../hooks';
import Button from './Button';

function ReprodCard({ reprod, onDeleteClick, onPublishClick }) {
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
        <div
          className="btn-toolbar"
          role="toolbar"
          aria-label="Toolbar with button groups"
        >
          <div className="btn-group mr-2" role="group" aria-label="View group">
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
          </div>
          {(userRole === 'admin' || userId === data.createdBy) && (
            <div className="btn-group" role="group" aria-label="Edit group">
              <Link
                className="btn btn-primary"
                to={`/papers/${data.paperId}/reproductions/${reprod.id}/edit`}
              >
                Edit
              </Link>
              {(userRole === 'admin' || !data.published) && (
                <Button className="btn btn-danger" onClick={onDeleteClick}>
                  Delete
                </Button>
              )}
              {userRole === 'admin' && (
                <Button className="btn btn-success" onClick={onPublishClick}>
                  {data.published ? 'Unpublish' : 'Publish'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReprodList({ byId, ids, onDeleteClick, onPublishClick }) {
  return ids.map(id => (
    <ReprodCard
      key={id}
      reprod={byId[id].doc}
      onDeleteClick={() => onDeleteClick(id)}
      onPublishClick={() => onPublishClick(id)}
    />
  ));
}

export default ReprodList;
