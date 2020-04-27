import React, { useEffect, useState } from 'react';
import { NavLink, Link, useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { useFirebase, useSearch } from '../hooks';
import { getReprodUrl } from '../helpers';
import Spinner from './Spinner';

import logo from './logo.png';
import tudelftLogo from './tudelft.png';

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

  async function handleSearchChange(event) {
    const query = event.target.value;
    paperSearcher.search(query);
    reprodSearcher.search(query);
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();
    paperSearcher.search('');
    reprodSearcher.search('');
    const query = event.target['search'].value;
    history.push(`/search?q=${query}`);
  }

  const history = useHistory();
  function handleSearchItemClick(path) {
    paperSearcher.search('');
    reprodSearcher.search('');
    history.push(path);
  }

  let timeoutId;
  useEffect(() => {
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timeoutId]);
  function handleBlur() {
    timeoutId = setTimeout(() => {
      setFocused(false);
    }, 250);
  }

  const loading = paperSearcher.loading || reprodSearcher.loading;
  const numHits = paperSearcher.hits.length + reprodSearcher.hits.length;
  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom-bg fixed-top">
      <Link className="navbar-brand" to="/">
        <img
          src={logo}
          alt="Reproduced Papers"
          style={{
            height: '40px',
            marginTop: '-20px',
            marginBottom: '-13px',
          }}
        />
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
          <div className="position-relative search">
            <input
              className="search-input form-control w-100"
              type="text"
              placeholder="Search for papers and reproductions"
              aria-label="Search"
              name="search"
              onChange={handleSearchChange}
              onBlur={handleBlur}
              onFocus={() => setFocused(true)}
            />
            <div
              className={`${
                focused ? 'visible' : 'invisible'
              } search-results list-group position-absolute w-100 mt-1`}
            >
              {loading && (
                <div className="list-group-item search-item">
                  <Spinner />
                </div>
              )}
              {paperSearcher.hits.length > 0 && (
                <>
                  <div className="list-group-item list-group-item-primary">
                    PAPERS
                  </div>
                  {paperSearcher.hits.map(hit => (
                    <a
                      className="list-group-item list-group-item-action"
                      key={hit.objectID}
                      role="button"
                      onClick={event => {
                        event.preventDefault();
                        handleSearchItemClick(`/papers/${hit.objectID}`);
                      }}
                      href={`/papers/${hit.objectID}`}
                    >
                      {hit.title}
                    </a>
                  ))}
                </>
              )}
              {reprodSearcher.hits.length > 0 && (
                <>
                  <div className="list-group-item list-group-item-primary">
                    REPRODUCTIONS
                  </div>
                  {reprodSearcher.hits.map(hit => (
                    <a
                      className="list-group-item list-group-item-action"
                      key={hit.objectID}
                      role="button"
                      onClick={event => {
                        event.preventDefault();
                        handleSearchItemClick(
                          getReprodUrl(hit.paperId, hit.objectID)
                        );
                      }}
                      href={getReprodUrl(hit.paperId, hit.objectID)}
                    >
                      {hit.title}
                    </a>
                  ))}
                </>
              )}
              {numHits > 0 && (
                <div className="list-group-item list-group-item-light text-right">
                  <small>
                    Search by{' '}
                    <a
                      className="text-black-50"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://algolia.com"
                    >
                      Algolia
                    </a>
                  </small>
                </div>
              )}
            </div>
          </div>
        </form>
        <ul
          className="navbar-nav ml-auto"
          data-toggle="collapse"
          data-target="#navbar-main.show"
        >
          {authUser && authUser.profile.role === 'admin' && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin">
                Admin
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            <NavLink className="nav-link" to="/" exact>
              Reproductions
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/papers">
              Papers
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/help">
              Help
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/about">
              About
            </NavLink>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="https://www.tudelft.nl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={tudelftLogo}
                className="d-inline-block align-top"
                alt="TU Delft"
                style={{
                  height: '50px',
                  marginTop: '-13px',
                  marginBottom: '-13px',
                  marginLeft: '-5px',
                }}
              />
            </a>
          </li>
          {!authUser && (
            <li className="nav-item">
              <a
                className="btn btn-outline-light my-2 my-sm-0"
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
                className="btn btn-outline-light my-2 my-sm-0 dropdown-toggle"
                href="#account"
                id="account-dropdown"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                Account
              </a>
              <div
                className="dropdown-menu dropdown-menu-right"
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
                <Link className="dropdown-item" to="/signout">
                  Sign out
                </Link>
              </div>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Header;
