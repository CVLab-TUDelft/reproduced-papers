import React from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';

import withAuthorization from '../withAuthorization';
import Papers from './Papers';
import PaperEdit from './PaperEdit';
import Reprods from './Reprods';
import ReprodEdit from './ReprodEdit';
import Users from './Users';
import Actions from './Actions';

function Admin() {
  return (
    <>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <NavLink
            className="nav-link"
            to="/admin/papers"
            isActive={(match, location) =>
              match || location.pathname === '/admin'
            }
          >
            Papers
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin/reproductions">
            Reproductions
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin/users">
            Users
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/admin/actions">
            Actions
          </NavLink>
        </li>
      </ul>
      <Switch>
        <Route exact path={['/admin', '/admin/papers']}>
          <Papers />
        </Route>
        <Route exact path="/admin/papers/:paperId/edit">
          <PaperEdit />
        </Route>
        <Route exact path="/admin/reproductions">
          <Reprods />
        </Route>
        <Route exact path="/admin/reproductions/:paperId/:reprodId/edit">
          <ReprodEdit />
        </Route>
        <Route exact path="/admin/users">
          <Users />
        </Route>
        <Route exact path="/admin/actions">
          <Actions />
        </Route>
      </Switch>
    </>
  );
}

export default withAuthorization(['admin'])(Admin);
