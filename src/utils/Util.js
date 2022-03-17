module.exports = class Util {
    static datify(ms) {
        let hours = Math.floor(ms / (1000 * 60 * 60));
        let minutes = Math.floor(((ms - hours * 1000 * 60 * 60) / (1000 * 60)));
        let seconds = Math.round((ms - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
        return ((hours && `${hours}:` || "")) + (hours ? (minutes.toString().length === 1) ? '0' : '' : '') + `${minutes}:` + ((seconds.toString().length == 1) ? `0${seconds}` : seconds);
    }
    
    static toMS(duration) {
        let times = duration.split(":");
        
        let result;
        
        if (times.length == 2) {
            result = times[0] * 1000 * 60 + times[1] * 1000;
        } else {
            result = times[0] * 1000 * 60 * 60 + times[1] * 1000 * 60 + times[2] * 1000;
        }
        
        return result;
    }
    
    static makeProgressBar({ max, progress, length = 10, full = "➖", emoji = "🔘", empty = "➖" }) {
        let maxBar = length;
        let filled = Math.round(progress / max * maxBar);
        
        let filledBar;
        
        if (filled) filledBar = Array(filled - 1).fill(full).concat([ emoji ]);
        else filledBar = [ emoji ];
        let emptyBar = Array(length - filledBar.length).fill(empty);
        
        return filledBar.concat(emptyBar).join('');
    }
}