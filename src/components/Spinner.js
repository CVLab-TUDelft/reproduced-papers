import React from 'react';

function Spinner() {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="spinner-grow spinner-grow-lg text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export default Spinner;
