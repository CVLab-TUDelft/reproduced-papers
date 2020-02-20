import React from 'react';

import { useFirebase } from '../hooks';
import UnauthorizedError from './UnauthorizedError';

export default function withAuthorization(roles) {
  return function(Component) {
    return function(props) {
      const firebase = useFirebase();
      const authUser = firebase.authUser;

      return !authUser || !roles.includes(authUser.profile.role) ? (
        <UnauthorizedError />
      ) : (
        <Component {...props} authUser={authUser} />
      );
    };
  };
}
