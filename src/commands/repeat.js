const { SlashCommandBuilder } = require('@discordjs/builders');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription("반복 여부를 설정합니다.")
        .addStringOption(opt => opt
            .setName("모드")
            .setDescription("반복 모드를 설정합니다.")
            .addChoices([ 
              [
                "큐",
                'queue'
              ],
              [
                "현재 음악",
                'music'
              ]
            ])
        ),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return await itr.editReply('큐가 존재하지 않습니다.');
        
        if (itr.options.getString('모드') == queue.repeat) return itr.editReply('이미 같은 모드로 반복 중입니다.');
        
        itr.options.getString('모드') ? queue.repeat = itr.options.getString('모드') : queue.repeat = !queue.repeat;
        
        await itr.editReply(`🔁 이제 ${queue.repeat ? ((queue.repeat === 'queue' ? '큐 단위로' : '현재 음악을') + ' 반복하기 시작합니다.') : '더 이상 음악을 반복하지 않습니다.'}`);
    }
}