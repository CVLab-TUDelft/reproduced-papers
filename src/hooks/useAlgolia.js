import { useContext } from 'react';
import { AlgoliaContext } from '../algolia';

export default function useAlgolia() {
  return useContext(AlgoliaContext);
}
