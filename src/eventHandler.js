const fs = require('node:fs');
const path = require('node:path');
const { Events } = require('discord.js');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (!event.name || !event.execute) {
            console.warn(`[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`);
            continue;
        }

        const eventName = typeof event.name === 'string' ? event.name : Object.values(Events).includes(event.name) ? event.name : null;

        if (!eventName) {
            console.warn(`[WARNING] Invalid event name in ${filePath}.`);
            continue;
        }

        if (event.once) {
            client.once(eventName, (...args) => event.execute(...args, client));
        } else {
            client.on(eventName, (...args) => event.execute(...args, client));
        }
    }

    console.log(`Loaded ${eventFiles.length} events.`);
};