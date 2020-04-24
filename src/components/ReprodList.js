import React from 'react';

import ReprodCard from './ReprodCard';

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
