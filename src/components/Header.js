import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useSearch } from '../hooks';
import Spinner from './Spinner';

function Header() {
  const firebase = useFirebase();
  const authUser = firebase.authUser;
  const { addToast } = useToasts();
  const paperSearcher = useSearch('papers');
  const reprodSearcher = useSearch('reprods');
  const [focused, setFocused] = useState(false);

  async function handleSigninClick(event) {
    event.preventDefault();
    try {
      await firebase.signInWithGithub();
      addToast('Signed in successfully', { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    }
  }

  async function handleSignoutClick(event) {
    event.preventDefault();
    try {
      await firebase.signOut();
      addToast('Signed out successfully', { appearance: 'success' });
    } catch (error) {
      addToast(error.message, { appearance: 'error' });
    }
  }

  async function handleSearchChange(event) {
    const query = event.target.value;
    paperSearcher.search(query);
    reprodSearcher.search(query);
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();
  }

  const history = useHistory();
  function handleSearchItemClick(path) {
    paperSearcher.search('');
    reprodSearcher.search('');
    history.push(path);
  }

  // settimeout may fire after unmount so prevent this situation
  let willUnmount = useRef(false);
  useEffect(() => {
    willUnmount.current = false;
    return () => {
      willUnmount.current = true;
    };
  });
  function handleBlur() {
    setTimeout(() => {
      if (!willUnmount.current) {
        setFocused(false);
      }
    }, 300);
  }

  const loading = paperSearcher.loading || reprodSearcher.loading;
  const numHits = paperSearcher.hits.length + reprodSearcher.hits.length;
  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Reproduced Papers
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbar-main"
          aria-controls="navbar-main"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar-main">
          <form
            className="form-inline my-2 my-lg-0"
            onSubmit={handleSearchSubmit}
          >
            <div className="position-relative" style={{ minWidth: '375px' }}>
              <input
                className="form-control mr-sm-2 w-100"
                type="text"
                placeholder="Search for papers and reproductions"
                aria-label="Search"
                value={paperSearcher.query}
                onChange={handleSearchChange}
                onBlur={handleBlur}
                onFocus={() => setFocused(true)}
              />
              {focused && (
                <div className="list-group position-absolute w-100 mt-1">
                  {loading && (
                    <div className="list-group-item search-item">
                      <Spinner />
                    </div>
                  )}
                  {!numHits && paperSearcher.query !== '' && (
                    <button
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSearchItemClick(`/submit-paper`)}
                    >
                      Submit if not found
                    </button>
                  )}
                  {paperSearcher.hits.length > 0 && (
                    <>
                      <a
                        href="#papers"
                        className="list-group-item list-group-item-action disabled"
                        tabIndex="-1"
                        aria-disabled="true"
                      >
                        PAPERS
                      </a>
                      {paperSearcher.hits.map(hit => (
                        <button
                          className="list-group-item list-group-item-action"
                          key={hit.objectID}
                          onClick={() =>
                            handleSearchItemClick(`/papers/${hit.objectID}`)
                          }
                        >
                          {hit.title}
                        </button>
                      ))}
                    </>
                  )}
                  {reprodSearcher.hits.length > 0 && (
                    <>
                      <a
                        href="#reproductions"
                        className="list-group-item list-group-item-action disabled"
                        tabIndex="-1"
                        aria-disabled="true"
                      >
                        REPRODUCTIONS
                      </a>
                      {reprodSearcher.hits.map(hit => (
                        <button
                          className="list-group-item list-group-item-action"
                          key={hit.objectID}
                          onClick={() =>
                            handleSearchItemClick(
                              `/papers/${hit.paperId}#${hit.objectID}`
                            )
                          }
                        >
                          {hit.title}
                        </button>
                      ))}
                    </>
                  )}
                  {numHits > 0 && (
                    <div className="list-group-item text-black-50">
                      Search by{' '}
                      <a
                        className="text-black-50"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://algolia.com"
                      >
                        Algolia
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
          <ul className="navbar-nav ml-auto">
            {authUser && authUser.profile.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Admin
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink className="nav-link" to="/papers">
                Papers
              </NavLink>
            </li>
            {authUser && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/submit-paper">
                  Submit Paper
                </NavLink>
              </li>
            )}
            {!authUser && (
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#signin"
                  onClick={handleSigninClick}
                >
                  Sign in
                </a>
              </li>
            )}
            {authUser && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#account"
                  id="account-dropdown"
                  data-toggle="dropdown"
                  aria-expanded="false"
                >
                  Account
                </a>
                <div
                  className="dropdown-menu"
                  aria-labelledby="account-dropdown"
                >
                  <Link className="dropdown-item" to={`/users/${authUser.uid}`}>
                    My Profile
                  </Link>
                  <Link
                    className="dropdown-item"
                    to={`/users/${authUser.uid}/papers`}
                  >
                    My Papers
                  </Link>
                  <Link
                    className="dropdown-item"
                    to={`/users/${authUser.uid}/reproductions`}
                  >
                    My Reproductions
                  </Link>
                  <a
                    className="dropdown-item"
                    href="#signout"
                    onClick={handleSignoutClick}
                  >
                    Sign out
                  </a>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
