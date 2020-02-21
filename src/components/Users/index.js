import React, { useCallback } from 'react';
import { NavLink, Switch, Route, useParams } from 'react-router-dom';
import { get } from 'lodash/fp';

import withAuthentication from '../withAuthentication';
import ErrorAlert from '../ErrorAlert';
import { useFirebase, useRequest } from '../../hooks';
import Spinner from '../Spinner';
import Profile from './Profile';
import Papers from './Papers';
import Reprods from './Reprods';

function Users({ authUser }) {
  let { userId } = useParams();
  const firebase = useFirebase();

  // fetch the user
  const userFetcher = useCallback(() => firebase.getUser(userId), [
    userId,
    firebase,
  ]);
  const { data: user, loading: userLoading } = useRequest(userFetcher);

  if (userLoading) {
    return <Spinner />;
  }

  if (!user || !user.exists) {
    return (
      <ErrorAlert>
        User with id <em>{userId}</em> could not found.
      </ErrorAlert>
    );
  }

  const role = get('profile.role')(authUser);
  if (userId !== authUser.uid && role !== 'admin') {
    return (
      <ErrorAlert title="Restricted Page">
        You don't have permission to view this page.
      </ErrorAlert>
    );
  }

  const me = userId === authUser.uid;
  const myPrefix = me ? 'My' : '';
  return (
    <>
      <h1>{user.get('displayName')}</h1>
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
        <Route path="/users/:userId/papers/:paperId?">
          <Papers user={user} me={me} />
        </Route>
        <Route path="/users/:userId/reproductions/:reprodId?">
          <Reprods user={user} me={me} />
        </Route>
      </Switch>
    </>
  );
}

export default withAuthentication(Users);
