import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { get } from 'lodash/fp';

import { firebaseConfig } from '../config';

export default class FirebaseAPI {
  constructor() {
    app.initializeApp(firebaseConfig);

    this.FieldValue = app.firestore.FieldValue;
    this.Timestamp = app.firestore.Timestamp;

    this.auth = app.auth();
    this.db = app.firestore();
    this.storage = app.storage();

    this.authUser = null;

    this.githubProvider = new app.auth.GithubAuthProvider();
  }

  creating = data => ({
    ...data,
    createdAt: this.FieldValue.serverTimestamp(),
    createdBy: this.authUser.uid,
  });

  updating = data => ({
    ...data,
    updatedAt: this.FieldValue.serverTimestamp(),
    updatedBy: this.authUser.uid,
  });

  signInWithGithub = async () => {
    const result = await this.auth.signInWithPopup(this.githubProvider);
    const uid = get('user.uid', result);
    const exists = await this.user(uid)
      .get()
      .then(doc => doc.exists);
    if (result.additionalUserInfo.isNewUser || !exists) {
      const data = {
        displayName: get('user.displayName', result),
        email: get('user.email', result),
        role: 'user',
      };
      return this.user(uid).set(this.creating(data), { merge: true });
    }
  };

  signOut = () => this.auth.signOut();

  user = uid => this.db.doc(`users/${uid}`);

  users = () => this.db.collection('users');

  getUser = uid => this.user(uid).get();

  getUsers = async (params = {}) => {
    const q = this.users();
    return this.query(q, params);
  };

  updateUser = async (uid, data) => {
    const doc = this.user(uid);
    await doc.update(this.updating(data));
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
      if (Array.isArray(orderBy)) {
        q = q.orderBy(...orderBy);
      } else {
        q = q.orderBy(orderBy);
      }
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
    if (get('profile.role')(this.authUser) !== 'admin') {
      const where = ['status', 'in', ['pending', 'published']];
      if (!params.where) {
        params.where = [where];
      } else {
        params.where.push(where);
      }
    }
    if (!params.orderBy) {
      params.orderBy = ['createdAt', 'desc'];
    }
    const q = this.papers();
    return this.query(q, params);
  };

  getUserPapers = async (uid, params = {}) => {
    const where = ['createdBy', '==', uid];
    if (!params.where) {
      params.where = [where];
    } else {
      params.where.push(where);
    }
    if (!params.orderBy) {
      params.orderBy = ['createdAt', 'desc'];
    }
    const q = this.papers();
    return this.query(q, params);
  };

  addPaper = data => this.papers().add(this.creating(data));

  updatePaper = async (id, data) => {
    const doc = this.paper(id);
    await doc.update(this.updating(data));
    return doc;
  };

  deletePaper = id => this.paper(id).delete();

  mergePapers = async (id1, id2) => {
    const reprods = await this.getPaperReprods(id2);
    const colRef = this.paperReprods(id1);
    for (const reprod of reprods) {
      const reprodData = reprod.data();
      reprodData.paperId = id1;
      await colRef.doc(reprod.id).set(reprodData);
      await reprod.ref.delete();
    }
  };

  getPaperTables = async paperId => {
    const reprods = await this.getPaperReprods(paperId);
    return reprods.reduce(
      (prev, curr) => ({ ...prev, ...curr.get('tables') }),
      {}
    );
  };

  reprod = (paperId, id) => this.db.doc(`papers/${paperId}/reprods/${id}`);

  paperReprods = paperId => this.db.collection(`papers/${paperId}/reprods`);

  getPaperReprod = (paperId, id) => this.reprod(paperId, id).get();

  getPaperReprods = async (paperId, params = {}) => {
    if (get('profile.role')(this.authUser) !== 'admin') {
      const where = [
        ['status', 'in', ['pending', 'published']],
        ['visibility', '==', 'public'],
      ];
      if (!params.where) {
        params.where = where;
      } else {
        params.where = [...params.where, ...where];
      }
    }
    if (!params.orderBy) {
      params.orderBy = ['createdAt', 'desc'];
    }
    const q = this.paperReprods(paperId);
    return this.query(q, params);
  };

  reprods = () => this.db.collectionGroup('reprods');

  getReprods = async (params = {}) => {
    if (!this.authUser || this.authUser.profile.role !== 'admin') {
      const where = [
        ['status', 'in', ['pending', 'published']],
        ['visibility', '==', 'public'],
      ];
      if (!params.where) {
        params.where = where;
      } else {
        params.where = [...params.where, ...where];
      }
    }
    if (!params.orderBy) {
      params.orderBy = ['createdAt', 'desc'];
    }
    const q = this.reprods();
    return this.query(q, params);
  };

  getUserReprods = async (uid, params = {}) => {
    const where = ['createdBy', '==', uid];
    if (!params.where) {
      params.where = [where];
    } else {
      params.where.push(where);
    }
    if (!params.orderBy) {
      params.orderBy = ['createdAt', 'desc'];
    }
    const q = this.reprods();
    return this.query(q, params);
  };

  addReprod = (paperId, data) =>
    this.paperReprods(paperId).add(this.creating(data));

  updateReprod = async (paperId, id, data) => {
    const doc = this.reprod(paperId, id);
    await doc.update(this.updating(data));
    return doc;
  };

  deleteReprod = async (paperId, id) => {
    const reprod = await this.getPaperReprod(paperId, id);
    const imagePath = reprod.get('imagePath');
    if (imagePath) {
      await this.storage
        .ref(imagePath)
        .delete()
        .then(
          () => {},
          error => error
        );
    }
    return reprod.ref.delete();
  };
}
