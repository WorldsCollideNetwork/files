var crypto = require("crypto");

function Utils(){
	this.timestamp = function(){
		var date  = new Date().toString(),
		    split = date.split(" "),
		    time  = split[4] + " " + split[1] + "/" + split[2];

		return time;
	};

	this.encrypt = function(text){
		var config    = require("./CONFIG.json"),
		    cipher    = crypto.createCipher(
		                config.encryption.algorithm,
		                config.encryption.password
		    ),
		    encrpyted = cipher.update(text, "utf8", "hex") + cipher.final("hex");

		return encrpyted;
	};

	this.decrypt = function(text){
		try {
			var config    = require("./CONFIG.json"),
			    cipher    = crypto.createDecipher(
			                config.encryption.algorithm,
			                config.encryption.password
			    ),
			    decrpyted = cipher.update(text, "hex", "utf8") + cipher.final("utf8");

			return decrpyted;
		} catch (e){
			return undefined;
		}
	};
}

module.exports = new Utils;