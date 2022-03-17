const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const QueueManager = require('../utils/QueueManager');
const Util = require('../utils/Util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription("현재 재생 중인 음악의 정보를 표시합니다."),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return await itr.editReply('큐가 존재하지 않습니다.');
        
        let embed = new MessageEmbed()
            .setTitle('▶️ 현재 재생 중...')
            .setColor('RANDOM');
        
        let resource = queue.connection.state.subscription.player.state.resource;
        let song = queue.songs[0];
        
        let progress = Util.makeProgressBar({ max: Util.toMS(song.duration), progress: resource.playbackDuration });
        
        embed.setDescription(
            `**[${song.title}](${song.url})** \n\n` +
            `${Util.datify(resource.playbackDuration)}/${song.duration} | <@!${song.addedBy}> \n\n` +
            `${progress}`
        );
        
        await itr.editReply({ embeds: [ embed ]});
    }
}