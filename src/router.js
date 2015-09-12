var path   = require("path"),
    fs     = require("fs"),
    parser = require("body-parser"),
    busboy = require("connect-busboy")();

module.exports = function(app, users){
	// authentication middleware
	function auth(req, res, next){
		if ((req.body && req.body.client_id && require("./utils").decrypt(req.body.client_id)) ||
			(req.query && req.query.client_id && require("./utils").decrypt(req.query.client_id)) ||
			(req.body && req.body.username && req.body.password)){
			if (next) return next();
			return true;
		} else {
			users.render_manage(req, res, {
				status: 2
			});
		}
	}

	// GET listeners

	app.get("/api/list", parser.json(), auth, function(req, res){
		var utils = require("./utils");

		res.json({
			list: utils.list(app, utils.decrypt(req.query.client_id))
		});
	});

	// POST listeners

	app.post("/api/remove", parser.json(), auth, function(req, res){
		var utils = require("./utils");

		if (req.body.path){
			res.json({
				status: utils.remove(app, utils.decrypt(req.body.client_id), req.body.path)
			});
		} else {
			res.json({
				status: 1
			});
		}
	});

	app.post("/api/upload", busboy, function(req, res){
		req.pipe(req.busboy);

		req.busboy.on("field", function(field, val){
			if (!req.body) req.body = { };
			req.body[field] = val;
		});

		req.busboy.on("file", function(field, file, name){
			if (auth(req, res)){
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
					var img_exts = [".png", ".jpg", ".jpeg", ".gif"];

					// thumb creation
					if (!/^win/.test(process.platform) && img_exts.indexOf(ext) > -1){
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
			}
		});
	});

	// generic listeners

	function callback(req, res){
		var utils = require("./utils"),
		    data  = req.body,
		    that  = this;

		require("request")({
			method: "POST",
			url: require("./CONFIG.json").login_request,
			json: {
				"username": data.username,
				"password": data.password
			}
		}, function(err, resp, body){
			if (err || resp.statusCode != 200){
				users.render_manage(res, {
					status: 1
				});
			} else {
				if (body.success){
					var id = utils.encrypt(data.username);

					console.log("LOGIN.");
					console.log("- USER: " + data.username);

					res.cookie("client_id", id);

					users.render_manage(req, res, {
						status: 0,
						username: data.username
					});
				} else {
					users.render_manage(req, res, {
						status: 2
					});
				}
			}
		});
	}

	app.post("/manage", parser.urlencoded({ extended: true }), auth, function(req, res){
		callback(req, res);
	});

	app.post("/manage/json", parser.json(), auth, function(req, res){
		callback(req, res);
	});
};