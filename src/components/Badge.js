import React, { useEffect } from 'react';
import jquery from 'jquery';

import { BADGES } from '../constants';

function Badge({ badgeKey }) {
  useEffect(() => {
    jquery(function() {
      jquery('[data-toggle="tooltip"]').tooltip();
    });
  });

  const badge = BADGES[badgeKey];
  return (
    <span
      className={`badge badge-${badge.color} mr-2`}
      data-toggle="tooltip"
      data-placement="top"
      title={badge.description}
    >
      {badge.label}
    </span>
  );
}

export default Badge;
