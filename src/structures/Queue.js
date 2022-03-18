const voices = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');

const Song = require('./Song');

const validateQueue = function(queue) {
    if (queue instanceof module.exports) return true;
    
    if (!has(queue, 'textChannel') || !(queue.textChannel instanceof Discord.BaseGuildTextChannel)) throw new TypeError(`Expected BaseGuildTextChannel. but got ${queue.textChannel}`);
    if (!has(queue, 'voiceChannel') || !(queue.voiceChannel instanceof Discord.BaseGuildVoiceChannel)) throw new TypeError(`Expected BaseGuildVoiceChannel. but got ${queue.voiceChannel}`);
    if (!has(queue, 'songs') || !Array.isArray(queue.songs)) throw new TypeError(`songs must be type array. not ${typeof queue.songs}`);
    if (!has(queue, 'connection') || !(queue.connection instanceof Voice.VoiceConnection)) throw new TypeError(`Expected VoiceConnection. but got ${queue.connection}`);
    
    return true;
}

module.exports = class Queue {
    constructor(data) {
        this.client = data.client;
        
        let listener = (os, ns) => {
            if ((os.channel ? os : ns).channel.id === this.voiceChannel.id) {
                if (!this.voiceChannel.members.has(this.client.user.id)) {
                    this.client.queues.delete(this.textChannel.guild.id);
                    this.client.off('voiceStateUpdate', listener);
                } else if (this.voiceChannel.members.size < 2) {
                    this.connection.disconnect();
                    
                    this.client.queues.delete(this.textChannel.guild.id);
                    this.client.off('voiceStateUpdate', listener);
                    
                    this.textChannel.send('👋 모든 유저가 퇴장하여 재생을 종료했습니다.');
                }
            }
        }
        
        this.client.on('voiceStateUpdate', listener);
        
        this.isPaused = null;
        this.isPlaying = false;
        this.repeat = false;
        
        this.textChannel = data.textChannel;
        this.voiceChannel = data.voiceChannel;
        
        this.songs = data.songs ?? [];
        
        this.connection = data.connection;
        
        validateQueue(this);
    }
    
    async preload() {
        for (let i = 0; i < 3; i++) {
            let song = this.songs[i];
            
            if (!song || song.stream) continue;
            else this.songs[i].stream = ytdl(song.url);
        }
        
        return true;
    }
    
    addSong(data) {
        this.songs.push(new Song({ client: this.client, ...data }));
        
        return true;
    }
    
    removeSong(index, fromOne) {
        if (fromOne) this.songs.splice(index - 1, 1);
        else this.songs.splice(index, 1);
        
        if (!this.songs.length) {
            this.connection.disconnect();
            this.textChannel.send("✅ 더 이상 재생할 음악이 없어 재생을 종료했습니다!");
        } else this.play();
        
        return true;
    }
    
    pause() {
        this.isPaused = true;
        return this.connection.state.subscription.player.pause(true);
    }
    
    resume() {
        this.isPaused = false;
        return this.connection.state.subscription.player.unpause();
    }
    
    setVolume(volume) {
        this.connection.state.subscription.player.state.resource.volume.setVolume(volume / 100);
        
        return true;
    }
    
    get volume() {
        return this.connection.state.subscription.player.state.resource?.volume.volume ?? 0.7;
    }
    
    set volume(volume) {
        this.setVolume(volume);
    }
    
    async skip() {
        if (!this.repeat) this.songs.shift();
        else {
            let song = this.songs[0];
            
            this.songs.shift();
            this.songs.push(song);
        }
        
        if (!this.songs.length) {
            this.connection.disconnect();
            this.textChannel.send("✅ 더 이상 재생할 음악이 없어 재생을 종료했습니다!");
        } else this.play();
        
        return true;
    }
    
    async play() {
        if (this.songs.filter(song => !!song.stream).length == 1 || !this.songs[0].stream) await this.preload();
        
        this.isPlaying = true;
        this.isPaused = false;
        
        let resource = voices.createAudioResource(this.songs[0].stream, {
            inlineVolume: true
        });
        
        let player = voices.createAudioPlayer();
        
        resource.playStream.on('finish', () => {
            if (!this.repeat) this.songs.shift();
            else {
                let song = this.songs[0];
                song.stream = null;
                
                this.songs.shift();
                if (this.repeat === 'queue') this.songs.push(song);
                else this.songs.splice(0, 0, song);
            }
            
            if (!this.songs.length) {
                this.connection.disconnect();
                this.textChannel.send("✅ 더 이상 재생할 음악이 없어 재생을 종료했습니다!");
            } else this.play();
        });
        
        player.on('error', err => {
            this.connection.disconnect();
            this.textChannel.send("⚠️ 오류가 발생했습니다.");
            console.error(err);
        });
        
        this.connection.subscribe(player);
        
        resource.volume.setVolume(this.volume);
        
        player.play(resource);
        
        let embed = new MessageEmbed()
            .setDescription(
                `**🎵 [음악 재생 시작!](${this.songs[0].url})**\n\n${this.songs[0].title} \n\n길이: ${this.songs[0].duration}`)
            .setColor("RANDOM")
            .setImage(this.songs[0].thumbnail);
        
        await this.textChannel.send({ embeds: [ embed ]});
        
        return true;
    }
}

module.exports.validateQueue = validateQueue;