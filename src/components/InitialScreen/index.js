import React from 'react';

function InitialScreen() {

  function handleSubmit(e) {
    e.preventDefault();
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
    </section>
  );
}

export default InitialScreen;
