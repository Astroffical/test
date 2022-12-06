const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require("raven.database")
const data = new SlashCommandBuilder()
    .setName('invites')
    .setDescription("See your invites!")
    .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator)
module.exports.execute = async (client, interaction) => {
let yourinvite = db.fetch(`invite_<@${interaction.user.id}>`) || "0"
const embed = new Discord.EmbedBuilder()
.setDescription("Your invites: **"+yourinvite+"**")
.setColor("Aqua")
return interaction.reply({embeds: [embed]})
};
module.exports.options = {
    ...data.toJSON()
};


module.exports.config = {
    enabled: true,
};
