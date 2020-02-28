import React from 'react';

export const LIMIT = 10;

export const STATUSES = {
  pending: { label: 'Pending', color: 'secondary' },
  rejected: { label: 'Rejected', action: 'Reject', color: 'warning' },
  published: { label: 'Published', action: 'Publish', color: 'success' },
};

export const BADGES = {
  replicated: {
    label: 'Replicated',
    description: (
      <>
        This badge is used for{' '}
        <em>running the same code (from the authors) on same data.</em>
      </>
    ),
    color: 'primary',
  },
  reproduced: {
    label: 'Reproduced',
    description: (
      <>
        This badge is used for{' '}
        <em>
          coding from scratch by only following the paper and running same
          experiments on same data.
        </em>
      </>
    ),
    color: 'success',
  },
  hyperparam: {
    label: 'Hyperparams check',
    description: (
      <>
        This badge is used for{' '}
        <em>
          running the code on same data and tuning the hyperparameters to obtain
          similar results. The code can be from the authors of the paper or
          written from scratch.
        </em>
      </>
    ),
    color: 'secondary',
  },
  newdata: {
    label: 'New data',
    description: (
      <>
        This badge is used for{' '}
        <em>
          running the code on different datasets to obtain similar results. The
          code can be from the authors of the paper or written from scratch.
        </em>
      </>
    ),
    color: 'danger',
  },
  newsetting: {
    label: 'New setting',
    description: (
      <>
        This badge is used for{' '}
        <em>
          running the code with a different setting and tuning the
          hyperparameters to obtain similar results. The code can be from the
          authors of the paper or written from scratch.
        </em>
      </>
    ),
    color: 'info',
  },
  ablation: {
    label: 'Ablation study',
    description: (
      <>
        This badge is used for <em>new ablation studies.</em>
      </>
    ),
    color: 'dark',
  },
};
