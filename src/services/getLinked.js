const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../../data/linked.json');

async function loadDB() { // Open linked.json
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

async function saveDB(db) { // Save and close linked.json
    await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8');
}

async function addUser(discordID, uuid) { // Add user to database
    const db = await loadDB();
    db[discordID] = uuid;
    await saveDB(db);
}

async function removeUser(discordID) { // Remove user from database
    const db = await loadDB();
    delete db[discordID];
    await saveDB(db);
}

async function inDB(discordID, uuid=false) { // Check if user is in database
    const db = await loadDB();
    if (db[discordID]) {
        return 'discord';
    } if (uuid && Object.values(db).includes(uuid)) {
        return 'minecraft';
    } else {
        return false;
    }
}

async function getDiscord(uuid) {
    const db = await loadDB();
    return Object.keys(db).find(id => db[id] === uuid) || null;
}

async function getUUID(discordID) {
    const db = await loadDB();
    return db[discordID] || null;
}

module.exports = { addUser, removeUser, inDB, loadDB, getUUID, getDiscord };