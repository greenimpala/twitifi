# Twitifi

Realtime Spotify tweets.

## Installing and building

```bash
$ npm install -d && grunt # Install dependencies and build client
```

A `config.js` must be created in the apps root directory before starting. This file should contain your Twitter API authentication data in the following format.

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
$ npm start # Start on port 3000
```