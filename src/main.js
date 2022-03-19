require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const fs = require('fs');

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES ] });
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

client.commands = new Collection();
client.queues = new Collection();

let commandFiles = fs.readdirSync("src/commands").filter(f => f.endsWith(".js"));

for (file of commandFiles) {
    var command = require(`./commands/${file}`);
    
    client.commands.set(command.data.name, command);
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    client.application.fetch().then(data => {
        client.owners = data.owner.members?.map(el => el.id) || [data.owner.id] || [];
        
        console.log(`Fetched ${client.owners.length} owner${(client.owners.length > 1) ? "s" : ""}.`);
    });
    
    await (async() => {
        let commands = [];
        
        client.commands.forEach(command => {
            commands.push(command.data.toJSON());
        });
        
        try {
            await rest.put(
              Routes.applicationCommands(client.user.id),
              { body: commands }
            );
        } catch (err) {
            console.error(err);
            console.log("An error occurred while putting commands");
        }
    })();
});

client.on('interactionCreate', async itr => {
    if (!itr.isCommand()) return;
    
    if (!client.commands.has(itr.commandName)) return;
    
    try {
        client.commands.get(itr.commandName).execute(itr);
    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.TOKEN);