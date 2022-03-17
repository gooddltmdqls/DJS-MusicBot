const { SlashCommandBuilder } = require('@discordjs/builders');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription("음악을 삭제합니다.")
        .addIntegerOption(opt =>
            opt.setName('위치')
               .setDescription('/queue 명령어에서 (위치). (이름)으로 표시되어 있습니다.')
               .setMinValue(1)
        ),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return await itr.editReply('큐가 존재하지 않습니다.');
        
        if ((itr.options.getInteger('위치') ?? 1) > queue.songs.length || (itr.options.getInteger('위치') ?? 1) <= 0) return itr.editReply('해당 위치에 곡이 없습니다.');
        
        queue.removeSong(itr.options.getInteger('위치') ?? 1, true);
        
        await itr.editReply(`🗑 음악을 삭제했습니다.`);
    }
}