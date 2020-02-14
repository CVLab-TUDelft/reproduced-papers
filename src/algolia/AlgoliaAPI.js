import algoliasearch from 'algoliasearch';

import { algoliaConfig } from '../config';

export default class AlgoliaAPI {
  constructor() {
    this.client = algoliasearch(algoliaConfig.appId, algoliaConfig.searchKey);
    this.papers = this.client.initIndex('papers');
    this.reprods = this.client.initIndex('reprods');
  }

  addPaper = paper => this.papers.saveObject(paper);

  searchPaper = (query, params) => this.papers.search(query, params);

  addReprod = reprod => this.reprods.saveObject(reprod);

  searchReprod = (query, params) => this.reprods.search(query, params);

  search = (index, query, params) => {
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
