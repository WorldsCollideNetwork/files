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
								thumbs[i] = "/thumb/" + i;
							}
						}

						res.render("manage", {
							status: 0,
							id: id,
							thumbs: thumbs,
							json: JSON.stringify({
								"Name": "WCN Files",
								"RequestType": "POST",
								"RequestURL": require("./CONFIG.json").archive_prefix + "upload",
								"FileFormName": "file",
								"Arguments": {
									"client_id": id
								},
								"ResponseType": "Text",
								"RegexList": [
									"\"url\":\"(.+?)\""
								],
								"URL": "$1,1$",
								"ThumbnailURL": "",
								"DeletionURL": ""
							}, null, "\t")
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