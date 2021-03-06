import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { useAuthentication } from '../hooks';

import Header from './Header';
import Footer from './Footer';
import Spinner from './Spinner';
import Home from './Home';
import SubmitPaper from './SubmitPaper';
import Papers from './Papers';
import Paper from './Paper';
import SubmitReprod from './SubmitReprod';
import Admin from './Admin';
import Users from './Users';
import SignOut from './SignOut';
import Help from './Help';
import About from './About';
import Search from './Search';

function App() {
  const loading = useAuthentication();

  if (loading) {
    return <Spinner />;
  }

  return (
    <Router>
      <Header />
      <main role="main" className="container">
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/search">
            <Search />
          </Route>
          <Route exact path="/papers">
            <Papers />
          </Route>
          <Route exact path="/submit-paper">
            <SubmitPaper />
          </Route>
          <Route path="/papers/:paperId">
            <Paper />
          </Route>
          <Route path="/submit-reproduction/:paperId?">
            <SubmitReprod />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/users/:userId">
            <Users />
          </Route>
          <Route path="/signout">
            <SignOut />
          </Route>
          <Route path="/help">
            <Help />
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
