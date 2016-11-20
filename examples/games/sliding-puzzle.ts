namespace Games {
namespace SlidingPuzzle {

    var game : Phaser.Game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create });

    var PIECE_WIDTH : number = 200;
    var PIECE_HEIGHT : number = 200;
    var BOARD_COLS : number;
    var BOARD_ROWS : number;

    var piecesGroup : Phaser.Group;
    var piecesAmount : number;
    var shuffledIndexArray = [];

    function preload() {
        game.load.spritesheet("background", "assets/games/sliding-puzzle/bl.jpg", PIECE_WIDTH, PIECE_HEIGHT);
    }

    function create() {
        prepareBoard();
    }

    function prepareBoard() {

        var piecesIndex : number = 0;
        var i : number;
        var j : number;
        var piece;

        BOARD_COLS = Math.floor(game.world.width / PIECE_WIDTH);
        BOARD_ROWS = Math.floor(game.world.height / PIECE_HEIGHT);

        piecesAmount = BOARD_COLS * BOARD_ROWS;

        shuffledIndexArray = createShuffledIndexArray();

        piecesGroup = game.add.group();

        for (var i : number = 0; i < BOARD_ROWS; i++)
        {
            for (var j : number = 0; j < BOARD_COLS; j++)
            {
                if (shuffledIndexArray[piecesIndex]) {
                    piece = piecesGroup.create(j * PIECE_WIDTH, i * PIECE_HEIGHT, "background", shuffledIndexArray[piecesIndex]);
                }
                else { //initial position of black piece
                    piece = piecesGroup.create(j * PIECE_WIDTH, i * PIECE_HEIGHT);
                    piece.black = true;
                }
                piece.name = 'piece' + i.toString() + 'x' + j.toString();
                piece.currentIndex = piecesIndex;
                piece.destIndex = shuffledIndexArray[piecesIndex];
                piece.inputEnabled = true;
                piece.events.onInputDown.add(selectPiece, this);
                piece.posX = j;
                piece.posY = i;
                piecesIndex++;
            }
        }

    }

    function selectPiece(piece) {

        var blackPiece = canMove(piece);

        //if there is a black piece in neighborhood
        if (blackPiece) {
            movePiece(piece, blackPiece);
        }

    }

    function canMove(piece) {

        var foundBlackElem : any = false;

        piecesGroup.children.forEach(function(element : any) {
            if (element.posX === (piece.posX - 1) && element.posY === piece.posY && element.black ||
                element.posX === (piece.posX + 1) && element.posY === piece.posY && element.black ||
                element.posY === (piece.posY - 1) && element.posX === piece.posX && element.black ||
                element.posY === (piece.posY + 1) && element.posX === piece.posX && element.black) {
                foundBlackElem = element;
                return;
            }
        });

        return foundBlackElem;
    }

    function movePiece(piece, blackPiece) {

        var tmpPiece = {
            posX: piece.posX,
            posY: piece.posY,
            currentIndex: piece.currentIndex
        };

        game.add.tween(piece).to({x: blackPiece.posX * PIECE_WIDTH, y: blackPiece.posY * PIECE_HEIGHT}, 300, Phaser.Easing.Linear.None, true);

        //change places of piece and blackPiece
        piece.posX = blackPiece.posX;
        piece.posY = blackPiece.posY;
        piece.currentIndex = blackPiece.currentIndex;
        piece.name ='piece' + piece.posX.toString() + 'x' + piece.posY.toString();

        //piece is the new black
        blackPiece.posX = tmpPiece.posX;
        blackPiece.posY = tmpPiece.posY;
        blackPiece.currentIndex = tmpPiece.currentIndex;
        blackPiece.name ='piece' + blackPiece.posX.toString() + 'x' + blackPiece.posY.toString();

        //after every move check if puzzle is completed
        checkIfFinished();
    }

    function checkIfFinished() {

        var isFinished : boolean = true;

        piecesGroup.children.forEach(function(element : any) {
            if (element.currentIndex !== element.destIndex) {
                isFinished = false;
                return;
            }
        });

        if (isFinished) {
            showFinishedText();
        }

    }

    function showFinishedText() {

        var style = { font: "40px Arial", fill: "#000", align: "center"};

        var text = game.add.text(game.world.centerX, game.world.centerY, "Congratulations! \nYou made it!", style);

        text.anchor.set(0.5);

    }

    function createShuffledIndexArray() {

        var indexArray = [];

        for (var i: number = 0; i < piecesAmount; i++)
        {
            indexArray.push(i);
        }

        return shuffle(indexArray);

    }

    function shuffle(array : any[]) {

        var counter : number = array.length;
        var temp;
        var index : number;

        while (counter > 0)
        {
            index = Math.floor(Math.random() * counter);

            counter--;

            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
        
    }

}
}