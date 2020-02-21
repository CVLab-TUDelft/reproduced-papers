import React, { useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';

import { useFirebase } from '../hooks';
import Spinner from './Spinner';

function SignOut() {
  const firebase = useFirebase();
  const history = useHistory();
  const { addToast } = useToasts();

  useEffect(() => {
    firebase
      .signOut()
      .then(() => {
        addToast('Signed out successfully', { appearance: 'success' });
        history.push('/');
      })
      .catch(error => {
        addToast(error.message, { appearance: 'error' });
      });
  }, [firebase, history, addToast]);

  return <Spinner />;
}

export default SignOut;
