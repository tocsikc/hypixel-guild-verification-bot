const { updateRoles } = require('../commands/verification/update.js');
const config = require('../../config.json');

async function autoUpdater(client) {
    if (!config.other.autoUpdater) return;
}