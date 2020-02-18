import React from 'react';

import { useFirebase } from '../hooks';

export default function withAuthorization(roles) {
  return function(Component) {
    return function(props) {
      const firebase = useFirebase();
      const authUser = firebase.authUser;

      return !authUser || !roles.includes(authUser.profile.role) ? (
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="alert alert-danger text-center">
              <h5>Restricted Page</h5>
              <span>You don't have permission to view this page.</span>
            </div>
          </div>
        </div>
      ) : (
        <Component {...props} authUser={authUser} />
      );
    };
  };
}
