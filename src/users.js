var utils = require("./utils");

function Users(){
	this.login = function(res, data){
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
						console.log("REQUESTED CLIENT ID.");
						console.log("- USER: " + data.username);

						res.json({
							status: 0,
							client_id: utils.encrypt(data.username)
						});
					} else {
						res.json({
							status: 2
						});
					}
				}
			});
		} else {
			res.json({
				status: 2
			});
		}
	};

	this.get = function(client_id){
		return utils.decrypt(client_id);
	};
}

module.exports = new Users;