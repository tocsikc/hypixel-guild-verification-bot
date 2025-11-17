# Hypixel Guild Verification Bot
Simple and easy to use Hypixel Guild Bot for verification and automatic role updating.
## Features
- Discord --> Hypixel Verification System
- Caches Hypixel/Mojang API Data
## Contents
- [Setup](#setup)
- [Config](#config)
- [Commands](#commands)
- [To-do](#to-do)
## Setup
## Config
Use `example.config.json` for reference.
### Bot
`token` Your Discord bot token. [Create a new app](https://discordapp.com/developers) if you don't have one already.

`clientId` In your Discord bot's "OAuth2" settings.

`guildId` Discord Server ID.

`hypixelAPIKey` [Get a Hypixel API Key](https://developer.hypixel.net/)
### Guild
`name` Hypixel guild name.

`unverifiedRole` Role ID for non-verified members

`verifiedRole` Role ID for verified members

`guestRole` Role ID for non-guild members

`guildRole` Role ID for guild members

`ranks` Array, provide `name` (Hypixel guild rank) and `role` (role ID) for every Object ```{ "name": "Officer", "role": "1234567890" }```

`timeRoles` Array, provide `time` (measured in days) and `role` (role ID) for every Object ```{ "time": 30, "role": "1234567890" }```
### Permissions
`devRole` Role ID, access to all commands.

`moderatorRole` Role ID, access to moderator commands.

`developerMode` Boolean, when `true` only users with `devRole` can access any command.
### Other
`nicknames` Boolean, when `true` changes user's Discord nickname to Minecraft username.

`autoUpdater` Boolean, when `true` updates all roles every `autoUpdaterInterval` hours

`autoUpdaterInterval` Number, changes how often `autoUpdater` triggers. (default: 12)

`logsChannel` Channel ID, Logs all role updates and errors to chosen channel
## Commands
`< >` = Required arguments, `[ ]` = Optional arguments
### Verification
`verify` <username>

`update`

`unverify`

`linked` [discord]

`force verify` <discord> <username>

`force update` [discord]

`force unverify` <discord>
### Utility
`info`
## To-do
- Moderation Commands
- /nick command
- Finish Auto Updater