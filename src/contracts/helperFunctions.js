async function removeRoles(member, roleIds = []) {
    const rolesToRemove = roleIds.filter(id => member.roles.cache.has(id));
    for (const id of rolesToRemove) {
        const roleName = member.guild.roles.cache.get(id)?.name || id;
        try {
            // console.log(`Removing role: ${roleName} (${id}) from ${member.user.tag}`);
            await member.roles.remove(id);
        } catch (err) {
            // console.log(`Failed to remove role ${roleName} (${id}):`, err);
        }
    }
}

async function addRoles(member, roleIds = []) {
    const rolesToAdd = roleIds.filter(id => !member.roles.cache.has(id));
    for (const id of rolesToAdd) {
        const roleName = member.guild.roles.cache.get(id)?.name || id;
        try {
            // console.log(`Adding role: ${roleName} (${id}) to ${member.user.tag}`);
            await member.roles.add(id);
        } catch (err) {
            // console.log(`Failed to add role ${roleName} (${id}):`, err);
        }
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { removeRoles, addRoles, sleep } 