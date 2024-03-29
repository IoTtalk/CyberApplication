scene = None
g = 9.8
size = 0.7
dt = 0.005
is_gj = 1

preloadAudio('Startup.wav')
preloadAudio('chord.wav')
preloadAudio('gj.wav')

renderInfo("掃描完 QR code 後, 試試看甩動手機！")

def init():
    global scene
    scene = display(width=600,
                    height=500,
                    background=vector(0.6, 0.3, 0.2),
                    center=vector(-12, 7, 0),
                    range=16,
                    forward=vector(0.8, 0, -1))

    # floors
    box(length=24,
        height=0.5,
        width=4,
        color=color.green,
        pos=vector(-12, 0, 0))
    box(length=8,
        height=0.5,
        width=4,
        color=color.red,
        pos=vector(4, 0, 0))
    box(length=8,
        height=0.5,
        width=4,
        color=color.green,
        pos=vector(12, 0, 0))


def balljump(spd):
    if (spd < 5):
        return

    global size
    ball = sphere(pos=vector(-24, 10.0, 0.0),
                  radius=size,
                  color=color.white)
    ball.velocity = vector(spd, -1.0, 0.0)

    def reset_scene():
        global is_gj
        scene.background = vector(0.6, 0.3, 0.2)
        is_gj = 1

    def jump():
        if (ball.pos.x < 8 and ball.pos.x > 0) and ball.pos.y < size + 0.5:
            global is_gj
            scene.background = vector(0, 0, 0)
            sleep(0.3, reset_scene)

            if is_gj:
                playAudio('gj.wav')
                is_gj = 0

        ball.pos = ball.pos + ball.velocity * dt

        if ball.pos.y < size + 0.5:
            ball.velocity.y = - ball.velocity.y
            # playAudio('chord.wav')
        else:
            ball.velocity.y = ball.velocity.y - g * dt

        if ball.pos.x < 16:
            rate(1 / dt, jump)
        else:
            ball.visible = False

    jump()


def Speed_O(data):
    if data is not None:
        balljump(data[0])


def daRegister(do_id=None):
    init()

    def onRegister():
        playAudio('Startup.wav')

    profile = {
        'apiUrl': ecEndpoint,
        'deviceModel': 'Ball-throw2',
        'idfList': [],
        'odfList': [[Speed_O, ['m/s']]],
        'profile': {
            'is_sim': do_id is not None,
            'do_id': do_id,
        },
        'onRegister': onRegister,
    }
    da = new iottalkjs.DAI(profile)
    da.run()


def smartphoneCallback(do_id):
    origin = window.location.origin
    url = origin + '/cyberdevice/smartphone/' + do_id
    genQrcode(url);

projectInit({
  'dos': {
    'smartphone': {
      'dm_name': 'Smartphone',
      'dfs': ['Acceleration-I'],
      'callback': smartphoneCallback,
    },
    'ball': {
      'dm_name': 'Ball-throw2',
      'dfs': ['Speed-O'],
      'callback': daRegister,
    }
  },
  'joins': [
    [['smartphone', 'Acceleration-I'], ['ball', 'Speed-O']]
  ]
});
