$(()=>{
	if(typeof qrcode1_html !== 'undefined' && qrcode1_html){
		gen_qrcode(qrcode1_html);
	}
	if(typeof qrcode2_html !== 'undefined' && qrcode2_html){
		gen_qrcode(qrcode2_html, 'qrcode2');
	}
})

const gen_qrcode = (html, id='qrcode1') => {
	if(html){
		// if has qrcode2, show players text
		if(id === ' qrcode2') {
			$('.players').removeClass('visually-hidden');
		}

		// gen qrcode
		$('#' + id).qrcode({'width': 196, 'height': 196, 'text': html});
	}
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
			'dos': [
				{
					'dm_name': 'Dummy_Device',
					'dfs': ['DummySensor-I', 'DummyControl-O']],
					'callback': callback, // return do_id for da register to autobind
				}
			],
			'joins': [
				['Dummy_Device', 'DummySensor-I'], ['Dummy_Device', 'DummyControl-O']
			]
		}
	*/
	let p_id;
	let do_ids = {}; // Save the created DeviceObject id for NetworkApplication creation

	let naCreate = () => {
		let joins = [];

		// fetch do_id
		profile.joins.forEach(([dm, df]) => {
			joins.push([do_ids[dm], df]);
		})

		// create Network Application
		ccmapi.naCreate(p_id, joins);

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
		profile.dos.forEach((do_) => {
			// create Device Object
			ccmapi.doCreate(p_id, do_.dm_name, do_.dfs, (result) => {
				do_ids[do_.dm_name] = result;

				// call DA callback, to create device
				do_.callback(result);

				// check all do is created, then create na.
				if(Object.keys(do_ids).length == profile.dos.length) {
					naCreate();
				}
			})
		})

		// delete project before unload
		let existingHandler = window.onbeforeunload;
		window.onbeforeunload = (event) => {
				if (existingHandler) existingHandler(event);
				ccmapi.projectDelete(p_id);
		}
	});
}
