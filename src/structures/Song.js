const ytdl = require('ytdl-core');

const validateSong = function(song) {
    if (song instanceof module.exports) return true;
    
    if (!has(song, 'title') || typeof song.title != 'string') throw new TypeError(`title must be type string. not ${typeof song.title}`);
    if (!has(song, 'duration') || typeof song.duration != "string") throw new TypeError(`duration must be type string. not ${typeof song.duration}`);
    if (!has(song, 'thumbnail') || typeof song.thumbnail != 'string') throw new TypeError(`thumbnail must be type string. not ${typeof song.thumbnail}`);
    if (!has(song, 'url') || typeof song.url != 'string') throw new TypeError(`url must be type string. not ${typeof song.url}`);
    if (!has(song, 'stream')) throw new TypeError(`Expected ReadableStream. but got ${song.stream}`);
    
    return true;
}

module.exports = class Song {
    constructor(data) {
        this.client = data.client;
        
        this.addedBy = data.addedBy;
        this.title = data.title;
        this.url = data.url;
        this.duration = data.duration;
        this.thumbnail = typeof data.thumbnail === 'string' ? data.thumbnail : data.bestThumbnail.url;
        
        this.stream = null;
        
        validateSong(this);
    }
}

module.exports.validateSong = validateSong;