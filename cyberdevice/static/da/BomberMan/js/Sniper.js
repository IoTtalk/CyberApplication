Sniper = Entity.extend({
  id: 0,

  /**
   * Moving speed
   */
  velocity: 2,

  /**
   * Max number of bombs user can spawn
   */
  bombsMax: 10,

  /**
   * How far the fire reaches when bomb explodes
   */
  bombStrength: 10,

  /**
   * Entity position on map grid
   */
  position: {},

  /**
   * Bitmap dimensions
   */
  size: {
      w: 48,
      h: 48
  },

  /**
   * Bitmap animation
   */
  bmp: null,

  alive: false,

  bombs: [],

  controls: {
      'up': 'up',
      'left': 'left',
      'down': 'down',
      'right': 'right',
      'bomb': 'bomb'
  },

  /**
   * Bomb that player can escape from even when there is a collision
   */
  escapeBomb: null,

  deadTimer: 0,

  init: function(position, controls, id) {
      if (id) {
          this.id = id;
      }

      if (controls) {
          this.controls = controls;
      }

      var img = gGameEngine.sniper;

      var spriteSheet = new createjs.SpriteSheet({
          images: [img],
          frames: { width: this.size.w, height: this.size.h, regX: 10, regY: 12 },
          animations: {
              idle: [0, 0, 'idle'],
              down: [0, 0, 'down', 0.1],
              left: [0, 0, 'left', 0.1],
              up: [0, 0, 'up', 0.1],
              right: [0, 0, 'right', 0.1],
              dead: [0, 0, 'dead', 0.1]
          }
      });
      this.bmp = new createjs.Sprite(spriteSheet);

      this.position = position;
      var pixels = Utils.convertToBitmapPosition(position);
      this.bmp.x = pixels.x;
      this.bmp.y = pixels.y;

      gGameEngine.stage.addChild(this.bmp);

      this.bombs = [];
      this.setBombsListener();
  },

  setBombsListener: function() {
      // Subscribe to bombs spawning
      if (!(this instanceof Bot)) {
          var that = this;
          gInputEngine.addListener(this.controls.bomb, function() {
              // Check whether there is already bomb on this position
              for (var i = 0; i < gGameEngine.bombs.length; i++) {
                  var bomb = gGameEngine.bombs[i];
                  if (Utils.comparePositions(bomb.position, that.position)) {
                      return;
                  }
              }

              var unexplodedBombs = 0;
              for (var i = 0; i < that.bombs.length; i++) {
                  if (!that.bombs[i].exploded) {
                      unexplodedBombs++;
                  }
              }

              if (unexplodedBombs < that.bombsMax) {
                  var bomb = new Bomb(that.position, that.bombStrength);
                  gGameEngine.stage.addChild(bomb.bmp);
                  that.bombs.push(bomb);
                  gGameEngine.bombs.push(bomb);

                  bomb.setExplodeListener(function() {
                      Utils.removeFromArray(that.bombs, bomb);
                  });
              }
          });
      }
  },

  update: function() {
      if (gGameEngine.menu.visible) {
          return;
      }
      var position = { x: this.bmp.x, y: this.bmp.y };

      var dirX = 0;
      var dirY = 0;
      if (gInputEngine.actions[this.controls.up]) {
          this.animate('up');
          position.y -= this.velocity;
          dirY = -1;
      } else if (gInputEngine.actions[this.controls.down]) {
          this.animate('down');
          position.y += this.velocity;
          dirY = 1;
      } else if (gInputEngine.actions[this.controls.left]) {
          this.animate('left');
          position.x -= this.velocity;
          dirX = -1;
      } else if (gInputEngine.actions[this.controls.right]) {
          this.animate('right');
          position.x += this.velocity;
          dirX = 1;
      } else {
          this.animate('idle');
      }

      if (position.x != this.bmp.x || position.y != this.bmp.y) {
         
        this.bmp.x = position.x;
        this.bmp.y = position.y;
        this.updatePosition();

      }
  },

  /**
   * Checks whether we are on corner to target position.
   * Returns position where we should move before we can go to target.
   */
  getCornerFix: function(dirX, dirY) {
      var edgeSize = 30;

      // fix position to where we should go first
      var position = {};

      // possible fix position we are going to choose from
      var pos1 = { x: this.position.x + dirY, y: this.position.y + dirX };
      var bmp1 = Utils.convertToBitmapPosition(pos1);

      var pos2 = { x: this.position.x - dirY, y: this.position.y - dirX };
      var bmp2 = Utils.convertToBitmapPosition(pos2);

      // in front of current position
      if (gGameEngine.getTileMaterial({ x: this.position.x + dirX, y: this.position.y + dirY }) == 'grass') {
          position = this.position;
      }
      // right bottom
      // left top
      else if (gGameEngine.getTileMaterial(pos1) == 'grass'
          && Math.abs(this.bmp.y - bmp1.y) < edgeSize && Math.abs(this.bmp.x - bmp1.x) < edgeSize) {
          if (gGameEngine.getTileMaterial({ x: pos1.x + dirX, y: pos1.y + dirY }) == 'grass') {
              position = pos1;
          }
      }
      // right top
      // left bottom
      else if (gGameEngine.getTileMaterial(pos2) == 'grass'
          && Math.abs(this.bmp.y - bmp2.y) < edgeSize && Math.abs(this.bmp.x - bmp2.x) < edgeSize) {
          if (gGameEngine.getTileMaterial({ x: pos2.x + dirX, y: pos2.y + dirY }) == 'grass') {
              position = pos2;
          }
      }

      if (position.x &&  gGameEngine.getTileMaterial(position) == 'grass') {
          return Utils.convertToBitmapPosition(position);
      }
  },

  /**
   * Calculates and updates entity position according to its actual bitmap position
   */
  updatePosition: function() {
      this.position = Utils.convertToEntityPosition(this.bmp);
  },

  detectFireCollision: function() {
      var bombs = gGameEngine.bombs;
      for (var i = 0; i < bombs.length; i++) {
          var bomb = bombs[i];
          for (var j = 0; j < bomb.fires.length; j++) {
              var fire = bomb.fires[j];
              var collision = bomb.exploded && fire.position.x == this.position.x && fire.position.y == this.position.y;
              if (collision) {
                  return true;
              }
          }
      }
      return false;
  },

  /**
   * Changes animation if requested animation is not already current.
   */
  animate: function(animation) {
      if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
          this.bmp.gotoAndPlay(animation);
      }
  },
});