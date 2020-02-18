import { useReducer, useEffect } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      const byId = {};
      const ids = [];
      (action.docs || []).forEach(doc => {
        byId[doc.id] = { ...doc.data(), id: doc.id, doc };
        ids.push(doc.id);
      });
      return { ...state, byId, ids };
    case 'SET':
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.id]: { ...state.byId[action.id], ...action.data },
        },
      };
    case 'DELETE':
      return { ...state, ids: state.ids.filter(id => id !== action.id) };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export default function useCollection(docs) {
  const [state, dispatch] = useReducer(reducer, { byId: {}, ids: [] });
  useEffect(() => {
    dispatch({ type: 'SET_DATA', docs });
  }, [docs]);
  return [state, dispatch];
}
