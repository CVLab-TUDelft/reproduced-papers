import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default function Dialog({
  title,
  children,
  buttons,
  isOpen,
  onToggle,
  size,
}) {
  if (!buttons)
    buttons = [
      <button key="close" className="btn btn-secondary" onClick={onToggle}>
        Close
      </button>,
    ];
  return (
    <Modal isOpen={isOpen} toggle={onToggle} size={size}>
      {title && <ModalHeader toggle={onToggle}>{title}</ModalHeader>}
      {children && <ModalBody>{children}</ModalBody>}
      {buttons && <ModalFooter>{buttons}</ModalFooter>}
    </Modal>
  );
}
