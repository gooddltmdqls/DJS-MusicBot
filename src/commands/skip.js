const { SlashCommandBuilder } = require('@discordjs/builders');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return await itr.editReply('큐가 존재하지 않습니다.');
        
        await queue.skip();
        
        await itr.editReply("⏩ 스킵했습니다!");
    },
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('현재 재생되고 있는 음악을 스킵합니다.')
}