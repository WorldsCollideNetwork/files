var utils = require("./utils");

function Users(){
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

						res.render("clientid", {
							status: 0,
							id: id,
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
						res.render("clientid", {
							status: 2
						});
					}
				}
			});
		} else {
			res.render("clientid", {
				status: 2
			});
		}
	};

	this.get = function(client_id){
		return utils.decrypt(client_id);
	};
}

module.exports = new Users;