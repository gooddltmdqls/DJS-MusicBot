const { SlashCommandBuilder } = require('@discordjs/builders');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription("일시 정지된 음악을 다시 재생합니다."),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return await itr.editReply('큐가 존재하지 않습니다.');
        
        if (!queue.isPaused) return itr.editReply("일시 정지 되어 있지 않습니다.");
        
        queue.resume();
        
        await itr.editReply(`▶️ 음악을 다시 재생합니다.`);
    }
}