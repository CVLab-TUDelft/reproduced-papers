import React from 'react';

function Footer() {
  return (
    <footer className="d-flex justify-content-center">
      <p>
        Reproduced Papers{' '}
        <small className="text-muted">
          by{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.tudelft.nl/ewi/over-de-faculteit/afdelingen/intelligent-systems/pattern-recognition-bioinformatics/computer-vision-lab/"
          >
            TU Delft CV-Lab
          </a>
        </small>
      </p>
    </footer>
  );
}

export default Footer;
