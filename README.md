# Reproduced Papers

[ReproducedPapers.org](https://reproducedpapers.org) is an online repository of scientific papers reproductions with their codes. It aims to offer a platform both to share and access reproductions with both their codes and reproduction procedures (e.g. a blog post) in one place.

It is originally developed for CS4240 Deep Learning course of [TU Delft](https://www.tudelft.nl/) by [CV-Lab](https://www.tudelft.nl/ewi/over-de-faculteit/afdelingen/intelligent-systems/pattern-recognition-bioinformatics/computer-vision-lab/).

## Installation

This application is written by using [React](https://reactjs.org/) and uses [Firebase](https://firebase.google.com/) for backend and [Algolia](https://www.algolia.com/) for search index. To locally run this application you need to follow below steps:

1. Install [Node](https://nodejs.org/), [Yarn](https://yarnpkg.com/) and [Firebase CLI](https://firebase.google.com/docs/cli/). We are using Node version `14.13`, Yarn version `1.22` and Firebase CLI version `8.12`.
1. Clone this git repository to your computer by running `git clone https://github.com/CVLab-TUDelft/reproduced-papers.git`.
1. You need to create a project in each platform (one in Firebase and one in Algolia).
1. You also need to deploy firestore indexes and rules and storage rules to Firebase. To do this, run `firebase deploy --only firestore:rules firestore:indexes storage:rules`. The index creation may take sometime.
1. Copy the [.env.example](./.env.example) file and rename it as `.env` and write the needed configurations of the projects into the file.
1. Run `yarn install` to install the dependencies.
1. Finally, run `yarn start` to start the application.

## Paper

We wrote a paper titled [ReproducedPapers.org: an open online repository for teaching and structuring machine learning reproducibility](https://arxiv.org/abs/2012.01172) over the value and the necessity of an online repository of reproductions. The paper was published at the [RRPR 2020: Third ICPR Workshop on Reproducible Research in Pattern Recognition](https://rrpr2020.sciencesconf.org/).

For the paper, we conducted two small anonymous surveys on two groups:

- students who recently added their reproduction to our repository,
- anybody identifying her/himself working in AI.

And here you can download the survey data: [survey-data.zip](./public/survey-data.zip).

## Contribution

There are several ways of contributing:

1. Submitting your papers and reproductions to [ReproducedPapers.org](https://reproducedpapers.org),
1. Sharing [ReproducedPapers.org](https://reproducedpapers.org) with your colleagues,
1. Improving this web application by adding features and fixing bugs.

Please don't hesitate to send pull request!
