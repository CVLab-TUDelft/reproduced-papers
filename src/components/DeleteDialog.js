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
      title="Delete"
      buttons={buttons}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      Are you sure to delete <em>{itemName}</em>?
    </Dialog>
  );
}
