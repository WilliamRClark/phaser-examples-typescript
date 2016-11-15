var Games;
(function (Games) {
    var Breakout;
    (function (Breakout) {
        var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });
        function preload() {
            game.load.atlas('breakout', 'assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
            game.load.image('starfield', 'assets/misc/starfield.jpg');
        }
        var ball;
        var paddle;
        var bricks;
        var ballOnPaddle = true;
        var lives = 3;
        var score = 0;
        var scoreText;
        var livesText;
        var introText;
        var s;
        function create() {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.arcade.checkCollision.down = false;
            s = game.add.tileSprite(0, 0, 800, 600, 'starfield');
            bricks = game.add.group();
            bricks.enableBody = true;
            bricks.physicsBodyType = Phaser.Physics.ARCADE;
            var brick;
            for (var y = 0; y < 4; y++) {
                for (var x = 0; x < 15; x++) {
                    brick = bricks.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_' + (y + 1) + '_1.png');
                    brick.body.bounce.set(1);
                    brick.body.immovable = true;
                }
            }
            paddle = game.add.sprite(game.world.centerX, 500, 'breakout', 'paddle_big.png');
            paddle.anchor.setTo(0.5, 0.5);
            game.physics.enable(paddle, Phaser.Physics.ARCADE);
            paddle.body.collideWorldBounds = true;
            paddle.body.bounce.set(1);
            paddle.body.immovable = true;
            ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
            ball.anchor.set(0.5);
            ball.checkWorldBounds = true;
            game.physics.enable(ball, Phaser.Physics.ARCADE);
            ball.body.collideWorldBounds = true;
            ball.body.bounce.set(1);
            ball.animations.add('spin', ['ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png'], 50, true, false);
            ball.events.onOutOfBounds.add(ballLost, this);
            scoreText = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
            livesText = game.add.text(680, 550, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
            introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
            introText.anchor.setTo(0.5, 0.5);
            game.input.onDown.add(releaseBall, this);
        }
        function update() {
            paddle.x = game.input.x;
            if (paddle.x < 24) {
                paddle.x = 24;
            }
            else if (paddle.x > game.width - 24) {
                paddle.x = game.width - 24;
            }
            if (ballOnPaddle) {
                ball.body.x = paddle.x;
            }
            else {
                game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
                game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
            }
        }
        function releaseBall() {
            if (ballOnPaddle) {
                ballOnPaddle = false;
                ball.body.velocity.y = -300;
                ball.body.velocity.x = -75;
                ball.animations.play('spin');
                introText.visible = false;
            }
        }
        function ballLost() {
            lives--;
            livesText.text = 'lives: ' + lives;
            if (lives === 0) {
                gameOver();
            }
            else {
                ballOnPaddle = true;
                ball.reset(paddle.body.x + 16, paddle.y - 16);
                ball.animations.stop();
            }
        }
        function gameOver() {
            ball.body.velocity.setTo(0, 0);
            introText.text = 'Game Over!';
            introText.visible = true;
        }
        function ballHitBrick(_ball, _brick) {
            _brick.kill();
            score += 10;
            scoreText.text = 'score: ' + score;
            if (bricks.countLiving() == 0) {
                score += 1000;
                scoreText.text = 'score: ' + score;
                introText.text = '- Next Level -';
                ballOnPaddle = true;
                ball.body.velocity.set(0);
                ball.x = paddle.x + 16;
                ball.y = paddle.y - 16;
                ball.animations.stop();
                bricks.callAll('revive');
            }
        }
        function ballHitPaddle(_ball, _paddle) {
            var diff = 0;
            if (_ball.x < _paddle.x) {
                diff = _paddle.x - _ball.x;
                _ball.body.velocity.x = (-10 * diff);
            }
            else if (_ball.x > _paddle.x) {
                diff = _ball.x - _paddle.x;
                _ball.body.velocity.x = (10 * diff);
            }
            else {
                _ball.body.velocity.x = 2 + Math.random() * 8;
            }
        }
    })(Breakout || (Breakout = {}));
})(Games || (Games = {}));
