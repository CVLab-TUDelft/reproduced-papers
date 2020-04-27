import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { get } from 'lodash/fp';

import { useFirebase } from '../hooks';
import { getReprodUrl } from '../helpers';
import Button from './Button';
import Badge from './Badge';
import StatusDropdown from './StatusDropdown';
import Image from './Image';
import MoreText from './MoreText';

function ReprodCard({
  reprod,
  index = null,
  onDeleteClick,
  onStatusChange,
  forHome = false,
}) {
  const firebase = useFirebase();
  const userId = get('uid', firebase.authUser);
  const userRole = get('profile.role', firebase.authUser);
  const location = useLocation();
  const data = reprod.data();
  return (
    <div
      id={`r${reprod.id}`}
      className={`card mb-3 ${
        location.hash === `#r${reprod.id}` ? 'bg-light' : ''
      }`}
    >
      <div className="row no-gutters">
        {data.imageUrl && (
          <div className="col-md-4">
            <div className="m-3">
              <Image
                src={data.imageUrl}
                className="img-fluid"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
        <div className="col">
          <div className="card-body">
            {index !== null && (
              <h3 className="card-title text-secondary">#{index + 1}</h3>
            )}
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
            <MoreText className="card-text" text={data.description} />
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
                {forHome ? (
                  <Link
                    className="btn btn-primary"
                    to={getReprodUrl(data.paperId, reprod.id)}
                  >
                    Detail
                  </Link>
                ) : (
                  <>
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
                  </>
                )}
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

export default ReprodCard;
