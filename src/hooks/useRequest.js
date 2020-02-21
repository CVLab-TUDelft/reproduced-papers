import { useReducer, useEffect, useCallback, useRef } from 'react';
import { useToasts } from 'react-toast-notifications';

const INITIAL_STATE = {
  data: null,
  loading: true,
  error: null,
  hasMore: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return {
        ...state,
        data: action.data,
        loading: false,
        error: null,
        hasMore: Array.isArray(action.data) ? !!action.data.length : false,
      };
    case 'APPEND':
      return {
        ...state,
        data: [...state.data, ...action.data],
        loading: false,
        error: null,
        hasMore: !!action.data.length,
      };
    case 'ERROR':
      return { ...state, error: action.error, loading: false };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Fetches data with the given fetcher function
 * The params should be memoized, other wise for every new parameter it fetches
 * again and again. Be careful for inifine loop!
 *
 * @param {function} fetcher fetches data from api
 * @param {any} params parameters for function
 */
export default function useRequest(fetcher, params) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // define error function
  const { addToast } = useToasts();
  const onError = useCallback(
    error => addToast(error.message, { appearance: 'error' }),
    [addToast]
  );

  // keep mount state
  const didUnmount = useRef(false);

  useEffect(() => {
    didUnmount.current = false;
    dispatch({ type: 'REQUEST' });
    fetcher({ ...params })
      .then(data => {
        if (!didUnmount.current) {
          dispatch({ type: 'SUCCESS', data });
        }
      })
      .catch(error => {
        if (!didUnmount.current) {
          dispatch({ type: 'ERROR', error });
          onError && onError(error);
        }
      });
    return () => {
      didUnmount.current = true;
    };
  }, [fetcher, onError, params]);

  function fetchMore() {
    const oldData = state.data;
    if (state.hasMore && oldData && Array.isArray(oldData)) {
      dispatch({ type: 'REQUEST' });
      fetcher({ ...params, startAfter: oldData[oldData.length - 1] })
        .then(data => {
          if (!didUnmount.current) {
            dispatch({ type: 'APPEND', data });
          }
        })
        .catch(error => {
          if (!didUnmount.current) {
            dispatch({ type: 'ERROR', error });
            onError && onError(error);
          }
        });
    }
  }

  return { ...state, fetchMore };
}
