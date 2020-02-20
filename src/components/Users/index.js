import React, { useCallback } from 'react';
import { NavLink, Switch, Route, useParams } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { get } from 'lodash/fp';

import withAuthentication from '../withAuthentication';
import UnauthorizedError from '../UnauthorizedError';
import { useFirebase, useRequest } from '../../hooks';
import Spinner from '../Spinner';
import Profile from './Profile';
import Papers from './Papers';
import Reprods from './Reprods';

function Users({ authUser }) {
  let { userId } = useParams();
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
  );

  // fetch the user
  const userFetcher = useCallback(() => firebase.getUser(userId), [
    userId,
    firebase,
  ]);
  const { data: user, loading: userLoading } = useRequest(userFetcher, onError);

  if (userLoading) {
    return <Spinner />;
  }

  if (!user || !user.exists) {
    return (
      <p className="text-center">User with id {userId} could not found.</p>
    );
  }

  const role = get('profile.role')(authUser);
  if (userId !== authUser.uid && role !== 'admin') {
    return <UnauthorizedError />;
  }

  const me = userId === authUser.uid;
  const myPrefix = me ? 'My' : '';
  return (
    <>
      <h1>{get('displayName', user.data())}</h1>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <NavLink className="nav-link" exact to={`/users/${userId}`}>
            {`${myPrefix} Profile`}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={`/users/${userId}/papers`}>
            {`${myPrefix} Papers`}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={`/users/${userId}/reproductions`}>
            {`${myPrefix} Reproductions`}
          </NavLink>
        </li>
      </ul>
      <Switch>
        <Route exact path="/users/:userId">
          <Profile user={user} me={me} />
        </Route>
        <Route exact path="/users/:userId/papers">
          <Papers user={user} me={me} />
        </Route>
        <Route exact path="/users/:userId/reproductions">
          <Reprods user={user} me={me} />
        </Route>
      </Switch>
    </>
  );
}

export default withAuthentication(Users);
