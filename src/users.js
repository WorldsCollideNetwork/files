var utils = require("./utils");

function Users(app){
	this.login = function(req, res){
		var data = req.body;

		if (data.username && data.password){
			require("request")({
				method: "POST",
				url: require("./CONFIG.json").login_request,
				json: {
					"username": data.username,
					"password": data.password
				}
			}, function(err, resp, body){
				if (err || resp.statusCode != 200){
					res.json({
						status: 1
					});
				} else {
					if (body.success){
						var id = utils.encrypt(data.username);

						console.log("REQUESTED CLIENT ID.");
						console.log("- USER: " + data.username);

						var thumbs = { };

						for (var i in app.get("urls")){
							if (app.get("urls").hasOwnProperty(i) && 
								app.get("urls")[i].indexOf(data.username) == 0){
								var file = app.get("urls")[i].split(",")[1];

								if (require("./utils").get_files(
										app.get("thumb-" + data.username)).indexOf(file) > -1){
									thumbs[i] = "/thumb/" + i;
								}
							}
						}

						res.cookie("user", id, {
							expires: new Date(Date.now() + (60 * 60 * 24 * 365 * 20 * 1000))
						});

						res.render("manage", {
							status: 0,
							thumbs: thumbs
						});
					} else {
						res.render("manage", {
							status: 2
						});
					}
				}
			});
		} else {
			res.render("manage", {
				status: 2
			});
		}
	};

	this.get = function(client_id){
		return utils.decrypt(client_id);
	};

	return this;
}

module.exports = Users;