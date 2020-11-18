import React, { useEffect } from 'react';
import jquery from 'jquery';

import { base64ContactEmail } from '../config';
import { BADGES } from '../constants';
import Badge from './Badge';

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
        <h1>Our mission</h1>
        <p className="lead">
          We believe in the importance of open and reproducible science.
          Therefore, we are aiming to create a hub for sharing all reproduced
          papers especially for machine learning field to support and encourage
          open and reproducible science.
        </p>
      </div>
      <div className="my-3">
        <h1>Reproduction badges</h1>
        <p className="lead">
          We offer a number of badges to make easy to identify the type of works
          done during reprodution.
          <br />
          List of badges:
          <ol>
            {Object.keys(BADGES).map(badgeKey => (
              <li key={badgeKey}>
                <Badge badgeKey={badgeKey} />
                <br />
                <span className="text-muted">
                  {BADGES[badgeKey].description}
                </span>
              </li>
            ))}
          </ol>
        </p>
      </div>
      <div className="my-3">
        <h1>Survey data</h1>
        <p className="lead">
          We conducted two small anonymous surveys for two groups:
          <ol type="i">
            <li>
              students who recently added their reproduction to our repository,
            </li>
            <li>anybody identifying her/himself working in AI.</li>
          </ol>
          Here you can download the data:{' '}
          <a href={process.env.PUBLIC_URL + '/survey-data.zip'}>
            survey-data.zip
          </a>
          .
        </p>
      </div>
      <div className="my-3">
        <h1>Other resources</h1>
        <ol>
          <li>
            <a
              href="https://paperswithcode.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Papers With Code
            </a>
          </li>
          <li>
            <a
              href="https://cknowledge.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Collective Knowledge
            </a>
          </li>
          <li>
            <a
              href="http://rescience.github.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ReScience C
            </a>
          </li>
          <li>
            <a
              href="https://ai.facebook.com/blog/how-the-ai-community-can-get-serious-about-reproducibility/"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Machine Learning Reproducibility Checklist
            </a>
          </li>
          <li>
            <a
              href="https://sites.google.com/view/icml-reproducibility-workshop/home"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reproducibility in Machine Learning: An ICLR 2019 Workshop
            </a>
          </li>
          <li>
            <a
              href="https://sotabench.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              sotabench
            </a>
          </li>
          <li>
            <a
              href="https://paperswithcode.com/rc2020"
              target="_blank"
              rel="noopener noreferrer"
            >
              ML Reproducibility Challenge 2020
            </a>
          </li>
        </ol>
      </div>
      <div className="my-3">
        <h1>Contributing</h1>
        <p className="lead">
          There are two ways of contributing:
          <ol>
            <li>Submitting papers and reproductions,</li>
            <li>Improving the web app.</li>
          </ol>
          You can find the source code of the web app at{' '}
          <a href="https://github.com/CVLab-TUDelft/reproduced-papers">
            the github repository
          </a>
          .
        </p>
        <p className="lead">Please don't hesitate to send pull request!</p>
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
