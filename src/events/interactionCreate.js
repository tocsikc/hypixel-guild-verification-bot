const { Events, MessageFlags } = require('discord.js');
const { permissions } = require('../../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			if (permissions.developerMode) {
				const devModeRoleId = permissions.moderatorRole;
				if (!devModeRoleId) {
					console.warn(`No role ID set in config.json for ${devModeRoleId}`);
				} else if (!interaction.member.roles.cache.has(devModeRoleId)) {
					if (interaction.replied || interaction.deferred) {
						return interaction.followUp({
							content: '\`❌\` The bot is currently in developer only mode.',
							flags: MessageFlags.Ephemeral
						});
					} else {
						return interaction.reply({
							content: '\`❌\` The bot is currently in developer only mode.',
							flags: MessageFlags.Ephemeral
						});
					}
				}
			}

			if (command.requiredRole) {
				const devRoleId = permissions.devRole;
				const requiredRoleId = permissions[command.requiredRole] || null;
				if (!requiredRoleId) {
					console.warn(`No role ID set in config.json for ${command.requiredRole}`);
				} else if (!interaction.member.roles.cache.has(requiredRoleId) && !interaction.member.roles.cache.has(devRoleId)) {
					if (interaction.replied || interaction.deferred) {
						return interaction.followUp({
							content: '\`❌\` You do not have permission to use this command.',
							flags: MessageFlags.Ephemeral
						});
					} else {
						return interaction.reply({
							content: '\`❌\` You do not have permission to use this command.',
							flags: MessageFlags.Ephemeral
						});
					}
				}
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: '\`❌\` There was an error while executing this command!',
						flags: MessageFlags.Ephemeral,
					});
				} else {
					await interaction.reply({
						content: '\`❌\` There was an error while executing this command!',
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		} else if (interaction.isButton()) {
			return;
		}

	},
};