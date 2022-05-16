# Twitch User Search

## Licensing:

[![license](https://img.shields.io/badge/license-MIT-blue)](https://shields.io)

## Table of Contents

* [Description](#description)
* [Technologies Used](#technologies-used)
* [Installation](#installation)
* [Usage](#usage)
* [Additional Info](#additional-info)

## Description:

A single page application that uses the Twitch API to search Twitch channels, retrieve their follower count, and provide a link to their channel.

## Technologies Used

* ReactJS (Frontend framework)
* NodeJS (Backend)
* ExpressJS (Web server)
* Axios (HTTP Requests)
* Redis (Caching database)
* CSS (Frontend styling)
* Heroku (Application deployment)

## Installation:

* Clone this repo to your desired destination
* Run ```npm i``` inside the directory to get the needed dependencies
* Run ```npm run develop``` to concurrently run the client and server
* The web app will automatically open in your default browser
* Enjoy!

## Usage:

**Skip installation and jump straight into the deployed app!**
https://twitch-user-search.herokuapp.com/

**On the deploymed app, you can make direct calls to the API with ```/users/<username>``` endpoint, you will even be given the time until the cache expires for a previously searched user**

**Search the name of your favorite Twitch channels**

![beforeUserSearch](https://user-images.githubusercontent.com/7333111/168503445-1e77d078-a835-494c-9044-0d2852855b8a.png)


**Click on the channel name to open a tab to their Twitch channel, or simply view their follower count and search another name**

![afterUserSearch](https://user-images.githubusercontent.com/7333111/168503461-4f8e6906-b432-4129-8a23-bd3c95e3768f.png)
  

## Additional Info:

Send me an email for any questions about this project @ santasebastian@yahoo.com!
