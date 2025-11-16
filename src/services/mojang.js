
const axios = require('axios');
const { TTLCache } = require('../utils/cacheData.js');

const nameCache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000;

const cache = new TTLCache({
    ttl: 60_000 * 3,
    maxSize: 2000,
});

async function getUsername(uuid) {
    const cached = nameCache.get(uuid);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        return cached.name;
    }

    try {
        const res = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        const name = res.data.name;
        nameCache.set(uuid, { name, fetchedAt: Date.now() });
        return name;
    } catch (err) {
        if (err.response?.status === 404) return null;
        console.error(`Failed to fetch username for ${uuid}:`, err.message);
        return null;
    }
}

async function getUuidByUsername(username) {
    const key = `mojang:uuid:${username.toLowerCase()}`;
    return cache.memo(key, async () => {
        const { data } = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        return data?.id || null;
    });
}

async function getHeadPNG(username) { // Get players head as an image (username or UUID)
    
    if (!username) {
        return `https://www.mc-heads.net/avatar/`;
    }
    const key = `mojang:head:${username.toLowerCase()}`;

    return cache.memo(key, async () => {
        return `https://www.mc-heads.net/avatar/${username}`;
    });
}


module.exports = { getUsername, getUuidByUsername, getHeadPNG, cache };