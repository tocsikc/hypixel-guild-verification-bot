const { REST, Routes } = require('discord.js');
const config = require('../../config.json');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { token, clientId, guildId } = config.bot;

const commands = [];

const foldersPath = path.join(__dirname, '..', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const hash = crypto.createHash('sha256').update(JSON.stringify(commands)).digest('hex');
const cacheDir = path.join(__dirname, '.cache');
const hashFile = path.join(cacheDir, 'commands.hash');

if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

let previousHash = null;
if (fs.existsSync(hashFile)) {
    previousHash = fs.readFileSync(hashFile, 'utf-8');
}

if (previousHash === hash) {
    return;
}

const rest = new REST().setToken(token);

(async () => {
	try {
		const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);

        fs.writeFileSync(hashFile, hash);
	} catch (error) {
		console.error(error);
	}
})();