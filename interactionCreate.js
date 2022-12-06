
const Discord = require("discord.js");
const cooldownedUsers = new Discord.Collection();


const db = require("raven.database");

module.exports = async (client, interaction) => {

    if (interaction.isChatInputCommand()) {

        const startAt = Date.now();

        if (!interaction.guildId) return;

        const cmd = client.commands.get(interaction.commandName || null);

        if (!cmd) return
        const guild = client.guilds.cache.get(interaction.guildId);
        const member = interaction.member || await guild.members.fetch(interaction.user.id);


        const userKey = `${interaction.user.id}${interaction.guild.id}`;
        const cooldownTime = cooldownedUsers.get(userKey);
        const currentDate = parseInt(Date.now() / 1000);
        if (cooldownTime) {
            const isExpired = cooldownTime <= currentDate;
            const remainingSeconds = cooldownTime - currentDate;
            if (!isExpired) {
                return
            }
        }


        try {
            cmd.execute(interaction.client, interaction, db);
            cooldownedUsers.set(userKey, 5 + currentDate);
        } catch {

        };
    };



};
