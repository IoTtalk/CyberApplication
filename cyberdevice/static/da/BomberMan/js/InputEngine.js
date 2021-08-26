InputEngine = Class.extend({
    /**
     * A dictionary mapping ASCII key codes to string values describing
     * the action we want to take when that key is pressed.
     */
    bindings: {},

    /**
     * A dictionary mapping actions that might be taken in our game
     * to a boolean value indicating whether that action is currently being performed.
     */
    actions: {},

    listeners: [],

    init: function() {
    },
	
    setup: function() {
		
        this.bind(38, 'up');
        this.bind(37, 'left');
        this.bind(40, 'down');
        this.bind(39, 'right');
        this.bind(32, 'bomb');
        this.bind(18, 'bomb');

        this.bind(87, 'up2');
        this.bind(65, 'left2');
        this.bind(83, 'down2');
        this.bind(68, 'right2');
        this.bind(16, 'bomb2');

        /* change */
        this.bind(73, 'sniper_up');
        this.bind(74, 'sniper_left');
        this.bind(75, 'sniper_down');
        this.bind(76, 'sniper_right');
        this.bind(190, 'sniper_bomb');
        /* change */

        this.bind(13, 'restart');
        this.bind(27, 'escape');
        this.bind(77, 'mute');

		document.addEventListener('control', this.onKeyDown);
        document.addEventListener('controlend', this.onKeyUp);
		
        //document.addEventListener('keydown', this.onKeyDown);
        //document.addEventListener('keyup', this.onKeyUp);
    },

    bombput:function(){
        var action = gInputEngine.bindings[190];
        if (action) {
            gInputEngine.actions[action] = true;
        }

        var action = gInputEngine.bindings[190];
        if (action) {
            gInputEngine.actions[action] = false;

            var listeners = gInputEngine.listeners[action];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    listener();
                }
            }
        }
        return false;
    },

	onKeyDown: function(event1) {
        var action = gInputEngine.bindings[event1.detail.value];
		//console.log("%d",parseInt(event1.detail.value));
        if (action) {
            gInputEngine.actions[action] = true;
            event1.preventDefault();
        }
        return false;
    },

    onKeyUp: function(event2) {
        var action = gInputEngine.bindings[event2.detail.value];
        if (action) {
            gInputEngine.actions[action] = false;

            var listeners = gInputEngine.listeners[action];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    listener();
                }
            }
            event2.preventDefault();
        }
        return false;
    },
	
    /*onKeyDown: function(event) {
        var action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = true;
            event.preventDefault();
        }
        return false;
    },

    onKeyUp: function(event) {
        var action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = false;

            var listeners = gInputEngine.listeners[action];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    listener();
                }
            }
            event.preventDefault();
        }
        return false;
    },*/

    /**
     * The bind function takes an ASCII keycode and a string representing
     * the action to take when that key is pressed.
     */
    bind: function(key, action) {
        this.bindings[key] = action;
    },

    addListener: function(action, listener) {
        this.listeners[action] = this.listeners[action] || new Array();
        this.listeners[action].push(listener);
    },

    removeAllListeners: function() {
        this.listeners = [];
    }
});

gInputEngine = new InputEngine();