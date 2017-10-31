$(document).ready(function() {
  $("body").prepend("<canvas width='500' height='500' id='canvas'></canvas>");
  var canvas = $("#canvas");
  var FPS = 30;
  var c = canvas.get(0).getContext("2d");
  var base = [
    [0, 500],
    [20, 450],
    [30, 450],
    [35, 455],
    [50, 455],
    [55, 450],
    [65, 450],
    [85, 500]
  ];
  var missiles = [];
  var missileNumber = 12;
  var points = 0;
  var bombs = [];
  var bases = [];
  var cities = [];
  var background = {
    x: 0,
    y: 480,
    color: "yellow",
    width: 500,
    height: 20,
    draw: function() {
      c.fillStyle = "black";
      c.fillRect(0, 0, 500, 500);
      c.fillStyle = this.color;
      c.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  createLevel();
  createMissiles();
  input();

  setInterval(function() {
    if (cities.length > 0) {
      update();
      $("#play").off();
      draw();
    } else {
      gameOver();
    }
    drawTitle();
  }, 1000 / FPS);

  function update() {
    c.clearRect(0, 0, 500, 500);
    //c.translate(0.5, 5);
    missiles.forEach(function(missile) {
      missile.update();
    });
    bombs.forEach(function(bomb) {
      bomb.update();
    });

    bombs = bombs.filter(function(bomb) {
      if (bomb.active) {
        return bomb;
      }
    });

    missiles = missiles.filter(function(missile) {
      if (missile.active) {
        return missile;
      }
    });

    cities = cities.filter(function(city) {
      if (city.active) {
        return city;
      }
    });

    handleCollisions();
  }

  function draw() {
    background.draw();
    cities.forEach(function(city) {
      city.draw();
    });
    drawBases();

    missiles.forEach(function(missile) {
      missile.draw();
    });

    bombs.forEach(function(bomb) {
      bomb.draw();
    });

    drawUI();
  }

  function drawTitle() {
    c.font = "50px arial";
    var gradient = c.createLinearGradient(0, 0, 50, 150);
    gradient.addColorStop(0, "rgba(8, 186, 29, 1)");
    gradient.addColorStop(1, "rgba(186, 8, 150, 1)");
    c.fillStyle = gradient;
    c.fillText("Missile Commander", 30, 40);
  }

  function drawUI() {
    c.fillStyle = "red";
    c.font = "20px Arial";
    c.fillText("Missiles: " + missileNumber, 10, 70);
    c.fillText("Cities: " + cities.length, 400, 70);
    c.fillText("Points: " + points, 210, 70);
  }

  function gameOver() {
    background.draw();
    c.fillStyle = "red";
    c.font = "30px Arial";
    c.fillText("Game Over!", canvas.width() / 2, canvas.height() / 2);
    c.fillText("Point:" + points, canvas.width() / 2, canvas.height() / 2 + 30);
    $("#play").on("click", function() {
      createLevel();
    });
  }

  function collides(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  }

  function circleCollides(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.width / 2);
    var distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.r)) {
      return false;
    }
    if (distY > (rect.height / 2 + circle.r)) {
      return false;
    }

    if (distX <= (rect.width / 2) &&
      distY <= (rect.height / 2)) {
      return true;
    }

    var dx = distX - rect.width / 2;
    var dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
  }

  function handleCollisions() {
    missiles.forEach(function(missile) {
      bombs.forEach(function(bomb) {
        if (circleCollides(bomb, missile)) {
          missile.explode();
        }
      });
    });

    bombs.forEach(function(bomb) {
      cities.forEach(function(city) {
        if (circleCollides(bomb, city)) {
          city.explode();
        }
      });
    });

    missiles.forEach(function(missile) {
      if (collides(missile, background)) {
        missile.explode();
      }
    });
  }

  function createMissiles() {
    setInterval(function() {
      missiles.push(Missile({
        width: 2,
        height: 2
      }));
    }, 3000);
  }

  function input() {
    canvas.on("click", function(e) {
      var mousePos = getMousePos(e);
      if (missileNumber > 0) {
        bombs.push(Bomb({
          x: mousePos.x,
          y: mousePos.y,
          width: 1,
          height: 1
        }));
        missileNumber--;
      }
    });
  }

  function getMousePos(e) {
    var rect = canvas.offset();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function createLevel() {
    missiles = [];
    missileNumber = 12;
    points = 0;
    bombs = [];
    bases = [];
    cities = [];
    c.fillStyle = "blue";
    for (var i = 1; i < 4; i++) {
      cities.push(City({
        x: 40 + 50 * i,
        y: 480,
        width: 20,
        height: 10
      }));

      cities.push(City({
        x: 250 + 50 * i,
        y: 480,
        width: 20,
        height: 10
      }));
    }
  }

  function drawBases() {
    c.fillStyle = "yellow";
    c.beginPath();
    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < base.length; i++) {
        c.lineTo(base[i][0] + 208 * j, base[i][1]);
      }
    }
    c.fill();
  }

  function Bomb(I) {
    I = I || {};

    I.active = true;
    I.color = "rgba(235, 30, 30, 0.79)";
    I.age = Math.floor(Math.random() * 128);
    I.radius = 0;
    I.dimish = false;
    I.interval = 0;
    I.update = function() {
      if (this.radius === 30) {
        this.dimish = true;
      }

      if (!this.dimish) {
        this.radius++;
      } else {
        this.radius--;
      }

      if (this.radius < 0) {
        this.active = false;
      }
    }

    I.draw = function() {
      if (!this.dimish) {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fill();
      } else {
        c.fillStyle = "rgba(235, 88, 30, 0.79)";
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.fill();
      }
    };
    return I;
  }

  function City(I) {
    I = I || {};
    I.active = true;

    I.color = "blue";

    I.draw = function() {
      c.fillStyle = this.color;
      c.fillRect(this.x, this.y, this.width, this.height);
    };

    I.explode = function() {
      this.active = false;
    }
    return I;
  }

  function Base(I) {
    I = I || {};
    I.width = 0;
    I.height = 0;
    I.active = true;

    I.color = "blue";

    I.draw = function() {
      c.fillStyle = this.color;
      c.fillRect(this.x, this.y, 20, 10);
    };
    return I;
  }

  function Missile(I) {
    I = I || {};
    I.positions = [];
    I.active = true;

    I.color = "green";
    I.x = Math.random() * 500;
    I.y = 0;
    I.xVelocity = (0.5 + Math.random() * 1) - 1;
    I.yVelocity = (0.5 + Math.random() * 1);

    I.update = function() {
      this.x += this.xVelocity;
      this.y += this.yVelocity;
      this.positions.push({
        x: this.x,
        y: this.y
      });

      if (this.x < 0 || this.x > canvas.width()) {
        this.active = false;
      };
    };

    I.draw = function() {
      var that = this;
      this.positions.forEach(function(position) {
        c.fillStyle = that.color;
        c.fillRect(position.x, position.y, that.width, that.height);
      });
    };

    I.explode = function() {
      this.active = false;
      points += 100;
      bombs.push(Bomb({
        x: this.x,
        y: this.y,
        width: 1,
        height: 1
      }));
    }
    return I;
  }
});
