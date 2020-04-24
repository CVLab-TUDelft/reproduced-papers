import React from 'react';

import PaperCard from './PaperCard';

function PaperList({ byId, ids, onDeleteClick, onStatusChange }) {
  return ids.map(id => (
    <PaperCard
      key={id}
      paper={byId[id].doc}
      onDeleteClick={() => onDeleteClick(id)}
      onStatusChange={status => onStatusChange(id, status)}
    />
  ));
}

export default PaperList;
