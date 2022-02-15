var pong;
Game.ready(function() {
	pong = Game.start('game', Pong, {});
});

const daRegister = (do_id=null) => {
	let Orientation_O1 = (data)=>{
		if(data[1] < -10){
			pong.leftPaddle.stopMovingUp();
			pong.leftPaddle.moveDown();
		} else if(data[1] > 30) {
			pong.leftPaddle.stopMovingDown();
			pong.leftPaddle.moveUp();
		} else {
			pong.leftPaddle.stopMovingUp();
			pong.leftPaddle.stopMovingDown();
		}
	}

	let Orientation_O2 = (data)=>{
		if(data[1] < -10){
			pong.rightPaddle.stopMovingUp();
			pong.rightPaddle.moveDown();
		} else if(data[1] > 30) {
			pong.rightPaddle.stopMovingDown();
			pong.rightPaddle.moveUp();
		} else {
			pong.rightPaddle.stopMovingUp();
			pong.rightPaddle.stopMovingDown();
		}
	}

	let da = new iottalkjs.DAI({
		apiUrl: ecEndpoint,
		deviceModel: 'Paddle',
		odfList: [
			[Orientation_O1, ['None', 'None', 'None']],
			[Orientation_O2, ['None', 'None', 'None']]
		],
		profile: {
			'is_sim': do_id != null,
			'do_id': do_id,
		}
	});
	da.run();
};

projectInit({
	'dos': {
		'smartphone1': {
			'dm_name': 'Smartphone',
			'dfs': ['Orientation-I'],
			'callback': (do_id)=>{
				let url = `${window.location.protocol}//${window.location.host}/cyberdevice/smartphone/${do_id}/`;
				console.log(url);
				genQrcode(url);
			},
		},
		'smartphone2': {
			'dm_name': 'Smartphone',
			'dfs': ['Orientation-I'],
			'callback': (do_id)=>{
				let url = `${window.location.protocol}//${window.location.host}/cyberdevice/smartphone/${do_id}/`;
				console.log(url);
				genQrcode2(url);
			},
		},
		'paddle': {
			'dm_name': 'Paddle',
			'dfs': ['Orientation-O1', 'Orientation-O2'],
			'callback': daRegister,
		}
	},
	'joins': [
		[['smartphone1', 'Orientation-I'], ['paddle', 'Orientation-O1']],
		[['smartphone2', 'Orientation-I'], ['paddle', 'Orientation-O2']]
	]
});