import React from 'react';

function UnauthorizedError() {
  return (
    <div className="row">
      <div className="col-md-6 offset-md-3">
        <div className="alert alert-danger text-center">
          <h5>Restricted Page</h5>
          <span>You don't have permission to view this page.</span>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedError;
