import React from 'react';

import ReprodForm from './ReprodForm';
import withAuthentication from './withAuthentication';

function SubmitReprod({ paper }) {
  return <ReprodForm paper={paper} />;
}

export default withAuthentication(SubmitReprod);
