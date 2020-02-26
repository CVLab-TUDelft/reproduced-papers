import { useEffect, useReducer, useRef } from 'react';
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
  const timeoutId = useRef(null);

  const willUnmount = useRef(false);
  useEffect(() => {
    return () => {
      willUnmount.current = true;
    };
  }, []);

  function search(query) {
    clearTimeout(timeoutId.current);
    dispatch({ type: 'SEARCH', query });
    return new Promise((resolve, reject) => {
      if (query.length > 2) {
        timeoutId.current = setTimeout(() => {
          const params = {};
          if (!authUser || authUser.profile.role !== 'admin') {
            params.filters = 'published=1';
          }
          algolia
            .search(index, query, params)
            .then(result => {
              if (!willUnmount.current) {
                dispatch({ type: 'SUCCESS', hits: result.hits });
                resolve(true);
              }
            })
            .catch(error => {
              if (!willUnmount.current) {
                dispatch({ type: 'ERROR', error });
                addToast(error.message, { appearance: 'error' });
                resolve(false);
              }
            });
        }, 200);
      } else {
        dispatch({ type: 'EMPTY' });
        resolve(true);
      }
    });
  }

  return { ...state, search };
}
