const { SlashCommandBuilder } = require('@discordjs/builders');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription("음성 채널에서 접속을 끊습니다."),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return await itr.editReply('큐가 존재하지 않습니다.');
        
        queue.connection.disconnect();
        itr.client.queues.delete(itr.guild.id);
        
        await itr.editReply(`👋 안녕히 계세요 여러분. 전 이 모든 굴레와 속박을 벗어던지고, 제 행복을 찾아 떠납니다. 여러분도 행복하세요.`);
    }
}