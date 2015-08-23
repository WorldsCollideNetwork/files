console.c_log = console.log.bind(console);
console.log = function(data){
	this.c_log("[" + require("./utils").simple_timestamp() + "]: >", data)
};

var server = require("./app").listen(require("./CONFIG.json").port, function(){
	console.log("LISTENING.");
	console.log("- PORT: " + server.address().port);
});