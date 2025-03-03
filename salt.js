const request = require("request-promise-native");

class Salt {

	constructor(config) {
		this.config = config;
		this.headers = "";
		this.init();
	}

	init() {
		this.ready = request({
			url: this.config.url + "/login",
			method: "POST",
			json: true,
			form: {
				username: this.config.username,
				password: this.config.password,
				eauth: (typeof this.config.eauth === "string") ? this.config.eauth : "pam"
			}
		}).then(data => {
			if(typeof data === "object" && typeof data.return === "object" && typeof data.return[0].token === "string") {
				this.token = data.return[0].token;
				this.expire = data.return[0].expire;
			} else {
				throw "Got no token";
			}
		}).catch(e => console.error(e));
	}

	async fun(tgt="*", fun="test.ping", arg=false, kwarg=false, client="local", pillar=false, timeout=false, tgt_type=false) {
		if(this.expire <= new Date() / 1000) {
			this.init();
			await this.ready;
		}
		let form = { tgt, fun, client }
		if(arg) form.arg = arg;
		if(kwarg) form.kwarg = kwarg;
		if(pillar) form.pillar = pillar;
		if(timeout) form.timeout = timeout;
		if(tgt_type) form.tgt_type = tgt_type;
		return request({
			url: this.config.url,
			method: "POST",
			json: form,
			headers: {"X-Auth-Token": this.token},
		});
	}

}

module.exports = Salt;
