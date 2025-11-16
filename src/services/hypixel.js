const axios = require('axios');
const { TTLCache } = require('../utils/cacheData.js');
const config = require('../../config.json')

const cache = new TTLCache({
    ttl: 60_000 * 3,
    maxSize: 2000,
});

async function getHypixelPlayer(uuid) { // Get Hypixel player data from player UUID
    const key = `hypixel:player:${uuid}`;
    return cache.memo(key, 60_000 * 2, async () => {
        const { data } = await axios.get(`https://api.hypixel.net/player?uuid=${uuid}&key=${config.bot.hypixelAPIKey}`);
        if (!data?.success) throw new Error('Hypixel API Error');
        return data.player || null;
    });
}

async function getGuildByPlayer(uuid) { // Get Hypixel guild data from player UUID
    const key = `hypixel:guild:player:${uuid}`;
    return cache.memo(key, 60_000 * 1, async () => {
        const { data } = await axios.get(`https://api.hypixel.net/guild?player=${uuid}&key=${config.bot.hypixelAPIKey}`);
        if (!data?.success) throw new Error('Hypixel API Error');
        return data.guild || null;
    });
}

async function getGuildByName(name) { // Get Hypixel guild data from guild Name
    const key = `hypixel:guild:name:${name}`;
    return cache.memo(key, 60_000 * 1, async () => {
        const { data } = await axios.get(`https://api.hypixel.net/guild?name=${name}&key=${config.bot.hypixelAPIKey}`);
        if (!data?.success) throw new Error('Hypixel API Error');
        return data.guild || null;
    });
}


module.exports = { getHypixelPlayer, getGuildByPlayer, getGuildByName, cache };
