import React from 'react';

function Profile({ user }) {
  const data = user.data();
  return (
    <dl>
      <dt>Display Name</dt>
      <dd>{data.displayName}</dd>
      <dt>E-mail</dt>
      <dd>{data.email}</dd>
    </dl>
  );
}

export default Profile;
