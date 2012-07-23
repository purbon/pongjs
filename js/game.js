(function() {
  Player = function(ctx, x, mode) {
    this.mode = mode ? mode : 'manual';
    this.ctx  = ctx;
    this.x    = x;
    this.y    = 200;
    this.size = 20;
    this.score = 0;
    this.color = "red";
    this.ctx.fillStyle= this.color;
    this.ctx.fillRect(this.x,this.y,this.size,130);
    if (this.mode == 'manual') {
      document.onkeydown = this.key_event;
    } else if (this.mode == 'automatic') {
      this.set_automatic_mode();
    }
  };

  Player.prototype.set_automatic_mode = function() {
    var me = this;
    setInterval(function() {
        var min = me.y;
        var max = me.y+130;
        var steps = Math.floor(Math.random()*3);
        if (game.ball.y>max) {
          me.move(7+steps);
        } else if (game.ball.y<min) {
          me.move(-7-steps);
        }
    }, 13-Math.floor(Math.random()*3));
  };

  Player.prototype.move = function(up) {
    var game = window.game;
    var size = game.size();

    if (this.y < 10) {
      this.y = 11;
      return;
    }
    else if (this.y > size['height']-145) {
      this.y = size['height']-145;
      return;
    }
    this.ctx.clearRect(this.x, this.y-11, this.size, 151);
    this.y = this.y + up;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.size, 130);
  }

  Player.prototype.key_event = function(e) {
    var game = window.game;
    if (e.keyCode == 40) {
      game.playerA.move(+10);
    } else if (e.keyCode == 38) {
      game.playerA.move(-10);
    }
  };
}());

(function() {
  Ball = function(ctx) {
    this.ctx = ctx;
    this.x     = 350;
    this.y     = 300;
    this.signx = 1;
    this.signy = 0;
    this.intervalId = -1;
    this.paint();
  };

  Ball.prototype.set = function(x,y) {
    this.x = x;
    this.y = y;
  }

  Ball.prototype.move = function() {
    var game = window.game;
    var me = game.ball;
    this.intervalId = setInterval(function() {
      me.clear();
      var size = game.size();
      if (me.x == size['width']-10) {
        var min = game.playerB.y;
        var max = game.playerB.y+130;
        if (me.y>max || me.y<min) {
          game.score('A');
          game.restart();
          clearInterval(me.intervalId);
        } else {
          me.signx = -1;
          me.signy = me.yorder();
        }
      } else if (me.x == 26) {
        var min = game.playerA.y;
        var max = game.playerA.y+130;
        if (me.y>max || me.y<min) {
          game.score('B');
          game.restart();
          clearInterval(me.intervalId);
        } else {
          me.signx = 1;
          me.signy = me.yorder();
        }
      }
      if (me.y == 5) {
        me.signy = 1;
      } else if (me.y == size['height']-10) {
        me.signy = -1;
      }
      me.x = me.x + me.signx;
      me.y = me.y + me.signy;
      me.paint();
    }, 5);
  }

  Ball.prototype.stop = function() {
   clearInterval(this.intervalId);
  }

  Ball.prototype.yorder = function() {
      var rand = Math.floor(Math.random()*3);
     if ( rand < 2 ) {
      return rand;
     }
     return -1;
  }

  Ball.prototype.paint = function() {
    this.ctx.beginPath();
    this.ctx.arc(this.x,this.y,5,0*Math.PI,2*Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle="white";
    this.ctx.fill();
    this.ctx.stroke();
  };

  Ball.prototype.clear = function() {
    var me = this;
    me.ctx.beginPath();
    me.ctx.clearRect(me.x-6, me.y-6, 12, 12);
    me.ctx.closePath();
  };
}());

(function() {

  var playerA = undefined;
  var playerB = undefined;
  var started = false;

  Game = function() {
    this.width = 800,
    this.height = 580;
    this.started = false;
    var c=document.getElementById("game");
    this.ctx=c.getContext("2d");
    this.players();
    this.ball();
    document.onkeypress = function(e) {
      var me = window.game;
      if (e.keyCode == 32) {
        (me.started ? me.pause() : me.start());
      }
    };
  };

  Game.prototype.size = function() {
    return { width: this.width, height: this.height };
  };

  Game.prototype.start = function() {
    startButton = document.getElementById('start');
    startButton.textContent = 'Pause';
    this.ball.move();
    this.started = true;
  }

  Game.prototype.pause = function () {
    startButton = document.getElementById('start');
    startButton.textContent = 'Start';
    this.ball.stop();
    this.started = false;
  }

  Game.prototype.restart = function() {
    this.ball.clear();
    this.ball.set(350,300);
    this.ball.paint();
    this.pause();
  };

  Game.prototype.players = function() {
    this.playerA = new Player(this.ctx, 0, 'manual');
    this.playerB = new Player(this.ctx, 800, 'automatic');
  };

  Game.prototype.ball = function() {
    this.ball = new Ball(this.ctx);
  };

  Game.prototype.score = function(player) {
    if (player == 'A') {
      this.playerA.score += 1;
    } else if (player == 'B') {
      this.playerB.score += 1;
    }
    var panel = document.getElementById('score');
    panel.innerHTML = 'A: '+this.get_score('A')+" - B:"+this.get_score('B');
  }

  Game.prototype.get_score = function(player) {
    return (player == 'A' ? this.playerA.score : this.playerB.score);
  }
}());

window.game = new Game();

startButton = document.getElementById('start');
startButton.onclick = function() {
  if (!game.started) {
    game.start();
  } else {
    game.pause();
  }
}
