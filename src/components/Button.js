import React from 'react';

function Button({ children, type, loading, ...props }) {
  return (
    <button
      type={type ? type : 'submit'}
      className="btn btn-primary"
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-grow spinner-grow-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span className="sr-only">Loading...</span>
        </>
      ) : children ? (
        children
      ) : (
        'Submit'
      )}
    </button>
  );
}

export default Button;
