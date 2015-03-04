var snakeHead;
var snakeSection = new Array();
var snakePath = new Array();
var numSnakeSections = 30;
var snakeSpacer = 6;
var game = new Phaser.Game(800, 600, Phaser.CANVAS, "phaser-example", {
    preload: function () { return game.load.image("ball", "assets/sprites/shinyball.png"); },
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 800, 600);
        cursors = game.input.keyboard.createCursorKeys();
        snakeHead = game.add.sprite(400, 300, "ball");
        snakeHead.anchor.setTo(0.5, 0.5);
        game.physics.enable(snakeHead, Phaser.Physics.ARCADE);
        for (var i = 1; i <= numSnakeSections - 1; i++) {
            snakeSection[i] = game.add.sprite(400, 300, "ball");
            snakeSection[i].anchor.setTo(0.5, 0.5);
        }
        for (var i = 0; i <= numSnakeSections * snakeSpacer; i++) {
            snakePath[i] = new Phaser.Point(400, 300);
        }
    },
    update: function () {
        snakeHead.body.velocity.setTo(0, 0);
        snakeHead.body.angularVelocity = 0;
        if (cursors.up.isDown) {
            snakeHead.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(snakeHead.angle, 300));
            var part = snakePath.pop();
            part.setTo(snakeHead.x, snakeHead.y);
            snakePath.unshift(part);
            for (var i = 1; i <= numSnakeSections - 1; i++) {
                snakeSection[i].x = (snakePath[i * snakeSpacer]).x;
                snakeSection[i].y = (snakePath[i * snakeSpacer]).y;
            }
        }
        if (cursors.left.isDown) {
            snakeHead.body.angularVelocity = -300;
        }
        else if (cursors.right.isDown) {
            snakeHead.body.angularVelocity = 300;
        }
    },
    render: function () { return game.debug.spriteInfo(snakeHead, 32, 32); }
});
