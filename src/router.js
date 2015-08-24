var path  = require("path"),
    fs    = require("fs");

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
			// I have no idea why I have to make this extra declaration
			var path = require("path");

			if (req.body && req.body.client_id){
				// generic variables
				var user = users.get(req.body.client_id),
				    ext  = path.extname(name),
				    end  = require("./utils").complex_timestamp() + ext;

				// generic logging
				console.log("UPLOAD.");
				console.log("- USER: " + user);
				console.log("- TYPE: " + ext);

				// check if user directory exists
				if (!app.get(user) || !fs.existsSync(app.get(user))){
					var path = path.join(app.get("files"), user);

					fs.mkdirSync(path);
					app.set(user, path);
				}

				// check if thumb user directory exists
				if (!app.get("thumb-" + user) || !fs.existsSync(app.get("thumb-" + user))){
					var path = path.join(app.get("thumb"), user);

					fs.mkdirSync(path);
					app.set("thumb-" + user, path);
				}

				// directory variables
				var write = path.join(app.get(user), end),
				    thumb = path.join(app.get("thumb-" + user), end);

				// random string generator
				while (!rand || app.get("urls")[rand]){
					rand = require("./utils").generate_string() + ext;
				}

				// stream buffer into file
				var fstream = fs.createWriteStream(write);
				file.pipe(fstream);

				// finish event
				fstream.on("close", function(){
					// thumb creation
					if (!/^win/.test(process.platform)){
						require("lwip").open(write, function(err, image){
							image.resize(100, function(err, image){
								image.writeFile(thumb, function(err){ })
							});
						});
					}

					// redirect url
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