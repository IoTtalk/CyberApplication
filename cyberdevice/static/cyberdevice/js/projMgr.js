const genQrcode = (url, id='qrcode1') => {
	if(url){
		// if has qrcode2, show players text
		if(id === 'qrcode2') {
			$('.players').removeClass('visually-hidden');
		}

		// gen qrcode
		$('#' + id).qrcode({'width': 196, 'height': 196, 'text': html});
	}
}

const genQrcode2 = (url) => {
	genQrcode(url, 'qrcode2');
}

const ccmapi = function() {
	let DEBUG = false;
	
	let debugCallback = (d) => { if (DEBUG) {console.log(d);}};

	let agRequest = (op, payload, callback) => {
		let json = {'api_name': op, 'payload': payload}
		if (agUsername && agPassword) {
			json['username'] = agUsername
			json['password'] = agPassword
		} else if (agAccessToken) {
			json['access_token'] = agAccessToken
		}
		axios.post(
			agEndpoint,
			json=json
		).then((request) => {
			if(request.data.state == 'ok' && callback){
				callback(request.data.result);
			}
		}).catch((e) => {console.log(e);})
	}

	let projectGet = (p_id, callback=debugCallback) => {
		agRequest('project.get', {'p_id': p_id}, callback);
	}

	let projectCreate = (p_name, callback=debugCallback) => {
		console.log('project name:', p_name);
		agRequest('project.create', {'p_name': p_name}, callback);
	}

	let projectOn = (p_id, callback=debugCallback) => {
		agRequest('project.on', {'p_id': p_id}, callback);
	}

	let projectDelete = (p_id, callback=debugCallback) => {
		agRequest('project.delete', {'p_id': p_id}, callback);
	}

	let doCreate = (p_id, dm_name, dfs, callback=debugCallback) => {
		agRequest('deviceobject.create', {'p_id': p_id, 'dm_name': dm_name, 'dfs': dfs}, callback);
	}

	let naCreate = (p_id, joins, callback=debugCallback) => {
		agRequest('networkapplication.create', {'p_id': p_id, 'joins': joins}, callback);
	}

	return {
		'projectGet': projectGet,
		'projectCreate': projectCreate,
		'projectOn': projectOn,
		'projectDelete': projectDelete,
		'doCreate': doCreate,
		'naCreate': naCreate
	}
}();

const projectInit = (profile) => {
	/* example:

		profile = {
			'dos': {
				'dummy1': {
					'dm_name': 'Dummy_Device',
					'dfs': ['DummySensor-I', 'DummyControl-O']],
					'callback': dd1_callback, // return do_id for da register to autobind
				},
				'dummy2': {
					'dm_name': 'Dummy_Device',
					'dfs': ['DummyControl-O']],
					'callback': dd2_callback, // return do_id for da register to autobind
				},
				'smartphone': {
					'dm_name': 'Smartphone',
					'dfs': ['Acceleration-I']],
					'callback': sp_callback, // return do_id for da register to autobind
				}, 

			},
			'joins': [
				[['dummy1', 'DummySensor-I'], ['dummy1', 'DummyControl-O']],
				[['Smartphone', 'Acceleration-I'], ['dummy2', 'DummyControl-O']]
			]
		}
	*/
	let p_id;
	let do_creates_count = 0;
	let do_ids = {}; // Save the created DeviceObject id for NetworkApplication creation

	let naCreate = () => {
		profile.joins.forEach((join) => {
			let payload = [];

			// fetch do_id
			join.forEach(([name, df]) => {
				payload.push([profile.dos[name]['do_id'], df]);
			})

			// create Network Application
			ccmapi.naCreate(p_id, payload);
		})

		//turn on Project
		ccmapi.projectOn(p_id);
	}

	// for generate random project name
	let randomString = () => {
		return (Math.random() + 1).toString(36).substring(2);
	}

	// create Project
	ccmapi.projectCreate(randomString(), (result) => {
		p_id = result;
		for (let do_key in profile.dos){
			let do_ = profile.dos[do_key];
			// create Device Object
			ccmapi.doCreate(p_id, do_.dm_name, do_.dfs, (result) => {
				do_creates_count++;
				do_['do_id'] = result;

				// call DA callback, to create device
				do_.callback(result);

				// check all do is created, then create na.
				if(Object.keys(profile.dos).length == do_creates_count) {
					naCreate();
				}
			})
		}

		// delete project before unload
		let existingHandler = window.onbeforeunload;
		window.onbeforeunload = (event) => {
				if (existingHandler) existingHandler(event);
				ccmapi.projectDelete(p_id);
		}
	});
}

if(typeof qrcodeHtml1 !== 'undefined' && qrcodeHtml1){
	genQrcode(qrcodeHtml1);

	if(typeof qrcodeHtml2 !== 'undefined' && qrcodeHtml2){
		genQrcode(qrcodeHtml2, 'qrcode2');
	}
}
