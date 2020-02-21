import React from 'react';

function ErrorAlert({ title = 'Error', children }) {
  return (
    <div className="row">
      <div className="col-md-6 offset-md-3">
        <div className="alert alert-danger">
          <h4 className="alert-heading">{title}</h4>
          <p className="mb-0">{children}</p>
        </div>
      </div>
    </div>
  );
}

export default ErrorAlert;
