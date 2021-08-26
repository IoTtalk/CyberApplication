const gen_qrcode = (html, id='qrcode1') => {
	if(html){
		// if has qrcode2, show players text
		if(id === 'qrcode2') {
			$('.players').removeClass('visually-hidden');
		}

		// gen qrcode
		$('#' + id).qrcode({'width': 196, 'height': 196, 'text': html});
	}
}

const gen_qrcode2 = (html) => {
	gen_qrcode(html, 'qrcode2');
}

const ccmapi = function() {
	let DEBUG = false;
	
	let debug_callback = (d) => { if (DEBUG) {console.log(d);}};

	let ag_request = (op, payload, callback) => {
		axios.post(
			ag_endpoint,
			json={
				'username': ag_username,
				'password': ag_password,
				'api_name': op,
				'payload': payload
			}
		).then((request) => {
			if(request.data.state == 'ok' && callback){
				callback(request.data.result);
			}
		}).catch((e) => {console.log(e);})
	}

	let projectGet = (p_id, callback=debug_callback) => {
		ag_request('project.get', {'p_id': p_id}, callback);
	}

	let projectCreate = (p_name, callback=debug_callback) => {
		console.log('project name:', p_name);
		ag_request('project.create', {'p_name': p_name}, callback);
	}

	let projectOn = (p_id, callback=debug_callback) => {
		ag_request('project.on', {'p_id': p_id}, callback);
	}

	let projectDelete = (p_id, callback=debug_callback) => {
		ag_request('project.delete', {'p_id': p_id}, callback);
	}

	let doCreate = (p_id, dm_name, dfs, callback=debug_callback) => {
		ag_request('deviceobject.create', {'p_id': p_id, 'dm_name': dm_name, 'dfs': dfs}, callback);
	}

	let naCreate = (p_id, joins, callback=debug_callback) => {
		ag_request('networkapplication.create', {'p_id': p_id, 'joins': joins}, callback);
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

const project_init = (profile) => {
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
	let random_string = () => {
		return (Math.random() + 1).toString(36).substring(2);
	}

	// create Project
	ccmapi.projectCreate(random_string(), (result) => {
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

if(typeof qrcode1_html !== 'undefined' && qrcode1_html){
	gen_qrcode(qrcode1_html);

	if(typeof qrcode2_html !== 'undefined' && qrcode2_html){
		gen_qrcode(qrcode2_html, 'qrcode2');
	}
}
