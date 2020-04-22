import React, { useState, useEffect, useRef } from 'react';

import { useSearch } from '../hooks';
import Spinner from './Spinner';
import Dialog from './Dialog';

function PaperPicker({ title, onPick, isOpen, onClose }) {
  const [focused, setFocused] = useState(false);
  const searcher = useSearch('papers');

  function showPapers(event) {
    searcher.search(event.target.value);
  }

  let timeoutId = useRef(null);
  useEffect(() => {
    return () => {
      clearTimeout(timeoutId.current);
    };
  });

  function handleBlur() {
    timeoutId.current = setTimeout(() => {
      setFocused(false);
    }, 300);
  }

  return (
    <Dialog isOpen={isOpen} onToggle={onClose} title={title}>
      <div className="form-group position-relative">
        <input
          type="text"
          className="form-control"
          id="title"
          name="title"
          onChange={showPapers}
          onBlur={handleBlur}
          onFocus={() => setFocused(true)}
          autoComplete="off"
          placeholder="Search a paper"
        />
        {focused && (
          <div className="list-group position-absolute w-100 mt-1">
            {searcher.loading && (
              <div className="list-group-item search-item">
                <Spinner />
              </div>
            )}
            {searcher.hits.length > 0 && (
              <>
                {searcher.hits.map(hit => (
                  <a
                    key={hit.objectID}
                    role="button"
                    className="list-group-item list-group-item-action"
                    onClick={event => {
                      event.preventDefault();
                      onPick(hit.objectID, hit);
                    }}
                    href={`#${hit.objectID}`}
                  >
                    {hit.title}
                  </a>
                ))}

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
