import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { useSearch } from '../hooks';
import Spinner from './Spinner';
import Dialog from './Dialog';

function PaperPicker({ title, action = 'Select', onSelect, isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [focused, setFocused] = useState(false);
  const searcher = useSearch('papers');
  const { addToast } = useToasts();

  useEffect(() => {
    setSelected(null);
    setQuery('');
  }, [isOpen]);

  function handleChange(event) {
    setSelected(null);
    const value = event.target.value;
    setQuery(value);
    searcher.search(value);
  }

  function handleSelect() {
    if (!selected) {
      addToast('Select a paper first', { appearance: 'warning' });
      return;
    }
    onSelect(selected.paperId, selected.paper);
  }

  let timeoutId = useRef(null);
  useEffect(() => {
    return () => {
      clearTimeout(timeoutId.current);
    };
  }, []);

  function handleBlur() {
    timeoutId.current = setTimeout(() => {
      setFocused(false);
    }, 300);
  }

  const buttons = [
    <button key="close" className="btn btn-secondary" onClick={onClose}>
      Close
    </button>,
    <button
      key="action"
      className="btn btn-primary"
      onClick={handleSelect}
      disabled={!selected}
    >
      {action}
    </button>,
  ];

  return (
    <Dialog isOpen={isOpen} onToggle={onClose} title={title} buttons={buttons}>
      <div className="form-group position-relative">
        <input
          type="text"
          className="form-control"
          id="query"
          name="query"
          value={query}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setFocused(true)}
          autoComplete="off"
          placeholder="Type to start searching"
        />
        {focused && (
          <div
            className="list-group position-absolute w-100 mt-1"
            style={{ zIndex: 500 }}
          >
            {searcher.loading && (
              <div className="list-group-item search-item">
                <Spinner />
              </div>
            )}
            {query && query.length >= 3 && (
              <>
                {searcher.hits.length > 0 &&
                  searcher.hits.map(hit => (
                    <a
                      key={hit.objectID}
                      role="button"
                      className="list-group-item list-group-item-action"
                      onClick={event => {
                        event.preventDefault();
                        setQuery(hit.title);
                        setSelected({ paperId: hit.objectID, paper: hit });
                      }}
                      href={`#${hit.objectID}`}
                    >
                      {hit.title}
                    </a>
                  ))}
                {searcher.hits.length === 0 && (
                  <div className="list-group-item list-group-item-light text-center">
                    If you couldn't find the paper you are searching, you may
                    submit it here:
                    <br />
                    <Link
                      className="btn btn-primary"
                      to="/submit-paper"
                      role="button"
                    >
                      Submit Paper
                    </Link>
                  </div>
                )}
                <div className="list-group-item list-group-item-light text-right">
                  <small>
                    Search by{' '}
                    <a
                      className="text-black-50"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://algolia.com"
                    >
                      Algolia
                    </a>
                  </small>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

export default PaperPicker;
