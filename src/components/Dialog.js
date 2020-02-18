import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default function Dialog({
  title,
  body,
  buttons,
  isOpen,
  onToggleClick,
}) {
  return (
    <Modal isOpen={isOpen} toggle={onToggleClick}>
      {title && <ModalHeader toggle={onToggleClick}>{title}</ModalHeader>}
      {body && <ModalBody>{body}</ModalBody>}
      {buttons && <ModalFooter>{buttons}</ModalFooter>}
    </Modal>
  );
}
