const da_register = (do_id=null) => {
	let Orientation_O = (data)=>{
		offsetX = data[2] * 20;
		offsetY = data[1] * 20;
	}

	let da = new iottalkjs.DAI({
		apiUrl: ec_endpoint,
		deviceModel: 'SnakeMove',
		odfList: [[Orientation_O, ['None']]],
		pushInterval: 1,
		interval: {
			Orientation_O: 1 / 2,
		},
		profile: {
			'is_sim': true,
			'do_id': do_id,
		}
	});
	da.run();
};

project_init({
	'dos': [
		{
			'dm_name': 'Smartphone',
			'dfs': ['Orientation-I'],
			'callback': (do_id)=>{
				let url = `${window.location.protocol}//${window.location.host}/cyberdevice/smartphone/${do_id}/`;
				console.log(url);
				gen_qrcode(url);
			},
		},
		{
			'dm_name': 'SnakeMove',
			'dfs': ['Orientation-O'],
			'callback': da_register,
		}
	],
	'joins': [
		['Smartphone', 'Orientation-I'], ['SnakeMove', 'Orientation-O']
	]
});