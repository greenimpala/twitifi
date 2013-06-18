# Twitifi

Realtime Spotify tweets.

[![Dependency Status](https://gemnasium.com/st3redstripe/twitifi.png)](https://gemnasium.com/st3redstripe/twitifi)

## Installing and building

```bash
$ npm install -d && node -e "require('grunt').cli();" # Install dependencies and build client
```

A `config.js` must be created in the apps root directory before starting. This file should contain Twitter API authentication data in the following format.

```json
{
	"consumer_key": "...",
	"consumer_secret": "...",
	"access_token": "...",
	"access_token_secret": "..."
}
```
## Running

```bash
$ npm start
```
