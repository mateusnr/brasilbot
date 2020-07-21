## Dependencies
1. [Node.js 12+](https://nodejs.org/en/)

## Installation
1. `git clone https://github.com/mateusnr/brasilbot.git`
2. `cd brasilbot`
3. `npm install`

## Config
File: `./src/config.ts`

- `roles` - List of the available roles through the `!add` command
- `reddit` - Reddit credentials
- `discord.channel` - ID of the channel where the reddit posts will be sent

## Credentials

### Discord
- [Click here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)

### Reddit
https://github.com/reddit-archive/reddit/wiki/OAuth2#getting-started

1. [Create an app](https://www.reddit.com/prefs/apps)
2. Add the client id and secret to the config file
3. Add an user to the app as a developer

## Running
`npm start`
