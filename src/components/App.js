import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { useAuthentication } from '../hooks';

import Header from './Header';
import Footer from './Footer';
import Spinner from './Spinner';
import Home from './Home';
import SubmitPaper from './SubmitPaper';
import SubmitReprod from './SubmitReprod';
import Papers from './Papers';
import Paper from './Paper';

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
          <Route exact path="/submit-reproduction/:paperId">
            <SubmitReprod />
          </Route>
          <Route path="/papers">
            <Route exact path="/papers">
              <Papers />
            </Route>
            <Route exact path="/papers/:paperId">
              <Paper />
            </Route>
            <Route exact path="/papers/:paperId/submit-reproduction">
              <Paper />
            </Route>
          </Route>
        </Switch>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
