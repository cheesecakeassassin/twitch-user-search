import React, { useState } from 'react';
import axios from 'axios';

function UserSearch() {
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState('');
  const [followers, setFollowers] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    setHasSearched(true);

    let username = event.target.name.value;
    console.log(username);

    axios.get(`/users/${username}`).then((res) => {
      setUser(res.data.user);
      setFollowers(res.data.followers);
    });
  }

  return (
    <section>
      <form id='user-search' onSubmit={handleSubmit}>
        <div>
          <input
            type='text'
            name='name'
            placeholder='Enter your twitch name...'
          />
        </div>
        <button type='submit'>Submit</button>
      </form>
      {hasSearched && (
        <div>
          <h3>{user}</h3>
          <h3>{followers}</h3>
        </div>
      )}
    </section>
  );
}

export default UserSearch;
