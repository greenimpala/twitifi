# Twitifi

Realtime Spotify tweets.

## Starting

```bash
$ npm install -d && node main.js
```

Use the `-c` argument to specify the relative file path of the `config.js` file. If no path is given then apps root directory is used. The config file contains Twitter API authentication data in the following format.

```json
{
	"consumer_key": "...",
	"consumer_secret": "...",
	"access_token": "...",
	"access_token_secret": "..."
}
```