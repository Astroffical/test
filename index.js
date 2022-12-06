const fs = require("fs");
const Path = require("path");
const Discord = require("discord.js");
const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const client = global.client = new Discord.Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

const db = require("raven.database");
const config = require("./config.js")
const invite = require('invite-module');
invite.inviteCounter(client);

client.commands = global.commands = new Discord.Collection();
client.functions = global.functions = require("./helpers/functions");
const synchronizeSlashCommands = require('discord-sync-commands');


const eventsRegister = () => {
    let eventsDir = Path.resolve(__dirname, './events');
    if (!fs.existsSync(eventsDir)) return client.functions.log("Error.", "EVENTS_REGISTER");
    fs.readdirSync(eventsDir, { encoding: "utf-8" }).filter((cmd) => cmd.split(".").pop() === "js").forEach((event) => {
        let prop = require(`./events/${event}`);
        if (!prop) return client.functions.log("Errror", "EVENTS_REGISTER");
        client.functions.log(`${event} Success.`, "EVENTS_REGISTER");
        client.on(event.split('.')[0], prop.bind(null, client));
        delete require.cache[require.resolve(`./events/${event}`)];
    });
};

const commandsRegister = () => {
    let commandsDir = Path.resolve(__dirname, './commands');
    if (!fs.existsSync(commandsDir)) return client.functions.log("Error", "COMMANDS_REGISTER");
    fs.readdirSync(commandsDir, { encoding: "utf-8" }).filter((cmd) => cmd.split(".").pop() === "js").forEach((command) => {
        let prop = require(`./commands/${command}`);
        if (!prop) return client.functions.log("Error.", "COMMANDS_REGISTER");
        client.functions.log(`${command} Success.`, "COMMANDS_REGISTER");
        client.commands.set(prop.options.name, prop);
        delete require.cache[require.resolve(`./commands/${command}`)];
    });
};



const slashCommandsRegister = () => {
    const commands = client.commands.filter((c) => c.options);
    const fetchOptions = { debug: true };
    synchronizeSlashCommands(client, commands.map((c) => c.options), fetchOptions);
};

const portRegister = () => {
    const app = require("express")();
    app.use("*", async (req, res, next) => {
        res.json({ message: "Api!" });
        next();
    });
    app.listen(process.env.PORT || 80);
};

eventsRegister();
commandsRegister();
slashCommandsRegister();
portRegister();



const modal = new ModalBuilder()
.setCustomId('form')
.setTitle('Invite Manager+')
const a1 = new TextInputBuilder()
.setCustomId('textmenu')
.setLabel('text')
.setStyle(TextInputStyle.Paragraph)
.setMinLength(2)
.setPlaceholder('Hoşgeldin {user}, Davet Eden: **{inviter} ({invites})**')
.setRequired(true)
const a2 = new TextInputBuilder()
.setCustomId('textmenu2')
.setLabel('text')
.setStyle(TextInputStyle.Paragraph)
.setMinLength(2)
.setPlaceholder('Güle Güle {user}, Davet Eden: **{inviter} ({invites})**')
.setRequired(true)
const row = new ActionRowBuilder().addComponents(a1);
const row2 = new ActionRowBuilder().addComponents(a2);

    modal.addComponents(row, row2);


client.on('interactionCreate', async (interaction, inviter) => {

	if(interaction.customId === "text"){
    await interaction.showModal(modal);
	}
})
client.on('interactionCreate', async interaction => {
     if (interaction.type !== InteractionType.ModalSubmit) return;
     if (interaction.customId === 'form') {
   const text = interaction.fields.getTextInputValue('textmenu')
   const text3 = interaction.fields.getTextInputValue('textmenu2')

const text2 = text.replaceAll("{user}", interaction.user.tag).replaceAll("{inviter}", client.user.tag).replaceAll("{invites}", "1")
const text4 = text3.replaceAll("{user}", interaction.user.tag).replaceAll("{inviter}", client.user.tag).replaceAll("{invites}", "1")

interaction.reply({content: "Member Join:\n"+text2+"\nMember Leave: \n"+text4+""})
db.set(`message_${interaction.guild.id}`, {login: text, leave: text3})
 }
})
client.on("interactionCreate", interaction => {
if (interaction.customId === "channels") {
interaction.reply("Please tag a channel!")
db.set(`channel_${interaction.user.id}`, true)
}
})
client.on("messageCreate", message => {
let user = db.fetch(`channel_${message.author.id}`)
if (!user) return;
let messages = message.mentions.channels.first()
if (!messages) return message.reply("Please tag a channel!")
message.delete()
db.set(`channel_${message.guild.id}`, messages.id)
db.delete(`channel_${message.author.id}`)
})

client.on("memberJoin", async(member, invite, inviter, guild) => {
    const database = db.fetch(`channel_${guild.id}`);
    if(!database) return;
   const content = db.fetch(`message_${guild.id}`)
   if (!content) return;
   let content2 = content.login
   let invitess = db.fetch(`invite_${inviter}`) || "1"
   const text2 = content2.replaceAll("{user}", member).replaceAll("{inviter}", inviter.username).replaceAll("{invites}", invitess)
    guild.channels.cache.get(database).send({content: text2});
    db.add(`invite_${inviter}`, +1)
})

client.on("memberLeave", async(member, invite, inviter, guild) => {
  const database = db.fetch(`channel_${guild.id}`);
  if(!database) return;
 const content = db.fetch(`message_${guild.id}`)
 if (!content) return;
 let content2 = content.leave
 let invitess = db.fetch(`invite_${inviter}`) || "0"
 const text2 = content2.replaceAll("{user}", member).replaceAll("{inviter}", inviter.username).replaceAll("{invites}", invitess)
  guild.channels.cache.get(database).send({content: text2});
  db.add(`invite_${inviter}`, -1)
})




client.login(config.token)
