const express = require('express'); // Web server
const axios = require('axios'); // HTTP request helper
const Redis = require('redis'); // In-memory caching db
const responseTime = require('response-time'); // API call stopwatch
require('dotenv').config(); // Safeguard confidential information

// Redis client used to quickly cache using RAM
const redisClient = Redis.createClient();
redisClient.connect();
redisClient.on('connect', () => {
  console.log('Connected to Redis...');
});

const DEFAULT_EXPIRATION = 300; // 5 minute lifetime for cached items

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(responseTime());

app.get('/users/:username', async (req, res) => {
  const userData = await redisClient.get(req.params.username);
  if (userData != null) {
    console.log(`${req.params.username} is $$$CACHED$$$`);
    console.log(
      'Seconds until expiration: ' +
        (await redisClient.ttl(req.params.username))
    );
    return res.json({
      cachedUser: req.params.username,
      followers: JSON.parse(userData),
      cache_expiration: await redisClient.ttl(req.params.username),
    });
  } else {
    console.log(`fetching api data for ${req.params.username}`);
    const { data } = await axios.get(
      `https://api.twitch.tv/helix/users?login=${req.params.username}`,
      {
        headers: {
          'Client-Id': `${process.env.CLIENT_ID}`,
          Authorization: `${process.env.AUTHORIZATION}`,
        },
      }
    );

    const userId = data.data[0].id;
    const followers = await cacheUser(req.params.username, userId);

    res.status(200).json({
      cacheStatus: 'Success!',
      user: data.data[0].display_name,
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
        Authorization: `${process.env.AUTHORIZATION}`,
      },
    }
  );

  redisClient.setEx(username, DEFAULT_EXPIRATION, JSON.stringify(data.total));
  console.log('follower count: ' + data.total);
  return data.total;
};

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}!`);
});