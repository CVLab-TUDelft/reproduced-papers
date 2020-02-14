import React from 'react';

import PaperForm from './PaperForm';
import withAuthentication from './withAuthentication';

function SubmitPaper() {
  return <PaperForm />;
}

export default withAuthentication(SubmitPaper);
