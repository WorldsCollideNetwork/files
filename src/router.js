var path  = require("path"),
    fs    = require("fs");

module.exports = function(app, users){
	// login listener
	app.post("/manage", function(req, res){
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
				    ext  = path.extname(name),
				    end  = require("./utils").complex_timestamp() + ext;

				console.log("UPLOAD.");
				console.log("- USER: " + user);
				console.log("- TYPE: " + ext);

				if (!app.get(user) || !fs.existsSync(app.get(user))){
					var buf = path.join(app.get("files"), user);

					fs.mkdirSync(buf);
					app.set(user, buf);
				}

				if (!app.get("thumb-" + user) || !fs.existsSync(app.get("thumb-" + user))){
					var buf = path.join(app.get("thumb"), user);

					fs.mkdirSync(buf);
					app.set("thumb-" + user, buf);
				}

				var write = path.join(app.get(user), end),
				    thumb = path.join(app.get("thumb-" + user), end);

				var rand = undefined;

				while (!rand || app.get("urls")[rand]){
					rand = require("./utils").generate_string() + ext;
				}

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