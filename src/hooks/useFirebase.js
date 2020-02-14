import { useContext } from 'react';
import { FirebaseContext } from '../firebase';

export default function useFirebase() {
  return useContext(FirebaseContext);
}
