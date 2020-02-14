import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { firebaseConfig } from '../config';

export default class FirebaseAPI {
  constructor() {
    app.initializeApp(firebaseConfig);

    this.FieldValue = app.firestore.FieldValue;
    this.Timestamp = app.firestore.Timestamp;

    this.auth = app.auth();
    this.db = app.firestore();

    this.authUser = null;

    this.githubProvider = new app.auth.GithubAuthProvider();
  }

  signInWithGithub = () => this.auth.signInWithPopup(this.githubProvider);

  signOut = () => this.auth.signOut();

  user = uid => this.db.doc(`users/${uid}`);

  users = () => this.db.collection('users');

  getProfile = uid =>
    this.user(uid)
      .get()
      .then(snapshot => {
        if (!snapshot.exists) {
          return {};
        }
        const user = snapshot.data();
        if (!user.role) {
          user.role = 'user';
        }
        return user;
      });

  onAuthStateChanged = listener =>
    this.auth.onAuthStateChanged(authUser => {
      if (!authUser) {
        this.authUser = authUser;
        listener(authUser);
        return;
      }
      this.getProfile(authUser.uid).then(profile => {
        authUser.profile = profile;
        this.authUser = authUser;
        listener(authUser);
      });
    });

  paper = id => this.db.doc(`papers/${id}`);

  papers = () => this.db.collection('papers');

  getPaper = id => this.paper(id).get();

  getPapers = () =>
    this.papers()
      .get()
      .then(snapshot => snapshot.docs);

  reprod = (paperId, id) =>
    this.db.collection(`papers/${paperId}/reprods/${id}`);

  reprods = paperId => this.db.collection(`papers/${paperId}/reprods`);

  getReprodsOfPaper = paperId =>
    this.reprods(paperId)
      .get()
      .then(snapshot => snapshot.docs);
}
