import React from 'react';

import Dialog from './Dialog';

export default function DeleteDialog({ isOpen, onDelete, onToggle, itemName }) {
  const buttons = [
    <button key="close" className="btn" onClick={onToggle}>
      Cancel
    </button>,
    <button
      key="delete"
      className="btn btn-danger"
      onClick={async () => {
        await onDelete();
        onToggle();
      }}
    >
      Delete
    </button>,
  ];

  return (
    <Dialog
      title="Warning"
      body={
        <p>
          Are you sure to delete{' '}
          <span className="text-primary">{itemName}</span>?
        </p>
      }
      buttons={buttons}
      isOpen={isOpen}
      onToggleClick={onToggle}
    />
  );
}
