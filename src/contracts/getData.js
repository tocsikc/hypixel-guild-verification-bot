const axios = require('axios');
const { TTLCache } = require('../utils/cache');
const config = require('../../config.json')

const cache = new TTLCache({
    ttl: 60_000 * 3,
    maxSize: 2000,
});

async function getUuidByUsername(username) {
    const key = `mojang:uuid:${username.toLowerCase()}`;
    return cache.memo(key, async () => {
        const { data } = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        return data?.id || null;
    });
    }

async function getHypixelPlayer(uuid) {
    const key = `hypixel:player:${uuid}`;
    return cache.memo(key, 60_000 * 2, async () => {
        const { data } = await axios.get(`https://api.hypixel.net/player?uuid=${uuid}&key=${config.hypixelAPIKey}`);
        if (!data?.success) throw new Error('Hypixel API Error');
        return data.player || null;
    });
}

async function getGuildByPlayer(uuid) {
    const key = `hypixel:guild:player:${uuid}`;
    return cache.memo(key, 60_000 * 1, async () => {
        const { data } = await axios.get(`https://api.hypixel.net/guild?player=${uuid}&key=${config.hypixelAPIKey}`);
        if (!data?.success) throw new Error('Hypixel API Error');
        return data.guild || null;
    });
}

async function getGuildByName(name) {
    const key = `hypixel:guild:name:${name}`;
    return cache.memo(key, 60_000 * 1, async () => {
        const { data } = await axios.get(`https://api.hypixel.net/guild?name=${name}&key=${config.hypixelAPIKey}`);
        if (!data?.success) throw new Error('Hypixel API Error');
        return data.guild || null;
    });
}


module.exports = { getUuidByUsername, getHypixelPlayer, getGuildByPlayer, getGuildByName, cache };
