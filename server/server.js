require('dotenv').config(); // Safeguarding private keys in a .env file
const express = require('express'); // Web server
const path = require('path'); // Allows easy path modifications
const axios = require('axios'); // HTTP request helper
const Redis = require('redis'); // In-memory caching db

// Declaring port for server to be hosted on
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Redis client used to quickly cache using RAM
let redisClient;

if (process.env.NODE_ENV === 'production') {
  // For Heroku deployment
  redisClient = Redis.createClient({ url: process.env.REDIS_URL });
} else {
  // For local usage
  redisClient = Redis.createClient();
}
// Printing status updates for Redis
redisClient.on('error', (err) => console.error('Redis error...', err));
redisClient.on('connect', () => console.log('Redis is connected...'));
redisClient.on('reconnecting', () => console.log('Redis is reconnecting...'));
redisClient.on('ready', () => console.log('Redis is ready...'));

// Connects client to redis-server
redisClient.connect();

const DEFAULT_EXPIRATION = 300; // Default lifetime for cached items (5 minutes)
const DEFAULT_USERNAME = 'cheesecake_assassin'; // Default username if invalid name is given
const DEFAULT_USERID = '81995906'; // Default user ID if invalid name is given

// Creates endpoint that
app.get('/users/:username', async (req, res) => {
  // Let instead of const because username will be modified if invalid
  let username = req.params.username;

  const userData = await redisClient.get(username); // Gets user from cache

  // If user is in cache, data will be immediately served
  if (userData != null) {
    return res.status(200).json({
      user: username,
      followers: JSON.parse(userData),
      cache_expiration: await redisClient.ttl(username),
    });
  } else {
    // Fetch data from API if user is not in cache
    const { data } = await axios.get(
      `https://api.twitch.tv/helix/users?login=${username}`,
      {
        headers: {
          'Client-Id': `${process.env.CLIENT_ID}`,
          Authorization: `Bearer ${process.env.AUTHORIZATION}`,
        },
      }
    );
    // Stores user ID once it is known if the user entered is valid
    let userId;

    // If invalid
    if (data.data.length === 0) {
      username = DEFAULT_USERNAME;
      userId = DEFAULT_USERID;
    } else {
      // if valid
      userId = data.data[0].id;
    }

    // Gets follower count from cacheUser method that fetches followers before caching
    const followers = await cacheUser(username, userId);

    // API response once data is cached
    res.status(200).json({
      cacheStatus: 'Success!',
      user: username,
      followers: followers,
    });
  }
});

/**
 * Caches user with a 5 minute expiration using Redis
 * @param username username to be cached
 * @param id user ID to fetch follower count
 * @returns folower count
 */
const cacheUser = async (username, id) => {
  const { data } = await axios.get(
    `https://api.twitch.tv/helix/users/follows?to_id=${id}`,
    {
      headers: {
        'Client-Id': `${process.env.CLIENT_ID}`,
        Authorization: `Bearer ${process.env.AUTHORIZATION}`,
      },
    }
  );
  // Caches user into memory using Redis
  redisClient.setEx(username, DEFAULT_EXPIRATION, JSON.stringify(data.total));

  return data.total; // Follower count
};

// Build to use when deploying to heroku
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Redirects all random endpoints to the homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Runs Express server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}!`);
});
