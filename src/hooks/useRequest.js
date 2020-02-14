import { useReducer, useEffect } from 'react';

const INITIAL_STATE = {
  data: null,
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return { ...state, data: action.data, loading: false, error: null };
    case 'ERROR':
      return { ...state, error: action.error, loading: false };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export default function useRequest(fetcher, onError = null) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  console.log(state);

  useEffect(() => {
    let canceled = false;
    dispatch({ type: 'REQUEST' });
    fetcher()
      .then(data => {
        if (!canceled) {
          dispatch({ type: 'SUCCESS', data });
        }
      })
      .catch(error => {
        if (!canceled) {
          dispatch({ type: 'ERROR', error });
          onError && onError(error);
        }
      });
    return () => {
      canceled = true;
    };
  }, [fetcher, onError]);

  return state;
}
