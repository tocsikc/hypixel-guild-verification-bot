const { roleUpdateLogger, errorLogger } = require('../utils/logger.js')

async function setDiscordNickname(member, newNick) {
    try {
        if (!member || !member.guild) return false;

        const guild = member.guild;
        const client = member.client;

        const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
        if (!me) {
            await errorLogger(client, `[NICK] Could not resolve bot member in guild ${guild.id}`);
            return false;
        }

        const mePerms = me.permissions;
        if (!mePerms.has('ManageNicknames') && !mePerms.has('Administrator')) {
            await errorLogger(
                client,
                `[ERROR] Missing Manage Nicknames permission in guild "${guild.name}" (${guild.id})`
            );
            return false;
        }

        if (me.roles.highest.position <= member.roles.highest.position) {
            await errorLogger(
                client,
                `[ERROR] Cannot change nickname of ${member.user.tag} (${member.id}) due to role hierarchy`
            );
            return false;
        }

        if (typeof newNick !== 'string' || !newNick.trim()) {
            await errorLogger(
                client,
                `[ERROR] Invalid nickname "${newNick}" for ${member.user.tag} (${member.id})`
            );
            return false;
        }

        const safeNick = newNick.trim().slice(0, 32);
        if (member.nickname === safeNick) {
            return true;
        }

        await member.setNickname(safeNick).catch(async (err) => {
            await errorLogger(
                client,
                `[ERROR] Failed to set nickname for ${member.user.tag} (${member.id}) to "${safeNick}": ${err}`
            );
        });

        return true;
    } catch (err) {
        const client = member?.client;
        if (client) {
            await errorLogger(
                client,
                `[NICK] Unexpected error for ${member?.user?.tag} (${member?.id}): ${err}`
            );
        } else {
            console.error('[NICK] Unexpected error:', err);
        }
        return false;
    }
}

async function removeRoles(member, roleIds = []) {
    const rolesToRemove = roleIds.filter(id => member.roles.cache.has(id));
    for (const id of rolesToRemove) {
        const roleName = member.guild.roles.cache.get(id)?.name || id;
        try {
            // console.log(`Removing role: ${roleName} (${id}) from ${member.user.tag}`);
            await member.roles.remove(id);
        } catch (error) {
            const err = `Failed to remove role ${roleName} (${id}): ${error}`;
            await errorLogger(member.client, err);
        }
    } 
    if (!rolesToRemove.length) return;

    const uniqueRolesToRemove = [...new Set(rolesToRemove)];
    let res = "";
    for (roleId of uniqueRolesToRemove) {
        res += `\n\`🟥\` <@&${roleId}>`
    }
    await roleUpdateLogger(member.client, member, res);
}

async function addRoles(member, roleIds = []) {
    const rolesToAdd = roleIds.filter(id => !member.roles.cache.has(id));
    
    
    for (const id of rolesToAdd) {
        const roleName = member.guild.roles.cache.get(id)?.name || id;
        try {
            // console.log(`Adding role: ${roleName} (${id}) to ${member.user.tag}`);
            await member.roles.add(id);
        } catch (error) {
            const err = `Failed to add role ${roleName} (${id}): ${error}`;
            await errorLogger(member.client, err);
        }
    }
    if (!rolesToAdd.length) return;

    const uniqueRolesToAdd = [...new Set(rolesToAdd)];
    let res = "";
    for (roleId of uniqueRolesToAdd) {
        res += `\n\`🟩\` <@&${roleId}>`
    }
    await roleUpdateLogger(member.client, member, res);
}


async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { setDiscordNickname, removeRoles, addRoles, sleep } 