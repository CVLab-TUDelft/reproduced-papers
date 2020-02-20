import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { get } from 'lodash/fp';

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

  signInWithGithub = () =>
    this.auth.signInWithPopup(this.githubProvider).then(result => {
      if (result.additionalUserInfo.isNewUser) {
        const data = {
          displayName: get('user.displayName', result),
          email: get('user.email', result),
          role: 'user',
        };
        return this.user(get('user.uid', result)).set(data, { merge: true });
      }
    });

  signOut = () => this.auth.signOut();

  user = uid => this.db.doc(`users/${uid}`);

  users = () => this.db.collection('users');

  getUser = uid => this.user(uid).get();

  getUsers = () => this.users().get();

  updateUser = async (uid, data) => {
    const doc = this.user(uid);
    await doc.update(data);
    return doc;
  };

  getProfile = uid =>
    this.user(uid)
      .get()
      .then(snapshot => {
        let user = {};
        if (snapshot.exists) {
          user = snapshot.data();
        }
        if (!user.role) {
          user.role = 'user';
        }
        return user;
      });

  onAuthStateChanged = listener =>
    this.auth.onAuthStateChanged(authUser => {
      if (!authUser) {
        this.authUser = null;
        listener(null);
        return;
      }
      this.getProfile(authUser.uid).then(profile => {
        authUser.profile = profile;
        this.authUser = authUser;
        listener(authUser);
      });
    });

  query = (q, params = {}) => {
    const { where, limit, orderBy, startAfter } = params;
    if (where) {
      where.forEach(w => {
        q = q.where(...w);
      });
    }
    if (limit) {
      q = q.limit(limit);
    }
    if (orderBy) {
      q = q.limit(orderBy);
    }
    if (startAfter) {
      q = q.startAfter(startAfter);
    }
    return q.get().then(snapshot => snapshot.docs);
  };

  paper = id => this.db.doc(`papers/${id}`);

  papers = () => this.db.collection('papers');

  getPaper = id => this.paper(id).get();

  getPapers = async (params = {}) => {
    let q = this.papers();
    if (get('profile.role')(this.authUser) !== 'admin') {
      const where = ['published', '==', true];
      if (!params.where) {
        params.where = [where];
      } else {
        params.where.push(where);
      }
    }
    return this.query(q, params);
  };

  getUserPapers = async (uid, params = {}) => {
    let q = this.papers();
    const where = ['createdBy', '==', uid];
    if (!params.where) {
      params.where = [where];
    } else {
      params.where.push(where);
    }
    return this.query(q, params);
  };

  addPaper = data => this.papers().add(data);

  updatePaper = async (id, data) => {
    const doc = this.paper(id);
    await doc.update(data);
    return doc;
  };

  deletePaper = id => this.paper(id).delete();

  reprod = (paperId, id) => this.db.doc(`papers/${paperId}/reprods/${id}`);

  paperProds = paperId => this.db.collection(`papers/${paperId}/reprods`);

  getPaperReprod = (paperId, id) => this.reprod(paperId, id).get();

  getPaperReprods = async (paperId, params = {}) => {
    let q = this.paperProds(paperId);
    if (get('profile.role')(this.authUser) !== 'admin') {
      const where = ['published', '==', true];
      if (!params.where) {
        params.where = [where];
      } else {
        params.where.push(where);
      }
    }
    return this.query(q, params);
  };

  reprods = () => this.db.collectionGroup('reprods');

  getReprods = async (params = {}) => {
    let q = this.reprods();
    if (!this.authUser || this.authUser.profile.role !== 'admin') {
      const where = ['published', '==', true];
      if (!params.where) {
        params.where = [where];
      } else {
        params.where.push(where);
      }
    }
    return this.query(q, params);
  };

  getUserReprods = async (uid, params = {}) => {
    let q = this.reprods();
    const where = ['createdBy', '==', uid];
    if (!params.where) {
      params.where = [where];
    } else {
      params.where.push(where);
    }
    return this.query(q, params);
  };

  addReprod = (paperId, data) => this.paperProds(paperId).add(data);

  updateReprod = async (paperId, id, data) => {
    const doc = this.reprod(paperId, id);
    await doc.update(data);
    return doc;
  };

  deleteReprod = (paperId, id) => this.reprod(paperId, id).delete();
}
