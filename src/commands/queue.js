const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

const QueueManager = require('../utils/QueueManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('큐를 표시합니다.'),
    async execute(itr) {
        if (!itr.guild) return itr.reply("서버 안에서만 사용할 수 있습니다!");
        
        await itr.deferReply();
        
        if (!itr.member.voice.channel) return itr.editReply("음성 채널에 접속해주세요!");
        if (itr.guild.me.voice.channel && (itr.member.voice.channel.id != itr.guild.me.voice.channel.id)) return itr.editReply("같은 음성 채널에 접속 해 주세요!");
        
        let queue = QueueManager.getQueue(itr.client, itr.guild.id);
        
        if (!queue) return itr.editReply('큐가 존재하지 않습니다.');
        
        let embed = new Discord.MessageEmbed()
            .setTitle(`📒 큐 표시 1/${Math.ceil(queue.songs.length / 10)}`)
            .setColor("RANDOM");
        
        var pages = [[]];
        queue.songs.forEach((song, i) => {
            if (!(!i) && !(i % 10)) pages.push([]);
            pages[pages.length - 1].push(song);
        });
        
        let defaultText = `${queue.repeat ? ((queue.repeat === 'queue' ? '큐 단위로' : '현재 음악을') + ' 반복 중 | ') : '반복 안함 | '}음량: ${queue.volume * 100}% \n\n`;
        
        var texts = [ defaultText ];
        
        pages.forEach((page, tens) => {
            page.forEach(
              (song, ones) => texts[texts.length - 1] = texts[texts.length - 1] + 
              `${tens * 10 + (ones + 1)}. **[${song.title}](${song.url})**\n길이: ${song.duration} | <@!${song.addedBy}>\n\n`
            );
            texts.push(defaultText);
        });
    
        embed.setDescription(texts[0]);
        
        let pagenum = 1;
        
        let btn_prev = new Discord.MessageButton()
            .setEmoji("◀️")
            .setCustomId("prev")
            .setStyle("PRIMARY");
        let btn_stop = new Discord.MessageButton()
            .setEmoji("⏹️")
            .setCustomId("stop")
            .setStyle("DANGER");
        let btn_next = new Discord.MessageButton()
            .setEmoji("▶️")
            .setCustomId("next")
            .setStyle("PRIMARY");
        
        let row = new Discord.MessageActionRow()
            .addComponents(btn_prev, btn_stop, btn_next);
        var msg = await itr.editReply({
            embeds: [ embed ],
            components: [ row ]
        });
        
        let collector = msg.createMessageComponentCollector({
            filter: (butt) => butt.user.id === itr.user.id,
            componentType: 'BUTTON'
        });
        
        collector.on('collect', btn => {
            btn.deferUpdate();
            switch (btn.customId) {
                case "prev":
                    if (pagenum == 1) return btn.message.edit({
                        embeds: btn.message.embeds,
                        components: btn.message.components
                    });
                    pagenum--;
                    var emb = btn.message.embeds[0]
                        .setTitle(`📒 큐 표시 ${pagenum}/${Math.ceil(queue.songs.length / 10)}`)
                        .setDescription(texts[pagenum - 1]);
                    
                    btn.message.edit({
                        embeds: [ emb ],
                        components: btn.message.components
                    });
                    break;
                case "stop":
                    var components = btn.message.components;
                    
                    components.map(actionrow => actionrow.components.map(c => c.setDisabled(true)));
                    
                    btn.message.edit({
                        embeds: btn.message.embeds,
                        components
                    });
                    collector.stop();
                    break;
                case "next":
                    if (pagenum == Math.ceil(queue.songs.length / 10)) return btn.message.edit({
                        embeds: btn.message.embeds,
                        components: btn.message.components
                    });
                    pagenum++;
                    var emb = btn.message.embeds[0]
                        .setTitle(`📒 큐 표시 ${pagenum}/${Math.ceil(queue.songs.length / 10)}`)
                        .setDescription(texts[pagenum - 1]);
                    
                    btn.message.edit({
                        embeds: [ emb ],
                        components: btn.message.components
                    });
                    break;
            }
        });
    }
}