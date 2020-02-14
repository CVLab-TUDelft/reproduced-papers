import { useEffect, useReducer } from 'react';
import { useToasts } from 'react-toast-notifications';

import { useAlgolia, useFirebase } from '.';

const INITIAL_STATE = {
  query: '',
  hits: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SEARCH':
      return { ...state, query: action.query, loading: true };
    case 'SUCCESS':
      return { ...state, hits: action.hits, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    case 'EMPTY':
      return { ...state, hits: [], loading: false };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export default function useSearch(index) {
  const firebase = useFirebase();
  const authUser = firebase.authUser;
  const algolia = useAlgolia();
  const { addToast } = useToasts();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    let canceled = false;
    const query = state.query;
    let timeoutId;
    if (query.length > 2) {
      timeoutId = setTimeout(() => {
        algolia
          .search(index, query, {
            filters: authUser
              ? `publish:1 OR createdBy:${authUser.uid}`
              : 'publish:1',
          })
          .then(result => {
            if (!canceled) {
              dispatch({ type: 'SUCCESS', hits: result.hits });
            }
          })
          .catch(error => {
            if (!canceled) {
              dispatch({ type: 'ERROR', error });
              addToast(error.message, { appearance: 'error' });
            }
          });
      }, 300);
    } else {
      dispatch({ type: 'EMPTY' });
    }

    return () => {
      canceled = true;
      clearTimeout(timeoutId);
    };
  }, [addToast, state.query, algolia, authUser, index]);

  function search(query) {
    dispatch({ type: 'SEARCH', query });
  }

  return { ...state, search };
}
