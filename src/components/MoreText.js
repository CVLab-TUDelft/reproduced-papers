import React, { useState } from 'react';
import { truncate } from 'lodash';

function MoreText({ text, length = 300, ...props }) {
  const [show, setShow] = useState(false);
  if (text.length <= length) {
    return <p {...props}>{text}</p>;
  }
  const link = (
    <a
      href={`#${show ? 'less' : 'more'}`}
      onClick={event => {
        event.preventDefault();
        setShow(!show);
      }}
    >
      {show ? 'Less' : 'More'}
    </a>
  );
  return (
    <p {...props}>
      {show
        ? text
        : truncate(text, {
            length: length,
            separator: ' ',
          })}{' '}
      {link}
    </p>
  );
}

export default MoreText;
