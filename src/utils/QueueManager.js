const Voice = require('@discordjs/voice');
const Discord = require('discord.js');
const Stream = require('stream');

const Queue = require('../structures/Queue');
const Song = require('../structures/Song');

let has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

const getQueue = (client, guildId) => client.queues.get(guildId);

const createQueue = function(client, { textChannel, voiceChannel }) {
    let connection = Voice.joinVoiceChannel({
        guildId: textChannel.guild.id,
        channelId: voiceChannel.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });
    
    let queue = new Queue({
        client,
        textChannel,
        voiceChannel,
        songs: [],
        connection
    });
    
    client.queues.set(textChannel.guild.id, queue);
    return queue;
}

module.exports = {
    getQueue,
    createQueue
}