import React from 'react';
import './App.css';
import UserSearch from './components/UserSearch';

function App() {
  return (
    <div>
      <header>
        <h1 className='title'>Twitch User Search</h1>
      </header>
      <main>
        <UserSearch></UserSearch>
      </main>
      <footer>
        <p>
          Created by{' '}
          <a
            href='https://github.com/cheesecakeassassin'
            target='_blank' // Opens new tab when link is clicked
            rel='noreferrer noopener'
          >
            cheesecakeassassin 🎅
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
