import React, { useEffect } from 'react';
import jquery from 'jquery';

import { base64ContactEmail } from '../config';

function About() {
  useEffect(() => {
    const email = atob(base64ContactEmail);
    jquery('[data-toggle="tooltip"]').tooltip({
      html: true,
      title: `<a href="mailto:${email}">${email}</a>`,
    });
  }, []);

  return (
    <>
      <div className="my-3">
        <h1>Our misssion</h1>
        <p className="lead">
          We believe in the importance of open and reproducible science.
          Therefore, we are aiming to create a hub for sharing all reproduced
          papers especially for machine learning field to support and encourage
          open and reproducible science.
        </p>
      </div>
      <div className="my-3">
        <h1>Contributing</h1>
        <p className="lead">There are two ways of contributing:</p>
        <ol>
          <li>Submitting papers and reproductions,</li>
          <li>Improving the web app.</li>
        </ol>
        <p>
          You can find the source code of the web app at{' '}
          <a href="https://github.com/byildiz/reproduced-papers">
            the github repository
          </a>
          .
        </p>
        <p>Please don't hesitate to send pull request!</p>
      </div>
      <div className="my-3">
        <h1>Contact</h1>
        <p className="lead">
          You can contact with us via{' '}
          <a
            data-toggle="tooltip"
            data-placement="top"
            onClick={event => event.preventDefault()}
            href="#e-mail"
          >
            e-mail
          </a>
          .
        </p>
      </div>
    </>
  );
}

export default About;
