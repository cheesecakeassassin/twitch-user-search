import React, { useState } from 'react';
import axios from 'axios';
import '../../Form.css';

function UserSearch() {
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState('');
  const [followers, setFollowers] = useState('');
  const [formInput, setFormInput] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (formInput === '') {
      alert('Invalid entry: empty string.');
    } else {
      setFormInput('');

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
  }

  return (
    <section>
      <form id='user-search' onSubmit={handleSubmit}>
        <div>
          <input
            type='text'
            name='name'
            value={formInput}
            onChange={(e) => {
              setFormInput(e.target.value);
            }}
            placeholder='Enter your favorite Twitch channel...'
            autoComplete='off'
            pattern='^[a-zA-Z0-9_]{4,25}$'
          />
        </div>
        <button type='submit' className='submit w-button'>
          Submit
        </button>
        <hr></hr>
        {hasSearched && (
          <div className='results'>
            <h3>
              Twitch channel:{' '}
              <a
                href={`https://www.twitch.tv/${user}`}
                target='_blank'
                rel='noreferrer noopener'
              >
                {user}
              </a>
              &emsp;&emsp;Follower count:{' '}
              <span>{followers.toLocaleString()}</span>
            </h3>
          </div>
        )}
      </form>
    </section>
  );
}

export default UserSearch;
