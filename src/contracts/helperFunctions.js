const { roleUpdateLogger, errorLogger } = require('../utils/logger.js')

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

module.exports = { removeRoles, addRoles, sleep } 