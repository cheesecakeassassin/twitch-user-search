import React from 'react';

function InitialScreen() {

  function handleSubmit(event) {
    event.preventDefault();

    let username = event.target.name;
    console.log(username.value);
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
