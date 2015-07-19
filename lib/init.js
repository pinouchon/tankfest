function mod(n, m) {
    return ((n % m) + m) % m;
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
    game.load.image('logo', 'assets/logo.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    game.load.spritesheet('powerBar01', 'assets/custom/power_bar_01.png', 56, 56, 14);

}

var land;

var shadow;
var tank;
var turret;
var powerBar;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var logo;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;
var nextFire2 = 0;

var shields = {};
shields[0] = {};
shields[0].energy = 0;
shields[0].nextRegen = 0;
shields[0].regenRate = 50;

function create() {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-1000, -1000, 2000, 2000);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;

    //  The base of our tank
    tank = game.add.sprite(0, 0, 'tank', 'tank1');
    tank.anchor.setTo(0.5, 0.5);
    tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);


    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    turret = game.add.sprite(0, 0, 'tank', 'turret');
    turret.anchor.setTo(0.3, 0.5);

    powerBar = game.add.sprite(0, 0, 'powerBar01');
    powerBar.scale.setTo(2, 2);
    powerBar.anchor.setTo(0.5, 0.5);
//    powerBar.frame = 0;

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');

    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 20;
    enemiesAlive = 20;

    for (var i = 0; i < enemiesTotal; i++) {
        enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    }

    //  A shadow below our tank
    shadow = game.add.sprite(0, 0, 'tank', 'shadow');
    shadow.anchor.setTo(0.5, 0.5);

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(300, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++) {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    powerBar.bringToTop();
    tank.bringToTop();
    turret.bringToTop();

    logo = game.add.sprite(0, 200, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(450, 350, 0, 0);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

}

function removeLogo() {

    game.input.onDown.remove(removeLogo, this);
    logo.kill();

}

function update() {

    game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);

    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].alive) {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }
//
    var speed = 200;
    tank.body.velocity.x = 0;
    tank.body.velocity.y = 0;

//    game.input.keyboard.onDownCallback = function(e) {
//        console.log(e.keyCode);
//    };

//    if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
//        tank.body.velocity.x = -speed;
//    }
//    if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
//        tank.body.velocity.x = speed;
//    }
//    if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
//        tank.body.velocity.y = -speed;
//    }
//    if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
//        tank.body.velocity.y = speed;
//    }

    if (cursors.up.isDown) {
        //  The speed we'll travel at
//        currentSpeed = 300;
    } else {
//        if (currentSpeed > 0) {
//            currentSpeed -= 4;
//        }
    }

//    if (currentSpeed > 0) {
    currentSpeed = 200;
//    console.log(tank.x, tank.y, currentSpeed, game.physics.arcade.angleToPointer(turret))
    if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
//        tank.body.velocity.y = speed;
//        tank.rotation =  mod(game.physics.arcade.angleToPointer(turret) + (Math.PI), 2 * Math.PI);
    } else {
//        tank.rotation = game.physics.arcade.angleToPointer(turret);
    }

        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
//    }

//    tank.rotation = game.physics.arcade.angleToPointer(turret);
//    tank.body.velocity.x = -150;


    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;
    powerBar.x = tank.x;
    powerBar.y = tank.y;

    turret.rotation = game.physics.arcade.angleToPointer(turret);

    regenShields();
    powerBar.frame = 14 - Math.floor(shields[0].energy * (14 / 100));

    if (game.input.activePointer.isDown) {
        //  Boom!
        fire();
    } else {
        tank.rotation = game.physics.arcade.angleToPointer(turret);
    }

}

function bulletHitPlayer(tank, bullet) {

    bullet.kill();

}

function bulletHitEnemy(tank, bullet) {

    bullet.kill();

    var destroyed = enemies[tank.name].damage();

    if (destroyed) {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }

}

function regenShields() {
    console.log(shields[0].energy);
    if (game.time.now > shields[0].nextRegen && shields[0].energy < 100) {
        shields[0].nextRegen = game.time.now + shields[0].regenRate;
        shields[0].energy += 1;
    }
}

function fire() {

    if (game.time.now > nextFire && bullets.countDead() > 0 && shields[0].energy > 10) {
        nextFire = game.time.now + fireRate;
        nextFire2 = game.time.now + (fireRate / 4);

        shields[0].energy -= 10;
        if (shields[0].energy < 0) shields[0].energy = 0;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
    }

    if (game.time.now > nextFire2 && game.time.now < nextFire) {
        tank.rotation =  mod(game.physics.arcade.angleToPointer(turret) + (Math.PI), 2 * Math.PI);
    } else {
        tank.rotation = game.physics.arcade.angleToPointer(turret);

    }
}

function render() {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);

}