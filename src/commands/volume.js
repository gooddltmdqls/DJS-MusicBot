const { SlashCommandBuilder } = require('@discordjs/builders');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription("음량을 변경합니다.")
        .addIntegerOption(opt =>
            opt.setName('음량')
               .setDescription('설정할 음량입니다.')
               .setMaxValue(100)
               .setMinValue(1)
               .setRequired(true)
        ),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return await itr.editReply('큐가 존재하지 않습니다.');
        
        if (itr.options.getInteger('음량') > 100 || itr.options.getInteger('음량') < 1) return itr.editReply('음량 값이 잘못되었습니다.');
        
        if (queue.volume === (itr.options.getInteger('음량') / 100)) return itr.editReply("현재 음량과 동일합니다.");
        
        queue.setVolume(itr.options.getInteger('음량'));
        
        await itr.editReply(`🔊 음량을 ${queue.volume * 100}%로 설정했습니다.`);
    }
}