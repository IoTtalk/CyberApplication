const daRegister = (do_id=null) => {
  let Orientation_O1 = (data)=>{
    offsetX = data[2] * 20;
    offsetY = data[1] * 20;
  }

  let da = new iottalkjs.DAI({
    'apiUrl': ecEndpoint,
    'deviceModel': 'SnakeMove',
    'odfList': [[Orientation_O1, ['None', 'None', 'None']]],
    'profile': {
      'is_sim': do_id != null,
      'do_id': do_id,
    }
  });
  da.run();
};

projectInit({
  'dos': {
    'smartphone': {
      'dm_name': 'Smartphone',
      'dfs': ['Orientation-I'],
    },
    'snake': {
      'dm_name': 'SnakeMove',
      'dfs': ['Orientation-O1'],
      'callback': daRegister,
    }
  },
  'joins': [
    [['smartphone', 'Orientation-I'], ['snake', 'Orientation-O1']]
  ]
});