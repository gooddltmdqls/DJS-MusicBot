const { SlashCommandBuilder } = require('@discordjs/builders');
const ytsr = require('ytsr');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("음악을 재생합니다.")
        .addStringOption(opt => 
            opt.setName("검색")
               .setDescription("검색 내용을 설정합니다.")
               .setRequired(true)
        ),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        await itr.editReply("🔎 음악을 검색하고 있어요...");
        
        let items = (await ytsr(itr.options.getString("검색"), {
            gl: "KR",
            limit: 25
        })).items.filter(item => item.type == 'video');
        
        if (!items.length) return await itr.channel.send('❌ 검색 결과가 없어요...');
        
        items[0].addedBy = itr.user.id;
        
        if (!QueueManager.getQueue(itr.client, itr.guild.id)) QueueManager.createQueue(itr.client, {
            textChannel: itr.channel,
            voiceChannel: itr.member.voice.channel
        });
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        queue.addSong(items[0]);
        if (queue.songs.length > 1) {
            let embed = new (require('discord.js')).MessageEmbed()
                .setDescription(
                    `**🎵 [음악을 큐에 추가했어요!](${items[0].url})**\n\n${items[0].title} \n\n길이: ${items[0].duration}`)
                .setColor("RANDOM")
                .setImage(items[0].bestThumbnail.url);
            
            await itr.channel.send({ embeds: [ embed ]});
        }
        
        if (!queue.isPlaying) queue.play();
    }
}