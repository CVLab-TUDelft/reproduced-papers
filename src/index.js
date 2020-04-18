import React from 'react';
import ReactDOM from 'react-dom';
import {
  ToastProvider,
  DefaultToastContainer,
  DefaultToast,
} from 'react-toast-notifications';

import FirebaseAPI, { FirebaseContext } from './firebase';
import AlgoliaAPI, { AlgoliaContext } from './algolia';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

// bootstrap
import 'jquery/dist/jquery.slim';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './index.scss';

const firebase = new FirebaseAPI();
const algolia = new AlgoliaAPI();

function ToastContainer(props) {
  return <DefaultToastContainer {...props} className="my-toast-container" />;
}

function Toast({ children, ...props }) {
  return (
    <DefaultToast
      {...props}
      className={`my-toast my-toast-${props.appearance}`}
    >
      {children}
    </DefaultToast>
  );
}

ReactDOM.render(
  <ToastProvider autoDismiss components={{ ToastContainer, Toast }}>
    <FirebaseContext.Provider value={firebase}>
      <AlgoliaContext.Provider value={algolia}>
        <App />
      </AlgoliaContext.Provider>
    </FirebaseContext.Provider>
  </ToastProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
