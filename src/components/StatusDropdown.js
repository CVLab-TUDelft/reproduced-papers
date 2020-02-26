import React from 'react';

import { STATUSES } from '../constants';

function StatusDropdown({ status, onStatusChange }) {
  return (
    <div className="btn-group" role="group">
      <button
        id="status"
        type="button"
        className="btn btn-secondary dropdown-toggle"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {STATUSES[status].label}
      </button>
      <div className="dropdown-menu" aria-labelledby="status">
        {Object.keys(STATUSES)
          .filter(key => STATUSES[key].action)
          .map(key => (
            <button
              key={key}
              className="dropdown-item"
              onClick={() => onStatusChange(key)}
              disabled={key === status}
            >
              {STATUSES[key].action}
            </button>
          ))}
      </div>
    </div>
  );
}

export default StatusDropdown;
