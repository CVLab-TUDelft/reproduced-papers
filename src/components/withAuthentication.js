import React from 'react';

import { useFirebase } from '../hooks';
import ErrorAlert from './ErrorAlert';

export default function withAuthentication(Component) {
  return function(props) {
    const firebase = useFirebase();
    const authUser = firebase.authUser;

    return !authUser ? (
      <ErrorAlert title="Restricted Page">
        Please sign in to see this page.
      </ErrorAlert>
    ) : (
      <Component {...props} authUser={authUser} />
    );
  };
}
