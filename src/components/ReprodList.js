import React from 'react';
import { Link } from 'react-router-dom';
import { get } from 'lodash/fp';

import { useFirebase } from '../hooks';
import Button from './Button';
import Badge from './Badge';
import StatusDropdown from './StatusDropdown';
import Image from './Image';

function ReprodCard({ reprod, index, onDeleteClick, onStatusChange }) {
  const firebase = useFirebase();
  const userId = get('uid', firebase.authUser);
  const userRole = get('profile.role', firebase.authUser);
  const data = reprod.data();
  return (
    <div id={reprod.id} className="card mb-3">
      <div className="row no-gutters">
        <div className="col-md-4">
          <div className="m-3">
            <Image src={data.imageUrl} className="img-fluid" />
          </div>
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h3 className="card-title text-secondary">#{index + 1}</h3>
            <div className="mb-1">
              {data.badges &&
                data.badges.map(badgeKey => (
                  <Badge key={badgeKey} badgeKey={badgeKey} />
                ))}
            </div>
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
              <div
                className="btn-group mr-2 mb-2"
                role="group"
                aria-label="View group"
              >
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
                  className="btn btn-success"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://github.com/${data.urlCode}`}
                >
                  Code
                </a>
              </div>
              {(userRole === 'admin' || userId === data.createdBy) && (
                <div
                  className="btn-group mb-2"
                  role="group"
                  aria-label="Edit group"
                >
                  <Link
                    className="btn btn-success"
                    to={`/papers/${data.paperId}/reproductions/${reprod.id}/edit`}
                  >
                    Edit
                  </Link>
                  <Button className="btn btn-danger" onClick={onDeleteClick}>
                    Delete
                  </Button>
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
      </div>
    </div>
  );
}

function ReprodList({ byId, ids, onDeleteClick, onStatusChange }) {
  return ids.map((id, index) => (
    <ReprodCard
      key={id}
      reprod={byId[id].doc}
      index={index}
      onDeleteClick={() => onDeleteClick(id)}
      onStatusChange={status => onStatusChange(id, status)}
    />
  ));
}

export default ReprodList;
