namespace Games {
namespace GemMatch {

    var fx: Phaser.Sound;
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

    function preload() {

        game.load.image('bullet', 'assets/games/invaders/bullet.png');
        game.load.image('enemyBullet', 'assets/games/invaders/enemy-bullet.png');
        game.load.spritesheet('invader', 'assets/games/invaders/invader32x32x4.png', 32, 32);
        game.load.image('ship', 'assets/games/invaders/player.png');
        game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
        game.load.image('starfield', 'assets/games/invaders/starfield.png');
        game.load.image('background', 'assets/games/starstruck/background2.png');

        // Load audio.
        game.load.audio("sfx", "assets/audio/SoundEffects/fx_mixdown.ogg");
    }

    var player : Phaser.Sprite;
    var aliens : Phaser.Group;
    var bullets : Phaser.Group;
    var enemyBullets : Phaser.Group;
    var bulletTime : number = 0;
    var cursors : Phaser.CursorKeys;
    var fireButton : Phaser.Key;
    var explosions : Phaser.Group;
    var starfield : Phaser.TileSprite;
    var score : number = 0;
    var scoreString : string = '';
    var scoreText : Phaser.Text;
    var lives : Phaser.Group;
    var enemyBullet : Phaser.Sprite;
    var firingTimer : number = 0;
    var stateText : Phaser.Text;
    var livingEnemies = [];

    function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  The scrolling starfield background
        starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

        //  Our bullet group
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

        // The enemy's bullets
        enemyBullets = game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(30, 'enemyBullet');
        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 1);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('checkWorldBounds', true);

        //  The hero!
        player = game.add.sprite(400, 500, 'ship');
        player.anchor.setTo(0.5, 0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);

        //  The baddies!
        aliens = game.add.group();
        aliens.enableBody = true;
        aliens.physicsBodyType = Phaser.Physics.ARCADE;

        createAliens();
        createSounds();

        //  The score
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

        //  Lives
        lives = game.add.group();
        game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

        //  Text
        stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;

        for (var i = 0; i < 3; i++) 
        {
            var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
            ship.anchor.setTo(0.5, 0.5);
            ship.angle = 90;
            ship.alpha = 0.4;
        }

        //  An explosion pool
        explosions = game.add.group();
        explosions.createMultiple(30, 'kaboom');
        explosions.forEach(setupInvader, this);

        //  And some controls to play the game with
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
    }

    function createAliens () {

        for (var y : number = 0; y < 4; y++)
        {
            for (var x : number  = 0; x < 10; x++)
            {
                var alien : Phaser.Sprite = aliens.create(x * 48, y * 50, 'invader');
                alien.anchor.setTo(0.5, 0.5);
                alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
                alien.play('fly');
                alien.body.moves = false;
            }
        }

        aliens.x = 100;
        aliens.y = 50;

        //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
        var tween : Phaser.Tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        //  When the tween loops it calls descend
        tween.onLoop.add(descend, this);
    }

    function createSounds() {
        //  Here we set-up our audio sprite
        fx = game.add.audio("sfx");
        fx.allowMultiple = true;

        //  And this defines the markers.
        //  They consist of a key (for replaying), the time the sound starts and the duration, both given in seconds.
        //  You can also set the volume and loop state, although we don"t use them in this example (see the docs)
        fx.addMarker("alien death", 1, 1.0);
        fx.addMarker("boss hit", 3, 0.5);
        fx.addMarker("escape", 4, 3.2);
        fx.addMarker("meow", 8, 0.5);
        fx.addMarker("numkey", 9, 0.1);
        fx.addMarker("ping", 10, 1.0);
        fx.addMarker("death", 12, 4.2);
        fx.addMarker("shot", 17, 1.0);
        fx.addMarker("squit", 19, 0.3);
    }


    function setupInvader (invader) {

        invader.anchor.x = 0.5;
        invader.anchor.y = 0.5;
        invader.animations.add('kaboom');

    }

    function descend() {

        aliens.y += 10;

    }

    function update() {

        //  Scroll the background
        starfield.tilePosition.y += 2;

        if (player.alive)
        {
            //  Reset the player, then check for movement keys
            player.body.velocity.setTo(0, 0);

            if (cursors.left.isDown)
            {
                player.body.velocity.x = -200;
            }
            else if (cursors.right.isDown)
            {
                player.body.velocity.x = 200;
            }

            //  Firing?
            if (fireButton.isDown)
            {
                fireBullet();
            }

            if (game.time.now > firingTimer)
            {
                enemyFires();
            }

            //  Run collision
            game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
            game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
        }

    }

    function render() {

        // for (var i = 0; i < aliens.length; i++)
        // {
        //     game.debug.body(aliens.children[i]);
        // }

    }

    function collisionHandler (bullet, alien) {

        //  When a bullet hits an alien we kill them both
        bullet.kill();
        alien.kill();

        //  Increase the score
        score += 20;
        scoreText.text = scoreString + score;

        //  And create an explosion :)
        fx.play("alien death");
        var explosion = explosions.getFirstExists(false);
        explosion.reset(alien.body.x, alien.body.y);
        explosion.play('kaboom', 30, false, true);

        if (aliens.countLiving() == 0)
        {
            score += 1000;
            scoreText.text = scoreString + score;

            enemyBullets.callAll('kill',this);
            stateText.text = " You Won, \n Click to restart";
            stateText.visible = true;
            fx.play("escape");


            //the "click to restart" handler
            game.input.onTap.addOnce(restart,this);
        }

    }

    function enemyHitsPlayer (player,bullet) {
        
        bullet.kill();

        var live = lives.getFirstAlive();

        if (live)
        {
            live.kill();
        }

        //  And create an explosion :)
        var explosion = explosions.getFirstExists(false);
        explosion.reset(player.body.x, player.body.y);
        fx.play("death");
        explosion.play('kaboom', 30, false, true);

        // When the player dies
        if (lives.countLiving() < 1)
        {
            player.kill();
            enemyBullets.callAll('kill');

            stateText.text=" GAME OVER \n Click to restart";
            stateText.visible = true;

            //the "click to restart" handler
            game.input.onTap.addOnce(restart,this);
        }

    }

    function enemyFires () {

        //  Grab the first bullet we can from the pool
        enemyBullet = enemyBullets.getFirstExists(false);

        livingEnemies.length=0;

        aliens.forEachAlive(function(alien){

            // put every living enemy in an array
            livingEnemies.push(alien);
        });


        if (enemyBullet && livingEnemies.length > 0)
        {
            
            var random : number = game.rnd.integerInRange(0,livingEnemies.length-1);

            // randomly select one of them
            var shooter=livingEnemies[random];
            // And fire the bullet from this enemy
            enemyBullet.reset(shooter.body.x, shooter.body.y);

            game.physics.arcade.moveToObject(enemyBullet,player,120);
            firingTimer = game.time.now + 2000;
        }

    }

    function fireBullet () {

        //  To avoid them being allowed to fire too fast we set a time limit
        if (game.time.now > bulletTime)
        {
            //  Grab the first bullet we can from the pool
            bullet = bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                bullet.reset(player.x, player.y + 8);
                bullet.body.velocity.y = -400;
                bulletTime = game.time.now + 200;
                fx.play("shot");

            }
        }

    }

    function resetBullet (bullet) {

        //  Called if the bullet goes out of the screen
        bullet.kill();

    }

    function restart () {

        //  A new level starts
        
        //resets the life count
        lives.callAll('revive');
        //  And brings the aliens back from the dead :)
        aliens.removeAll();
        createAliens();

        //revives the player
        player.revive();
        //hides the text
        stateText.visible = false;

    }

}
}
