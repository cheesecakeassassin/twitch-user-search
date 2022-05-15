import React, { useState } from 'react';
import axios from 'axios'; // Used to make HTTP requests
import '../../Form.css';

function UserSearch() {
  // States that will be frequently changed
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState('');
  const [followers, setFollowers] = useState('');
  const [formInput, setFormInput] = useState('');

  // Function to handle form submission
  function handleSubmit(event) {
    event.preventDefault();
    // Validates entry to make sure it isn't empty
    if (formInput === '') {
      alert('Invalid entry: empty string.');
    } else {
      setFormInput(''); // Resets form

      // Displays Twitch name and followers after a valid entry is submitted
      if (!hasSearched) {
        setHasSearched(true);
      }

      // Gets username from form entry
      let username = event.target.name.value;

      // Makes an API call to the ExpressJS server
      axios.get(`/users/${username}`).then((res) => {
        // Gets username and followers from API
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
            onChange={(e) => { // Only purpose is to reset form after submit
              setFormInput(e.target.value);
            }}
            placeholder='Enter your favorite Twitch channel...'
            autoComplete='off' // Cleaner look w/o autocomplete
            pattern='^[a-zA-Z0-9_]{4,25}$' // Validates entry with regex
          />
        </div>
        <button type='submit' className='submit w-button'>
          Submit
        </button>
        {/* Inserts a line break for flexbox */}
        <hr></hr>
        {/* Conditionally renders results once a valid entry is submitted */}
        {hasSearched && (
          <div className='results'>
            <h3>
              Twitch channel:{' '}
              <a
                href={`https://www.twitch.tv/${user}`} // Link to channel
                target='_blank' // Opens new tab when link is clicked
                rel='noreferrer noopener'
              >
                {user}
              </a>
              {/* &emsp used for spacing */}
              &emsp;&emsp;Follower count:{' '}
              {/* toLocaleString() formats the followers with commas */}
              <span>{followers.toLocaleString()}</span>
            </h3>
          </div>
        )}
      </form>
    </section>
  );
}

export default UserSearch;
