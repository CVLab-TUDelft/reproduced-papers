import React from 'react';

function Image({ src = null, className, style }) {
  return (
    src && (
      <img
        src={src}
        alt={src}
        className={className}
        style={{
          objectFit: 'cover',
          ...style,
        }}
      />
    )
  );
}

export default Image;
