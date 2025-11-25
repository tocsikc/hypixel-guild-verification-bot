const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../../data/nicknames.json');

async function loadNicknames() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch (err) {
        if (err.code === 'ENOENT') {
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });

            await saveNicknames({});

            return {};
        } else {
            throw err;
        }
    }
}

async function saveNicknames(db) { // Save and close linked.json
    await fs.writeFile(filePath, JSON.stringify(db, null, 4), 'utf8');
}

async function addNick(discordID, nickname) { // Add user to database
    const db = await loadNicknames();
    db[discordID] = nickname;
    await saveNicknames(db);
}

async function removeNick(discordID) { // Remove user from database
    const db = await loadNicknames();
    delete db[discordID];
    await saveNicknames(db);
}

async function getNickname(discordID) {
    const db = await loadNicknames();
    return db[discordID] || null;
}

module.exports = { addNick, removeNick, loadNicknames, getNickname };