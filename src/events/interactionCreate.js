const { Events, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { permissions } = require('../../config.json');
const verify = require('../commands/verification/verify.js');
const update = require('../commands/verification/update.js');
const unverify = require('../commands/verification/unverify.js');

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
			switch (interaction.customId) {
				case "verify_button": {
					const verifyModal = new ModalBuilder()
						.setCustomId('verifyModal')
						.setTitle('Verify your account');

					const usernameInput = new TextInputBuilder()
						.setCustomId('usernameInput')
						.setLabel('What\'s your Minecraft username?')
						.setPlaceholder('Steve')
						.setStyle(TextInputStyle.Short)
						.setRequired(true);

					const verifyActionRow = new ActionRowBuilder().addComponents(usernameInput);

					verifyModal.addComponents(verifyActionRow);

					return interaction.showModal(verifyModal);
				}
				case "update_button": {
					await interaction.deferReply({ flags: MessageFlags.Ephemeral });

					const result = await update.execute(interaction, { silent: true });

					if (result) {
						if (result[1]?.embed === true) {
							return interaction.editReply({
								embeds: [result[0]],
								flags: MessageFlags.Ephemeral
							});
						} else {
							return interaction.editReply({
								content: result[0],
								flags: MessageFlags.Ephemeral
							});
						}
					}
				}
				case "unverify_button": {
					await interaction.deferReply({ flags: MessageFlags.Ephemeral });
					
					const result = await unverify.execute(interaction, { silent: true });

					if (result) {
						if (result[1]?.embed === true) {
							return interaction.editReply({
								embeds: [result[0]],
								flags: MessageFlags.Ephemeral
							});
						} else {
							return interaction.editReply({
								content: result[0],
								flags: MessageFlags.Ephemeral
							});
						}
					}
				}
			} 
			
			
		} else if (interaction.isModalSubmit()) {
			if (interaction.customId === 'verifyModal') {
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });
				const username = interaction.fields.getTextInputValue('usernameInput');
				const result = await verify.execute(interaction, { silent: true, username: username });

				if (result) {
					if (result[1]?.embed === true) {
						await interaction.editReply({
							embeds: [result[0]],
							flags: MessageFlags.Ephemeral
						});
					} else {
						await interaction.editReply({
							content: result[0],
							flags: MessageFlags.Ephemeral
						});
					}
				}
			}
		}

	},
};