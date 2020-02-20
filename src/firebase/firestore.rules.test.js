import {
  initializeTestApp,
  loadFirestoreRules,
  apps,
  assertSucceeds,
  assertFails,
} from '@firebase/testing';
import { readFileSync } from 'fs';

const setup = async (auth, data) => {
  const projectId = `firestore-${Date.now()}`;
  console.log(projectId);
  const app = initializeTestApp({
    projectId,
    auth,
  });

  const db = app.firestore();

  // Write mock documents before rules
  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  // Apply rules
  await loadFirestoreRules({
    projectId,
    rules: readFileSync('firestore.rules', 'utf8'),
  });

  return db;
};

const teardown = async () => {
  Promise.all(apps().map(app => app.delete()));
};

expect.extend({
  async toAllow(x) {
    let pass = false;
    try {
      await assertSucceeds(x);
      pass = true;
    } catch (err) {}

    return {
      pass,
      message: () =>
        'Expected Firebase operation to be allowed, but it was denied',
    };
  },
});

expect.extend({
  async toDeny(x) {
    let pass = false;
    try {
      await assertFails(x);
      pass = true;
    } catch (err) {}
    return {
      pass,
      message: () =>
        'Expected Firebase operation to be denied, but it was allowed',
    };
  },
});

describe('Database rules', () => {
  let db;
  let ref;

  beforeAll(async () => {
    db = await setup();
    ref = db.collection('some-nonexistent-collection');
  });

  afterAll(async () => {
    await teardown();
  });

  test('fail when reading/writing an unauthorized collection', async () => {
    await expect(ref.add({})).toDeny();
    await expect(ref.get()).toDeny();
  });
});

const mockData = {
  'users/user1': {
    role: 'user',
  },
  'users/user2': {
    role: 'user',
  },
  'users/admin': {
    role: 'admin',
  },
  'papers/unpublished': {
    title: 'unpublished',
    abstract: 'unpublished',
    authors: ['unpublished'],
    urlAbstract: 'http://unpublished',
    urlPDF: 'http://unpublished',
    published: false,
    createdBy: 'user1',
    createdAt: Date.now(),
  },
  'papers/published': {
    title: 'published',
    abstract: 'published',
    authors: ['published'],
    urlAbstract: 'http://published',
    urlPDF: 'http://published',
    published: true,
    createdBy: 'user1',
    createdAt: Date.now(),
  },
  'papers/unpublished/reprods/unpublished': {
    title: 'unpublished',
    description: 'unpublished',
    authors: ['unpublished'],
    urlCode: 'a/b',
    published: false,
    createdBy: 'user1',
    createdAt: Date.now(),
  },
  'papers/unpublished/reprods/unpublished2': {
    title: 'unpublished2',
    description: 'unpublished2',
    authors: ['unpublished2'],
    urlCode: 'a/b',
    published: false,
    createdBy: 'user2',
    createdAt: Date.now(),
  },
  'papers/published/reprods/published': {
    title: 'published',
    description: 'published',
    authors: ['published'],
    urlCode: 'a/b',
    published: true,
    createdBy: 'user1',
    createdAt: Date.now(),
  },
};

describe('Reprods rules', () => {
  let db;

  afterAll(async () => {
    await teardown();
  });

  test('get published with unauthorized user', async () => {
    db = await setup(null, mockData);
    await expect(db.doc('papers/published/reprods/published').get()).toAllow();
  });

  test('get unpublished with unauthorized user', async () => {
    db = await setup(null, mockData);
    await expect(
      db.doc('papers/unpublished/reprods/unpublished').get()
    ).toDeny();
  });

  test('isCreatedBySelf with unauthorized user', async () => {
    db = await setup(null, mockData);
    await expect(
      db.doc('papers/unpublished/reprods/reprod1').set({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlBlog: '',
        urlCode: 'a/b',
        published: false,
        createdBy: 'user1',
        createdAt: Date.now(),
      })
    ).toAllow();
  });

  test('isCreatedBySelf with authorized user', async () => {
    db = await setup({ uid: 'user1' }, mockData);
    await expect(
      db.doc('papers/unpublished/reprods/reprod1').set({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlBlog: '',
        urlCode: 'a/b',
        published: false,
        createdBy: 'user1',
        createdAt: Date.now(),
      })
    ).toAllow();
    await expect(
      db.doc('papers/unpublished/reprods/reprod1').set({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlBlog: '',
        urlCode: 'a/b',
        published: false,
        createdBy: 'user2',
        createdAt: Date.now(),
      })
    ).toDeny();
  });

  test('reprodCreateCheck with authorized user', async () => {
    db = await setup({ uid: 'user1' }, mockData);
    await expect(
      db.doc('papers/unpublished/reprods/reprod1').set({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlBlog: '',
        urlCode: 'a/b',
        published: true,
        createdBy: 'user1',
        createdAt: Date.now(),
      })
    ).toDeny();
    await expect(
      db.doc('papers/unpublished/reprods/reprod1').set({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlBlog: '',
        urlCode: 'a/b',
        published: false,
        // createdBy: 'user1',
        createdBy: 'user1',
      })
    ).toDeny();
    await expect(
      db.doc('papers/unpublished/reprods/reprod1').set({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlBlog: '',
        urlCode: 'a/b',
        published: false,
        createdBy: 'user1',
        createdAt: Date.now(),
      })
    ).toAllow();
  });

  test('isUpdatedBySelf with unauthorized user', async () => {
    db = await setup(null, mockData);
    await expect(
      db.doc('papers/published/reprods/published').update({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlCode: 'a/b',
        published: false,
        createdBy: 'user1',
        createdAt: Date.now(),
      })
    ).toDeny();
  });

  test('isUpdatedBySelf with authorized user', async () => {
    db = await setup({ uid: 'user1' }, mockData);
    await expect(
      db.doc('papers/published/reprods/published').update({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlCode: 'a/b',
        published: false,
        updatedBy: 'user1',
      })
    ).toAllow();
    await expect(
      db.doc('papers/published/reprods/published').update({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlCode: 'a/b',
        published: false,
        updatedBy: 'user2',
      })
    ).toDeny();
    await expect(
      db.doc('papers/unpublished/reprods/unpublished2').update({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlCode: 'a/b',
        published: false,
        updatedBy: 'user1',
      })
    ).toDeny();
  });

  test('reprodUpdateCheck with authorized user', async () => {
    db = await setup({ uid: 'user1' }, mockData);
    await expect(
      db.doc('papers/unpublished/reprods/unpublished').update({
        title: 'reprod1',
        description: 'reprod1',
        authors: ['reprod1'],
        urlCode: 'a/b',
        published: false,
        createdBy: 'user1',
      })
    ).toDeny();
    await expect(
      db.doc('papers/unpublished/reprods/unpublished').update({
        // title: 'test',
        // description: 'test',
        // authors: ['test'],
        // urlBlog: 'http://test',
        // urlCode: 'a/b',
        // published: false,
        // publishedBy: 'user1',
        // publishedAt: Date.now(),
        updatedBy: 'user1',
        // // test: 'dsa',
        // updatedAt: Date.now(),
      })
    ).toAllow();
  });

  test('admin do whatever s/he wants', async () => {
    db = await setup({ uid: 'admin' }, mockData);
    await expect(
      db.doc('papers/unpublished/reprods/reprod2').set({ unknownField: 'test' })
    ).toAllow();
    await expect(db.collectionGroup('reprods').get()).toAllow();
  });
});
