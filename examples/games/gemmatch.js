var Games;
(function (Games) {
    var GemMatch;
    (function (GemMatch) {
        var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create });
        var GEM_SIZE = 64;
        var GEM_SPACING = 2;
        var GEM_SIZE_SPACED = GEM_SIZE + GEM_SPACING;
        var BOARD_COLS;
        var BOARD_ROWS;
        var MATCH_MIN = 3;
        var gems;
        var selectedGem = null;
        var selectedGemStartPos;
        var selectedGemTween;
        var tempShiftedGem = null;
        var tempShiftedGemTween;
        var allowInput;
        function preload() {
            game.load.spritesheet("GEMS", "assets/sprites/diamonds32x5.png", GEM_SIZE, GEM_SIZE);
        }
        function create() {
            spawnBoard();
            selectedGemStartPos = { x: 0, y: 0 };
            allowInput = true;
            game.input.addMoveCallback(slideGem, this);
        }
        function releaseGem(selectedGem) {
            console.log('up from', selectedGem);
            checkAndKillGemMatches(selectedGem);
            if (tempShiftedGem !== null) {
                checkAndKillGemMatches(tempShiftedGem);
            }
            removeKilledGems();
            var dropGemDuration = dropGems();
            game.time.events.add(dropGemDuration * 100, refillBoard);
            allowInput = false;
            selectedGem = null;
            tempShiftedGem = null;
        }
        function slideGem(pointer, x, y, fromClick) {
            if (selectedGem && pointer.isDown) {
                var cursorGemPosX = getGemPos(x);
                var cursorGemPosY = getGemPos(y);
                if (checkIfGemCanBeMovedHere(selectedGemStartPos.x, selectedGemStartPos.y, cursorGemPosX, cursorGemPosY)) {
                    if (cursorGemPosX !== selectedGem.posX || cursorGemPosY !== selectedGem.posY) {
                        if (selectedGemTween !== null) {
                            game.tweens.remove(selectedGemTween);
                        }
                        selectedGemTween = tweenGemPos(selectedGem, cursorGemPosX, cursorGemPosY);
                        gems.bringToTop(selectedGem);
                        if (tempShiftedGem !== null) {
                            tweenGemPos(tempShiftedGem, selectedGem.posX, selectedGem.posY);
                            swapGemPosition(selectedGem, tempShiftedGem);
                        }
                        tempShiftedGem = getGem(cursorGemPosX, cursorGemPosY);
                        if (tempShiftedGem === selectedGem) {
                            tempShiftedGem = null;
                        }
                        else {
                            tweenGemPos(tempShiftedGem, selectedGem.posX, selectedGem.posY);
                            swapGemPosition(selectedGem, tempShiftedGem);
                        }
                    }
                }
            }
        }
        function spawnBoard() {
            BOARD_COLS = Math.floor(game.world.width / GEM_SIZE_SPACED);
            BOARD_ROWS = Math.floor(game.world.height / GEM_SIZE_SPACED);
            gems = game.add.group();
            for (var i = 0; i < BOARD_COLS; i++) {
                for (var j = 0; j < BOARD_ROWS; j++) {
                    var gem = gems.create(i * GEM_SIZE_SPACED, j * GEM_SIZE_SPACED, "GEMS");
                    gem.name = 'gem' + i.toString() + 'x' + j.toString();
                    gem.inputEnabled = true;
                    gem.events.onInputDown.add(selectGem, this);
                    gem.events.onInputUp.add(releaseGem, this);
                    randomizeGemColor(gem);
                    setGemPos(gem, i, j);
                }
            }
        }
        function selectGem(gem, pointer) {
            if (allowInput) {
                console.log('selectedGem', gem);
                selectedGem = gem;
                selectedGemStartPos.x = gem.posX;
                selectedGemStartPos.y = gem.posY;
            }
        }
        function getGem(posX, posY) {
            return gems.iterate("id", calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);
        }
        function getGemPos(coordinate) {
            return Math.floor(coordinate / GEM_SIZE_SPACED);
        }
        function setGemPos(gem, posX, posY) {
            gem.posX = posX;
            gem.posY = posY;
            gem.id = calcGemId(posX, posY);
        }
        function calcGemId(posX, posY) {
            return posX + posY * BOARD_COLS;
        }
        function getGemColor(gem) {
            return gem.frame;
        }
        function randomizeGemColor(gem) {
            gem.frame = game.rnd.integerInRange(0, gem.animations.frameTotal - 1);
        }
        function checkIfGemCanBeMovedHere(fromPosX, fromPosY, toPosX, toPosY) {
            if (toPosX < 0 || toPosX >= BOARD_COLS || toPosY < 0 || toPosY >= BOARD_ROWS) {
                return false;
            }
            if (fromPosX === toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1) {
                return true;
            }
            if (fromPosY === toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1) {
                return true;
            }
            return false;
        }
        function countSameColorGems(startGem, moveX, moveY) {
            var curX = startGem.posX + moveX;
            var curY = startGem.posY + moveY;
            var count = 0;
            while (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS && getGemColor(getGem(curX, curY)) === getGemColor(startGem)) {
                count++;
                curX += moveX;
                curY += moveY;
            }
            return count;
        }
        function swapGemPosition(gem1, gem2) {
            var tempPosX = gem1.posX;
            var tempPosY = gem1.posY;
            setGemPos(gem1, gem2.posX, gem2.posY);
            setGemPos(gem2, tempPosX, tempPosY);
        }
        function checkAndKillGemMatches(gem) {
            if (gem !== null) {
                var countUp = countSameColorGems(gem, 0, -1);
                var countDown = countSameColorGems(gem, 0, 1);
                var countLeft = countSameColorGems(gem, -1, 0);
                var countRight = countSameColorGems(gem, 1, 0);
                var countHoriz = countLeft + countRight + 1;
                var countVert = countUp + countDown + 1;
                if (countVert >= MATCH_MIN) {
                    killGemRange(gem.posX, gem.posY - countUp, gem.posX, gem.posY + countDown);
                }
                if (countHoriz >= MATCH_MIN) {
                    killGemRange(gem.posX - countLeft, gem.posY, gem.posX + countRight, gem.posY);
                }
                if (countVert < MATCH_MIN && countHoriz < MATCH_MIN) {
                    if (gem.posX !== selectedGemStartPos.x || gem.posY !== selectedGemStartPos.y) {
                        if (selectedGemTween !== null) {
                            game.tweens.remove(selectedGemTween);
                        }
                        selectedGemTween = tweenGemPos(gem, selectedGemStartPos.x, selectedGemStartPos.y);
                        if (tempShiftedGem !== null) {
                            tweenGemPos(tempShiftedGem, gem.posX, gem.posY);
                        }
                        swapGemPosition(gem, tempShiftedGem);
                    }
                }
            }
        }
        function killGemRange(fromX, fromY, toX, toY) {
            fromX = Phaser.Math.clamp(fromX, 0, BOARD_COLS - 1);
            fromY = Phaser.Math.clamp(fromY, 0, BOARD_ROWS - 1);
            toX = Phaser.Math.clamp(toX, 0, BOARD_COLS - 1);
            toY = Phaser.Math.clamp(toY, 0, BOARD_ROWS - 1);
            for (var i = fromX; i <= toX; i++) {
                for (var j = fromY; j <= toY; j++) {
                    var gem = getGem(i, j);
                    gem.kill();
                }
            }
        }
        function removeKilledGems() {
            gems.forEach(function (gem) {
                if (!gem.alive) {
                    setGemPos(gem, -1, -1);
                }
            });
        }
        function tweenGemPos(gem, newPosX, newPosY, durationMultiplier) {
            if (durationMultiplier === null || typeof durationMultiplier === 'undefined') {
                durationMultiplier = 1;
            }
            return game.add.tween(gem).to({ x: newPosX * GEM_SIZE_SPACED, y: newPosY * GEM_SIZE_SPACED }, 100 * durationMultiplier, Phaser.Easing.Linear.None, true);
        }
        function dropGems() {
            var dropRowCountMax = 0;
            for (var i = 0; i < BOARD_COLS; i++) {
                var dropRowCount = 0;
                for (var j = BOARD_ROWS - 1; j >= 0; j--) {
                    var gem = getGem(i, j);
                    if (gem === null) {
                        dropRowCount++;
                    }
                    else if (dropRowCount > 0) {
                        setGemPos(gem, gem.posX, gem.posY + dropRowCount);
                        tweenGemPos(gem, gem.posX, gem.posY, dropRowCount);
                    }
                }
                dropRowCountMax = Math.max(dropRowCount, dropRowCountMax);
            }
            return dropRowCountMax;
        }
        function refillBoard() {
            var maxGemsMissingFromCol = 0;
            for (var i = 0; i < BOARD_COLS; i++) {
                var gemsMissingFromCol = 0;
                for (var j = BOARD_ROWS - 1; j >= 0; j--) {
                    var gem = getGem(i, j);
                    if (gem === null) {
                        gemsMissingFromCol++;
                        gem = gems.getFirstDead();
                        gem.reset(i * GEM_SIZE_SPACED, -gemsMissingFromCol * GEM_SIZE_SPACED);
                        randomizeGemColor(gem);
                        setGemPos(gem, i, j);
                        tweenGemPos(gem, gem.posX, gem.posY, gemsMissingFromCol * 2);
                    }
                }
                maxGemsMissingFromCol = Math.max(maxGemsMissingFromCol, gemsMissingFromCol);
            }
            game.time.events.add(maxGemsMissingFromCol * 2 * 100, boardRefilled);
        }
        function boardRefilled() {
            allowInput = true;
        }
    })(GemMatch || (GemMatch = {}));
})(Games || (Games = {}));
