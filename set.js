const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const data = new SlashCommandBuilder()
    .setName('set')
    .setDescription("You set the bot!")
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator)
module.exports.execute = async (client, interaction) => {
const embed = new Discord.EmbedBuilder()
.setDescription("You can make adjustments from the buttons below!")
.setColor("Aqua")
const row = new Discord.ActionRowBuilder()
.addComponents(
new Discord.ButtonBuilder()
.setLabel("Content")
.setStyle(Discord.ButtonStyle.Secondary)
.setCustomId("text"),
new Discord.ButtonBuilder()
.setLabel("Log Channel")
.setStyle(Discord.ButtonStyle.Secondary)
.setCustomId("channels"),
new Discord.ButtonBuilder()
.setLabel("Support Server")
.setStyle(Discord.ButtonStyle.Link)
.setURL("https://discord.gg/altyapilar")
)
return interaction.reply({embeds: [embed], components: [row]})
};
module.exports.options = {
    ...data.toJSON()
};


module.exports.config = {
    enabled: true,
};
