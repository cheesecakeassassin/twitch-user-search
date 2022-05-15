const express = require('express'); // Web server
const path = require('path'); // Allows easy path modifications
const axios = require('axios'); // HTTP request helper
const Redis = require('redis'); // In-memory caching db
const responseTime = require('response-time'); // API call stopwatch
require('dotenv').config(); // Safeguard confidential information

// Redis client used to quickly cache using RAM
let redisClient;

if (process.env.NODE_ENV === 'production') {
  // For Heroku deployment
  redisClient = Redis.createClient({ url: process.env.REDIS_URL });
} else {
  // For local usage
  redisClient = Redis.createClient();
}

redisClient.connect();
redisClient.on('connect', () => {
  console.log('Connected to Redis...');
});

const DEFAULT_EXPIRATION = 300; // 5 minute lifetime for cached items
const DEFAULT_USERNAME = 'cheesecake_assassin';
const DEFAULT_USERID = '81995906';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(responseTime());

app.get('/users/:username', async (req, res) => {
  let username = req.params.username;
  const userData = await redisClient.get(username);
  if (userData != null) {
    console.log(`${username} is $$$CACHED$$$`);
    console.log(
      'Seconds until expiration: ' + (await redisClient.ttl(username))
    );
    return res.json({
      user: username,
      followers: JSON.parse(userData),
      cache_expiration: await redisClient.ttl(username),
    });
  } else {
    console.log(`fetching api data for ${username}`);
    const { data } = await axios.get(
      `https://api.twitch.tv/helix/users?login=${username}`,
      {
        headers: {
          'Client-Id': `${process.env.CLIENT_ID}`,
          Authorization: `Bearer ${process.env.AUTHORIZATION}`,
        },
      }
    );
    let userId;
    if (data.data.length === 0) {
      username = DEFAULT_USERNAME;
      userId = DEFAULT_USERID;
    } else {
      userId = data.data[0].id;
    }
    const followers = await cacheUser(username, userId);

    res.status(200).json({
      cacheStatus: 'Success!',
      user: username,
      followers: followers,
    });
  }
});

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

  redisClient.setEx(username, DEFAULT_EXPIRATION, JSON.stringify(data.total));
  console.log('follower count: ' + data.total);
  return data.total;
};

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}!`);
});
