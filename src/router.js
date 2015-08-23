var path      = require("path"),
    fs        = require("fs");

module.exports = function(app, users){
	// login listener
	app.post("/clientid", function(req, res){
		req.pipe(req.busboy);
		
		req.busboy.on("field", function(field, val){
			if (!req.body) req.body = { };
			req.body[field] = val;
		});

		req.busboy.on("finish", function(){
			users.login(req, res);
		});
	});

	// upload listener
	app.post("/upload", function(req, res){
		req.pipe(req.busboy);

		req.busboy.on("field", function(field, val){
			if (!req.body) req.body = { };
			req.body[field] = val;
		});

		req.busboy.on("file", function(field, file, name){
			if (req.body && req.body.client_id){
				var user = users.get(req.body.client_id),
				    end  = require("./utils").complex_timestamp() + path.extname(name),
				    rand = undefined;

				console.log("UPLOADING.");
				console.log("- USER: " + user);
				console.log("- FILE: " + name);

				// check if user directory exists
				if (!app.get(user) || !fs.existsSync(app.get(user))){
					fs.mkdirSync(path.join(app.get("files"), user));
					app.set(user, path.join(app.get("files"), user));
				}

				while (!rand || app.get("urls")[rand]){
					rand = require("./utils").generate_string() + path.extname(name);
				}

				var fstream = fs.createWriteStream(path.join(app.get(user), end));
				file.pipe(fstream);

				fstream.on("close", function(){
					console.log("UPLOAD COMPLETE.");
					console.log("- USER: " + user);

					app.get("urls")[rand] = user + "," + end;

					try {
						res.json({
							status: 0,
							url: require("./CONFIG.json").archive_prefix + rand
						});
					} catch (e){ }
				});
			} else {
				try {
					res.json({
						status: 2
					});
				} catch (e){ }
			}
		});
	});
};