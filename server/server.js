require('dotenv').config(); // Safeguarding private keys in .env file
const express = require('express'); // Web server
const path = require('path'); // Allows easy modifications to path
const axios = require('axios'); // HTTP requests
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
  // Build to use for Heroku deployment
  app.use(express.static(path.join(__dirname, '../client/build')));
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
const DEFAULT_FOLLOWERS = '2'; // Default followers if invalid name is given

/**
 * Facilitates making user requests to the Twitch API
 * @param url gets the url to make a Twitch API request to
 * @returns follower count or general user info
 */
const twitchUserRequest = async (url) => {
  const data = await axios.get(url, {
    headers: {
      // Used for OAuth authorization that Twitch API requires
      'Client-Id': `${process.env.CLIENT_ID}`,
      Authorization: `Bearer ${process.env.AUTHORIZATION}`,
    },
  });

  // Returns follower count or general user info depending on API call made
  if (data.data.total || data.data.total === 0) {
    return data.data.total;
  } else {
    return data.data.data[0];
  }
};

// Endpoint that gets user name and follower count and caches them for 5 minutes
app.get('/users/:username', async (req, res) => {
  // Username is set to lowercase to prevent multiple caches for the same name
  let username = req.params.username.toLowerCase();

  const cachedUserData = await redisClient.get(username); // Gets user from cache

  // If user is in cache, data will be instantly retrieved from cache
  if (cachedUserData != null) {
    return res.status(200).json({
      user: await redisClient.get(`_${username}`),
      followers: JSON.parse(cachedUserData),
      cache_expiration: await redisClient.ttl(username),
    });
  } else {
    // Fetch data from API if user is not in cache
    const userData = await twitchUserRequest(
      `https://api.twitch.tv/helix/users?login=${username}`
    );

    // If name doesn't exist then default to my channel
    if (userData == null) {
      username = DEFAULT_USERNAME;

      // Checks if my channel is already cached
      if ((await redisClient.exists(username)) === 0) {
        // Caches my channel in case another invalid name is typed or someone actually looks me up
        redisClient.setEx(`_${username}`, DEFAULT_EXPIRATION, username);
        redisClient.setEx(username, DEFAULT_EXPIRATION, DEFAULT_FOLLOWERS);

        // Returns my channel information after caching
        return res.status(200).json({
          cacheStatus: 'Success!',
          user: username,
          followers: DEFAULT_FOLLOWERS,
        });
      } else {
        // Runs if my channel is already cached
        return res.status(200).json({
          user: username,
          followers: DEFAULT_FOLLOWERS,
          cache_expiration: await redisClient.ttl(username),
        });
      }
    } else {
      // If valid username, caches the user's display name with correct capitalization for display
      redisClient.setEx(
        `_${username}`,
        DEFAULT_EXPIRATION,
        userData.display_name
      );
    }
    // Gets follower count from cacheUser method that fetches followers before caching
    const followers = await twitchUserRequest(
      `https://api.twitch.tv/helix/users/follows?to_id=${userData.id}`
    );

    // Caches the follower count of the user searched
    redisClient.setEx(username, DEFAULT_EXPIRATION, JSON.stringify(followers));
    // API response once data is cached
    res.status(200).json({
      cacheStatus: 'Success!',
      user: userData.display_name,
      followers: followers,
    });
  }
});

// Redirects all random endpoints to the homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Runs Express server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}!`);
});
