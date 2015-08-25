var crypto = require("crypto"),
    path   = require("path"),
    fs     = require("fs");

function Utils(){
	this.simple_timestamp = function(){
		var date  = new Date().toString(),
		    split = date.split(" "),
		    time  = split[4] + " " + split[1] + "/" + split[2];

		return time;
	};
	
	this.complex_timestamp = function(){
		var date = new Date();
		return [
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			date.getHours(),
			date.getMinutes(),
			date.getSeconds(),
			date.getMilliseconds()
		].join("-");
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

	this.get_dirs = function(src){
		return fs.readdirSync(src).filter(function(file){
			return fs.statSync(path.join(src, file)).isDirectory();
		});
	};

	this.get_files = function(src){
		return fs.readdirSync(src).filter(function(file){
			return fs.statSync(path.join(src, file)).isFile();
		});
	};

	this.generate_string = function(){
		return Math.random().toString(36).slice(2).substring(0, 5);
	};

	this.list = function(app, username){
		var list = [];

		for (var i in app.get("urls")){
			if (app.get("urls").hasOwnProperty(i) && 
				app.get("urls")[i].indexOf(username) == 0){
				list.push(app.get("urls")[i].split(",")[1]);
			}
		}

		return list;
	};

	this.thumbs = function(app, username){
		var thumbs = { };

		for (var i in app.get("urls")){
			if (app.get("urls").hasOwnProperty(i) && 
				app.get("urls")[i].indexOf(username) == 0){
				var file = app.get("urls")[i].split(",")[1];

				if (require("./utils").get_files(
						app.get("thumb-" + username)).indexOf(file) > -1){
					thumbs[i] = "/thumb/" + i;
				}
			}
		}

		return thumbs;
	};

	this.save = function(data){
		fs.writeFileSync("URLS.json", JSON.stringify(data, null, "\t"));
	};
}

module.exports = new Utils;