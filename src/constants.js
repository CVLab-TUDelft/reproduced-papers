export const LIMIT = 10;

export const STATUSES = {
  pending: { label: 'Pending', color: 'secondary' },
  rejected: { label: 'Rejected', action: 'Reject', color: 'warning' },
  published: { label: 'Published', action: 'Publish', color: 'success' },
};

export const BADGES = {
  reproduced: {
    label: 'Reproduced',
    description:
      'A full reproduction from scratch without using any pre-existing code.',
    color: 'success',
  },
  replicated: {
    label: 'Replicated',
    description: 'Existing code was evaluated.',
    color: 'warning',
  },
  hyperparam: {
    label: 'Hyperparams check',
    description: 'Evaluating sensitivity to hyperparameters.',
    color: 'secondary',
  },
  newdata: {
    label: 'New data',
    description: 'Evaluating different datasets to obtain similar results.',
    color: 'light',
  },
  newalgorithm: {
    label: 'New algorithm variant',
    description: 'Evaluating a slightly different variant.',
    color: 'info',
  },
  newcode: {
    label: 'New code variant',
    description: 'Rewrote existing code to be more efficient/readable.',
    color: 'primary',
  },
  ablation: {
    label: 'Ablation study',
    description: 'Additional ablation studies.',
    color: 'dark',
  },
};
