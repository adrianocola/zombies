ZT.Util = {
    timers: {},
    startTimer: function(id){
        ZT.Util.timers[id || "*"] = new Date();
    },
    endTimer: function(id){
        console.log((id || "*") + ": " + (new Date() - ZT.Util.timers[id || "*"]));
    }
};