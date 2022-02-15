gGameEngine.load()

const daRegister = (do_id=null) => {
  let bomb = 32; // space
  let right = 39, left = 37, up = 38, down = 40; // →, ←, ↑, ↓
  let threshold = 10; // Orientation_O threshold determines the direction
  let pre_action = 0;

  let _control = (value)=>{
    let event = new CustomEvent('control',{'detail':{'value': value}});
    document.dispatchEvent(event);
  }

  let _controlend = (value)=>{
    let event = new CustomEvent('controlend',{'detail':{'value': value}});
    document.dispatchEvent(event);
  }

  let Acceleration_O1 = (data)=>{
    //bomb
    if ((data[2] + 9.8) ** 2 > 50) {
      console.log('bomb');
      _control(bomb);
      setTimeout(()=>{_controlend(bomb)}, 10);
    }
  }

  let Orientation_O1 = (data)=>{
    let action = 0;
    // Decide the direction
    if (Math.abs(data[1]) > Math.abs(data[2])) {
      if (data[1] > threshold) {       action = down;}
      else if (data[1] < -threshold) { action = up;}
    } else {
      if (data[2] > threshold) {       action = right;}
      else if (data[2] < -threshold) { action = left;}
    }

    if (pre_action != action) {
      _controlend(pre_action);
      if (action != 0) {
        _control(action);
      }
    } else {
      _control(action);
    }

    pre_action = action;
  }

  // TODO: support two player
  let Acceleration_O2 = (data)=>{}
  let Orientation_O2 = (data)=>{}

  let da = new iottalkjs.DAI({
    apiUrl: ecEndpoint,
    deviceModel: 'Bombman',
    odfList: [[Orientation_O1, ['None', 'None', 'None']],
              [Acceleration_O1, ['None', 'None', 'None']],
              [Orientation_O2, ['None', 'None', 'None']],
              [Acceleration_O2, ['None', 'None', 'None']]],
    profile: {
      'is_sim': do_id != null,
      'do_id': do_id,
    }
  });
  da.run();
};

projectInit({
  'dos': {
    'smarphone1': {
      'dm_name': 'Smartphone',
      'dfs': ['Acceleration-I', 'Orientation-I'],
      'callback': (do_id)=>{
        let url = `${window.location.protocol}//${window.location.host}/cyberdevice/smartphone/${do_id}/`;
        console.log(url);
        genQrcode(url);
      },
    },
    'smarphone2': {
      'dm_name': 'Smartphone',
      'dfs': ['Acceleration-I', 'Orientation-I'],
      'callback': (do_id)=>{
        let url = `${window.location.protocol}//${window.location.host}/cyberdevice/smartphone/${do_id}/`;
        console.log(url);
        //genQrcode2(url); // TODO support player2 qrcode
      },
    },
    'bombman': {
      'dm_name': 'Bombman',
      'dfs': ['Acceleration-O1', 'Acceleration-O2', 'Orientation-O1', 'Orientation-O2'],
      'callback': daRegister,
    }
  },
  'joins': [
    // this order will be more beautiful in IoTtalk GUI
    [['smarphone1', 'Orientation-I'], ['bombman', 'Orientation-O1']],
    [['smarphone1', 'Acceleration-I'], ['bombman', 'Acceleration-O1']],
    [['smarphone2', 'Acceleration-I'], ['bombman', 'Acceleration-O2']],
    [['smarphone2', 'Orientation-I'], ['bombman', 'Orientation-O2']],
  ]
});

/* ==== */

function smartphone_0616018v2(data){  // TODO
  if(data[2] < 0){
    console.log(data[2]);
    gInputEngine.bombput();
  }
  else if(Math.abs(data[0]) > Math.abs(data[1])){
    gInputEngine.actions['sniper_down'] = false;
    gInputEngine.actions['sniper_up'] = false;
    if(data[0]>0){
      gInputEngine.actions['sniper_right'] = false;
      gInputEngine.actions['sniper_left'] = true;
    }
    else{
      gInputEngine.actions['sniper_right'] = true;
      gInputEngine.actions['sniper_left'] = false;
    }
  }
  else{
    gInputEngine.actions['sniper_right'] = false;
    gInputEngine.actions['sniper_left'] = false;
    if(-data[1]>0){
      gInputEngine.actions['sniper_down'] = false;
      gInputEngine.actions['sniper_up'] = true;
    }
    else{
      gInputEngine.actions['sniper_down'] = true;
      gInputEngine.actions['sniper_up'] = false;
    }
  }
}
