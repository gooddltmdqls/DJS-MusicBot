const system = {
    memory: () => {
        const memory = process.memoryUsage();
        const keys = Object.keys(memory);
        const a = memory;
        
        let result = {}
        
        keys.forEach(key => { 
            result[key] = (a[key] / 1024 / 1024).toFixed(2) + 'MB';
        });
        
        return result;
    },
    processReadyAt: () => {
        return new Date(Date.now() - process.uptime() * 1000);
    }
}

const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("코드를 실행하거나 봇 상태를 확인합니다.")
        .addStringOption(opt => {
            return opt.setName("코드")
               .setDescription("실행할 코드입니다.")
        }),
    async execute(itr) {
        await itr.deferReply({ ephemeral: true });
        
        if (!itr.client.owners.includes(itr.user.id)) return await itr.editReply("봇 관리자가 아닙니다.");
        
        if (!itr.options.getString("코드")) {
            let summary = `discord.js \`${Discord.version}\`, \`Node.js ${process.version}\` on \`${process.platform}\`\nProcess started at ${_format(system.processReadyAt(), "R")}, bot was ready at ${_format(itr.client.readyAt, "R")}.\n`;
            summary += `\nUsing ${system.memory().rss} at this process.\n`;
            
            const cache = `${itr.client.guilds.cache.size} guild(s) and ${itr.client.users.cache.size} user(s)`;
            if (itr.client.shard) { 
                const guilds = await itr.client.shard.fetchClientValues('guilds.cache.size').then(r => r.reduce((prev, val) => prev + val, 0));
                summary += `Running on PID ${process.pid} for this client, and running on PID ${process.ppid} for the parent process.\n\nThis bot is sharded in ${Array.isArray(itr.client.shard.shards) ? itr.client.shard.shards.length : itr.client.shard.count} shard(s) and running in ${guilds} guild(s).\nCan see ${cache} in this client.`; 
            } else summary += `Running on PID ${process.pid}\n\nThis bot is not sharded and can see ${cache}.`;
            
            summary += `\nAverage websocket latency: ${itr.client.ws.ping}ms`;
            return await itr.editReply(summary);
        } else {
            let client = itr.client;
            let code = itr.options.getString("코드");
            if (code.startsWith("```js")) {
                if (!code.endsWith("```")) return await itr.editReply("코드블록이 닫히지 않았습니다.");
                const result = code.match(/^```(.*?)\n(.*?)```$/ms);
                code = result ? result.slice(0, 3).map(el => el.trim()) : null;
            }
            
            const embed = new Discord.MessageEmbed()
                .setDescription("Eval!")
                .setColor("BLUE")
                .setFooter({ text: itr.user.tag, iconURL: itr.user.displayAvatarURL({ dynamic: true })});
            
            embed.addField("Input", `\`\`\`js\n${code}\`\`\``);
            
            let output;
            try {
                output = await (new Promise(resolve => resolve(eval(Array.isArray(code) ? code[2] : code))));
            } catch (err) {
                embed.addField("Output [ERROR]", `\`\`\`js\n${err}\`\`\``);
                await itr.editReply({ embeds: [ embed ]}).catch(async (error) => {
                    console.error(error);
                    await itr.editReply("오류 전송에 실패했어요...");
                });
            } finally {
                embed.addField("Output", `\`\`\`js\n${output}\`\`\``);
                await itr.editReply({ embeds: [ embed ]}).catch(async (error) => {
                    console.error(error);
                    await itr.editReply("반환 정보 전송에 실패했어요...");
                });
            }
        }
    }
}

function _format(date, style) {
    return `<t:${Math.floor(date / 1000)}` + (style ? `:${style}` : '') + '>';
}