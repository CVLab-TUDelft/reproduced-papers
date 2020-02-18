import algoliasearch from 'algoliasearch';

import { algoliaConfig } from '../config';

export default class AlgoliaAPI {
  constructor() {
    this.client = algoliasearch(algoliaConfig.appId, algoliaConfig.searchKey);
    this.paperIndex = this.client.initIndex('papers');
    this.reprodIndex = this.client.initIndex('reprods');
  }

  savePaper = (id, object) =>
    this.paperIndex.saveObject({ ...object, objectID: id });

  updatePaper = (id, object) =>
    this.paperIndex.partialUpdateObject({ ...object, objectID: id });

  deletePaper = id => this.paperIndex.deleteObject(id);

  updatePaper = (id, object) =>
    this.paperIndex.partialUpdateObject({ ...object, objectID: id });

  searchPaper = (query, params) => this.paperIndex.search(query, params);

  saveReprod = (id, object) =>
    this.reprodIndex.saveObject({ ...object, objectID: id });

  updateReprod = (id, object) =>
    this.reprodIndex.partialUpdateObject({ ...object, objectID: id });

  deleteReprod = id => this.reprodIndex.deleteObject(id);

  searchReprod = (query, params) => this.reprodIndex.search(query, params);

  search = (index, query, params = {}) => {
    switch (index) {
      case 'papers':
        return this.searchPaper(query, params);
      case 'reprods':
        return this.searchReprod(query, params);
      default:
        throw new Error(`Unknown index: ${index}`);
    }
  };
}
