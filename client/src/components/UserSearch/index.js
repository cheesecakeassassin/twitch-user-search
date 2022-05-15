import React, { useState } from 'react';
import axios from 'axios';
import '../../Form.css';

function UserSearch() {
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState('');
  const [followers, setFollowers] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!hasSearched) {
      setHasSearched(true);
    }

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
            placeholder='Enter your favorite Twitch channel...'
            autoComplete='off'
          />
        </div>
        <button type='submit' className='submit w-button'>
          Submit
        </button>

        {hasSearched && (
          <div className='results'>
            <h3 className='channel'>
              Twitch channel:{' '}
              <a href={`https://www.twitch.tv/${user}`} target='_blank' rel='noreferrer noopener'>{user}</a>
            </h3>
            <h3 className='followers'>Follower count: <span>{followers.toLocaleString()}</span></h3>
          </div>
        )}
      </form>
    </section>
  );
}

export default UserSearch;
