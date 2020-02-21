import React, { useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Link, useLocation } from 'react-router-dom';

import { useFirebase, useRequest, useCollection } from '../../hooks';
import Button from '../Button';
import { LIMIT } from '../../constants';

const ROLES = {
  user: 'User',
  admin: 'Admin',
};

const filters = {
  all: 'All',
  admin: 'Admin',
  user: 'User',
};
const defaultFilter = 'all';
function getFilteredIds(filter, state) {
  if (filter === 'all') {
    return state.ids;
  }
  return state.ids.filter(id => filter === state.byId[id].role);
}

// params should be outside of the component
// otherwise useMemo
const params = { limit: LIMIT };

function Papers() {
  const firebase = useFirebase();
  const { addToast } = useToasts();
  const { data, loading, hasMore, fetchMore } = useRequest(
    firebase.getUsers,
    params
  );
  const [state, dispatch] = useCollection(data);
  const { byId } = state;

  async function handleRoleChange(id, event) {
    try {
      const data = { role: event.target.value };
      const docRef = await firebase.updateUser(id, data);
      const doc = await docRef.get();
      dispatch({ type: 'SET', id, doc });
      addToast('The role of the user updated', { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    }
  }

  const { hash } = useLocation();
  const [filter, setFilter] = useState(hash ? hash.substr(1) : defaultFilter);
  let filteredIds = getFilteredIds(filter, state);

  return (
    <>
      <ul className="nav nav-pills mb-3">
        {Object.keys(filters).map(key => (
          <li key={key} className="nav-item">
            <a
              className={`nav-link${key === filter ? ' active' : ''}`}
              onClick={() => setFilter(key)}
              href={`#${filter}`}
            >
              {filters[key]}
            </a>
          </li>
        ))}
      </ul>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Display Name</th>
              <th>E-mail</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredIds.map(id => (
              <tr key={id}>
                <td>
                  <Link to={`/users/${id}`}>{id}</Link>
                </td>
                <td>{byId[id].displayName}</td>
                <td>{byId[id].email}</td>
                <td>
                  <select
                    className="custom-select"
                    name="role"
                    onChange={event => handleRoleChange(id, event)}
                    value={byId[id].role}
                  >
                    {Object.keys(ROLES).map(role => (
                      <option key={role} value={role}>
                        {ROLES[role]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hasMore && (
          <div className="text-center mb-3">
            <Button type="button" loading={loading} onClick={fetchMore}>
              More
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default Papers;
