import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { get } from 'lodash/fp';

import { useFirebase, usePaperActions } from '../hooks';
import Reprods from './Reprods';
import DeleteDialog from './DeleteDialog';
import Button from './Button';

function PaperItem({ paper }) {
  const [data, setData] = useState(paper.data());
  const firebase = useFirebase();
  const userId = get('uid', firebase.authUser);
  const userRole = get('profile.role', firebase.authUser);

  const { doTogglePublish, doDelete } = usePaperActions();
  async function handlePublishClick() {
    try {
      const doc = await doTogglePublish(paper.id, data);
      setData(doc.data());
    } catch (error) {}
  }

  const history = useHistory();
  const [open, setOpen] = useState(false);
  async function handleDelete() {
    try {
      await doDelete(paper.id);
      setOpen(false);
      history.push('/papers');
    } catch (error) {}
  }

  return (
    <>
      <h1>
        {data.title}
        <br />
        <small className="text-muted">by {data.authors.join(', ')}</small>
      </h1>
      <p>{data.abstract}</p>
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
          <a
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
            href={data.urlAbstract}
          >
            Abstract
          </a>
          {data.urlPDF && (
            <a
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              href={data.urlPDF}
            >
              PDF
            </a>
          )}
        </div>
        <div
          className="btn-group mr-2 mb-2"
          role="group"
          aria-label="Add group"
        >
          <Link
            className="btn btn-success"
            to={`/papers/${paper.id}/submit-reproduction`}
          >
            Add Reproduction
          </Link>
        </div>
        {(userRole === 'admin' || userId === data.createdBy) && (
          <div className="btn-group mb-2" role="group" aria-label="Edit group">
            <Link className="btn btn-primary" to={`/papers/${paper.id}/edit`}>
              Edit
            </Link>
            {(userRole === 'admin' || !data.published) && (
              <Button className="btn btn-danger" onClick={() => setOpen(true)}>
                Delete
              </Button>
            )}
            {userRole === 'admin' && (
              <Button className="btn btn-success" onClick={handlePublishClick}>
                {data.published ? 'Unpublish' : 'Publish'}
              </Button>
            )}
          </div>
        )}
      </div>
      <DeleteDialog
        isOpen={open}
        onDelete={handleDelete}
        onToggle={() => setOpen(false)}
        itemName={data.title}
      />
      <Reprods paper={paper} />
    </>
  );
}

export default PaperItem;
