import React from 'react';

import { useFirebase } from '../hooks';

export default function withAuthentication(Component) {
  return function(props) {
    const firebase = useFirebase();
    const authUser = firebase.authUser;

    return !authUser ? (
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="alert alert-warning text-center">
            <h5>Warning</h5>
            <span>Please sign in to see this page.</span>
          </div>
        </div>
      </div>
    ) : (
      <Component {...props} authUser={authUser} />
    );
  };
}
