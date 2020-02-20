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
import Admin from './Admin';
import Users from './Users';

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
          <Route exact path="/submit-paper">
            <SubmitPaper />
          </Route>
          <Route exact path="/papers">
            <Papers />
          </Route>
          <Route path="/papers/:paperId">
            <Paper />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/users/:userId">
            <Users />
          </Route>
        </Switch>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
