import React from 'react';

import { useFirebase } from '../hooks';
import ErrorAlert from './ErrorAlert';

export default function withAuthorization(roles) {
  return function(Component) {
    return function(props) {
      const firebase = useFirebase();
      const authUser = firebase.authUser;

      return !authUser || !roles.includes(authUser.profile.role) ? (
        <ErrorAlert title="Restricted Page">
          You don't have permission to view this page.
        </ErrorAlert>
      ) : (
        <Component {...props} authUser={authUser} />
      );
    };
  };
}
