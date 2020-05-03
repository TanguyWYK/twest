"use strict";

class Puissance4 {

    constructor(gameOptions) {
        this.difficulty = gameOptions.difficulty;
        this.gameName = gameOptions.gameName;
        this.gameId = gameOptions.gameId;
        this.round = 1;
        this.score = 0;
        this.initGame();
        this.Canvas = new Canvas(this, 3);
        this.loadEventListeners();
        this.resetView();
        this.roundTime = new Timer(0);
        this.totalTime = 0;
    }

    initGame() {
        this.board = [];
        for (let i = 0; i < 7; i++) {
            this.board.push([0, 0, 0, 0, 0, 0]);
        }
        this.status = "playing";
        this.computerTimeBusy = null;
        $("#round").text(this.round);
        $("#score").text(this.score);
    }

    loadEventListeners() {
        this.newGame_button = $(".newGame_button");
        this.newGame_button.on("click", this.newGame.bind(this));
        this.message = $(".message");
        let timerId;
        let self = this;
        window.onresize = function () {
            clearTimeout(timerId); // pour éviter de déclencher l'event plusieurs fois lors d'un même resize
            timerId = setTimeout(function () {
                self.refreshView();
            }, 200);
        };
    }

    // Dessine la vue
    resetView() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[2], this.Canvas.layerElements[2]);
        this.drawCovers();
    }

    newGame() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[1], this.Canvas.layerElements[1]);
        this.roundTime.reset(0);
        if (this.status === "playing") {
            this.score -= 200;
            this.round++;
            this.showEndRoundMessage("C'est moche d'abandonner une partie...", {x: 0, y: 0}, this);
        } else {
            this.showMessage("");
        }
        this.initGame();
    }

    addPiece(player, position, board) {
        let testPosition = 0;
        if (board[position][0] === 0) {
            while (testPosition < 6 && board[position][testPosition] === 0) {
                testPosition++;
            }
            board[position][testPosition - 1] = player;
            return {
                board: board,
                possible: true,
            };
        } else {
            return {
                board: board,
                possible: false,
            };
        }
    }

    testIfFinish(player, board) {
        // test vertical
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === player && board[i][j + 1] === player && board[i][j + 2] === player && board[i][j + 3] === player) {
                    return {
                        winner: player,
                        line: 'vertical',
                        i: i,
                        j: j,
                    };
                }
            }
        }
        // test horizontal
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 6; j++) {
                if (board[i][j] === player && board[i + 1][j] === player && board[i + 2][j] === player && board[i + 3][j] === player) {
                    return {
                        winner: player,
                        line: 'horizontal',
                        i: i,
                        j: j,
                    };
                }
            }
        }
        // test diagonale à gauche
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === player && board[i + 1][j + 1] === player && board[i + 2][j + 2] === player && board[i + 3][j + 3] === player) {
                    return {
                        winner: player,
                        line: 'diagonale gauche',
                        i: i,
                        j: j,
                    };
                }
            }
        }
        // test diagonale à droite
        for (let i = 3; i < 7; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === player && board[i - 1][j + 1] === player && board[i - 2][j + 2] === player && board[i - 3][j + 3] === player) {
                    return {
                        winner: player,
                        line: 'diagonale droite',
                        i: i,
                        j: j,
                    };
                }
            }
        }
        // test match nul
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                if (board[i][j] === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    // Affiche un message personnalisé
    showMessage(text) {
        if (text !== null) {
            this.message.fadeOut(0).fadeIn(300).html(text);
        }
    }

    // Essaye d'ajouter une pièce
    playTurn(self, mousePosition) {
        if (self.status === "playing" && self.computerTimeBusy !== self.roundTime.seconds ) {
            self.Canvas.clearLayer(self.Canvas.layerContexts[0], self.Canvas.layerElements[0]);
            let position = Math.floor((mousePosition.x - 12) / 48);
            let message = null;
            let play = self.addPiece(1, position, self.board);
            if (play.possible) {
                self.board = play.board;
                let gameContinues = self.testIfFinish(1, self.board);
                self.drawPlayedPieces();
                $("#canvas_div").append('<div id="pleaseWait">' +
                    '<p>' + icons('spinner', '30x24 animate_rotate') +
                    '<span>Veuillez patienter</span>' +
                    '</p>' +
                    '</div>');
                setTimeout(function () {
                    if (gameContinues !== true) {
                        if (gameContinues.winner === 1) {
                            // Le joueur a gagné
                            message = self.gameWon();
                            self.showEndRoundMessage(message, mousePosition, self);
                            $("#pleaseWait").remove();
                        }
                    } else {
                        // le setTimeout permet de rafraichir l'image et de tracer le coup du joueur
                        setTimeout(function () {
                            self.computerPlay();
                            let gameContinues = self.testIfFinish(2, self.board);
                            if (gameContinues !== true) {
                                if (gameContinues.winner === 2) {
                                    // Le joueur a perdu
                                    message = self.gameLost();
                                } else {
                                    // Match nul
                                    message = self.gameNextTurn();
                                }
                            }
                            self.drawPlayedPieces();
                            self.showEndRoundMessage(message, mousePosition, self);
                            $("#pleaseWait").remove();
                        }, 100);
                    }
                }, 0);
            } else {
                message = "La colonne est pleine...";
            }
            self.showEndRoundMessage(message, mousePosition, self);
        }
    }

    showEndRoundMessage(message, mousePosition, self) {
        if (this.round === 4) {
            this.showMessage(message);
            setTimeout(function () {
                self.endGame();
            }, 1000);
        } else {
            this.showMessage(message);
            this.drawArrow(this, mousePosition);
        }
    }

    gameWon() {
        this.status = "won";
        this.score += 350;
        this.round++;
        this.roundTime.pause();
        this.totalTime += this.roundTime.seconds;
        return `<p>Bravo c'est gagné !</p>`;
    }

    gameLost() {
        this.status = "lost";
        this.score -= 200;
        this.round++;
        this.roundTime.pause();
        this.totalTime += this.roundTime.seconds;
        return `<p>Dommage c'est perdu !</p>`;
    }

    gameNextTurn() {
        this.status = "draw";
        this.round++;
        this.roundTime.pause();
        this.totalTime += this.roundTime.seconds;
        return `<p>Match nul !</p>`;
    }

    endGame() {
        $("#round").text("3");
        this.roundTime.pause();
        this.totalTime += this.roundTime.seconds;
        $("#score").text(this.score);
        let timePoints = Math.round(Math.max(1000 - this.totalTime, 0));
        setTimeout(() => {
            alert("Partie terminée !\n - Victoires : " + this.score + "pts\n - Temps (" + this.roundTime.convertSecondToMinSec(this.totalTime) + ") : " + timePoints + "pts\nTotal : " + (this.score + timePoints) + "pts");
            this.score += timePoints;
            new Score(this.gameId, this.score, this.difficulty).saveScore();
        }, 0);
    }

    /*--------------------------- INTELLIGENCE ARTIFICIELLE -------------------------*/


    computerPlay() {
        this.computerTimeBusy = this.roundTime.seconds;
        let board = {
            score: null,
            position: null,
            board: JSON.parse(JSON.stringify(this.board)),
            children: [],
        };
        if (this.difficulty === EASY) {
            board = this.constructAllTree(2, board, 2);
            let play = this.addPiece(2, this.giveBestPosition(board), this.board);
            if (play.possible) {
                this.board = play.board;
            }
        } else if (this.difficulty === NORMAL) {
            board = this.constructAllTree(6, board, 2);
            // On ajouter un random d'erreur de jeu
            if (Math.random() > 0.8) {
                let play;
                do {
                    let randomPosition = Math.floor(Math.random() * 7);
                    play = this.addPiece(2, randomPosition, this.board);
                } while (!play.possible);
                this.board = play.board;
            } else {
                let play = this.addPiece(2, this.giveBestPosition(board), this.board);
                if (play.possible) {
                    this.board = play.board;
                }
            }
        } else if (this.difficulty === HARD) {
            board = this.constructAllTree(6, board, 2);
            let play = this.addPiece(2, this.giveBestPosition(board), this.board);
            if (play.possible) {
                this.board = play.board;
            }
        }
        this.computerTimeBusy = this.roundTime.seconds;
    }

    // Fonction qui construit l'arbre de possibilités
    constructAllTree(deep, tree, player) {
        this.recursiveTreeConstruction(tree, player, deep, deep);
        this.scoreTree(tree, player);
        return tree;
    }

    constructOneTurnTree(tree, player, deep) {
        player = player % 2 + 1;
        for (let i = 0; i < 7; i++) {
            let nextTurn = this.addPiece(player, i, JSON.parse(JSON.stringify(tree.board)));
            if (nextTurn.possible) {
                let continueGame = this.testIfFinish((player + 1) % 2 + 1, nextTurn.board);
                tree.children.push({
                    score: this.calculateScore(i, continueGame, deep),
                    continue: continueGame,
                    position: i,
                    board: nextTurn.board,
                    children: [],
                });
            }
        }
        return tree;
    }

    recursiveTreeConstruction(tree, player, remainingLevels, deep) {
        if (remainingLevels > 0 && tree.children.length === 0) {
            player = player % 2 + 1;
            this.constructOneTurnTree(tree, player, deep - remainingLevels);
            this.recursiveTreeConstruction(tree, player, remainingLevels - 1, deep);
        } else {
            for (let child of tree.children) {
                this.recursiveTreeConstruction(child, player, remainingLevels, deep);
            }
        }
    }

    // Fonction qui attribue les scores à chaque possibilité de plateau
    scoreTree(tree, player) {
        for (let child of tree.children) {
            if (child.children.length > 0) {
                this.scoreTree(child, player % 2 + 1);
            }
        }
        tree.score += Math.pow(-1, player) * this.sumOfScoreChildren(tree);
    }

    // Fonction qui calcule la somme des score de enfants directs
    sumOfScoreChildren(tree) {
        let sum = 0;
        for (let child of tree.children) {
            sum += child.score;
        }
        return sum;
    }

    // Fonction qui calcule le score d'une position
    calculateScore(position, continueGame, deep) {
        let score;
        if (continueGame !== false && continueGame !== true) {
            if (continueGame.winner === 2) {
                if (deep === 1) {
                    score = 100000;
                } else {
                    score = Math.round(1000 / deep);
                }
            } else if (continueGame.winner === 1) {
                if (deep === 1) {
                    score = Math.round(10000);
                } else {
                    score = Math.round(1000 / deep);
                }
            }
        } else {
            score = Math.random();
        }
        return score;
    }

    // Fonction qui retourne le meilleur score du premier enfant
    giveBestPosition(tree) {
        let max = null;
        let bestPosition;
        for (let child of tree.children) {
            if (max === null || child.score > max) {
                max = child.score;
                bestPosition = child.position;
            }
        }
        return bestPosition;
    }

    /*---------------------- GRAPHISME ----------------------------------------------*/

    // Dessine le plateau de jeu vierge
    drawBoard() {
        // Fond du plateau de jeu
        return [
            {
                type: "polygon",
                points: [
                    {x: 12, y: 100},
                    {x: 350, y: 100},
                    {x: 350, y: 388},
                    {x: 12, y: 388},
                    {x: 12, y: 385},
                    {x: 347, y: 385},
                    {x: 347, y: 103},
                    {x: 15, y: 103},
                    {x: 15, y: 385},
                    {x: 12, y: 385},
                ],
                stroke: "black",
                fill: "#3474eb",
                shadow: {
                    shadowColor: "black",
                    shadowBlur: 10,
                    shadowOffsetX: 2,
                    shadowOffsetY: 6,
                },
            }
        ];
    }

    // Dessine la piece en cours de jeu
    drawArrow(self, mousePosition) {
        self.Canvas.clearLayer(self.Canvas.layerContexts[0], self.Canvas.layerElements[0]);
        if (self.status === "playing") {
            let position = Math.floor((mousePosition.x - 12) / 48);
            let listOfForms = self.drawOnePiece({x: 42 + position * 46, y: 50}, 1)
            listOfForms.push({
                type: "polygon",
                points: [
                    {x: 37 + position * 46, y: 80},
                    {x: 47 + position * 46, y: 80},
                    {x: 42 + position * 46, y: 90},
                ],
                fill: "red",
                stroke: "black",
            });
            self.Canvas.drawListOfForms(self.Canvas.layerContexts[0], listOfForms);
        }
    }

    // Dessine les pièces déjà jouées
    drawPlayedPieces() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[1], this.Canvas.layerElements[1]);
        let listOfForms = [];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                if (this.board[i][j] !== 0) {
                    listOfForms = listOfForms.concat(this.drawOnePiece({
                        x: 43 + i * 46,
                        y: 131 + j * 46
                    }, this.board[i][j]));
                }
            }
        }
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[1], listOfForms);
    }

    // Dessine un jeton
    drawOnePiece(position, player) {
        let color = player === 1 ? "#ffd500" : "#c40d00";
        let colorRib = player === 1 ? "#ffea00" : "#ff1100";
        let listOfForms = [];
        listOfForms.push({
            type: "circle",
            origin: position,
            radius: 18,
            fill: color,
            shadow: {
                shadowColor: "black",
                shadowBlur: 1,
                shadowOffsetX: 0,
                shadowOffsetY: 1,
            },
        });
        // Nervures
        listOfForms.push({
            type: "circle",
            origin: position,
            radius: 15,
            fill: colorRib,
            shadow: {
                shadowColor: "black",
                shadowBlur: 1,
                shadowOffsetX: 0,
                shadowOffsetY: 1,
            },
        });
        return listOfForms;
    }

    // Dessine les caches vides
    drawCovers() {
        let listOfForms = [];
        listOfForms.push({
            type: "reverseCircle",
            origin: {x: 12, y: 100},
            radius: 15,
            width: 338,
            height: 288,
            fill: "#3474eb",
            holes: [],
            shadow: {
                shadowColor: "black",
                shadowBlur: 10,
                shadowOffsetX: 2,
                shadowOffsetY: 6,
            },
        });
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                listOfForms[0].holes.push({
                    origin: {x: 43 + i * 46, y: 131 + j * 46},
                    radius: 18,
                });
            }
        }
        // Nervures sur le plateau
        listOfForms.push({
            type: "rectangle",
            origin: {x: 14, y: 102},
            width: 334,
            height: 284,
            stroke: "#5e97ff",
            lineWidth: 4,
            shadow: {
                shadowColor: "#001245",
                shadowBlur: 1,
                shadowOffsetX: 0,
                shadowOffsetY: 1,
            },
        });
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                listOfForms.push({
                    type: "circle",
                    origin: {x: 43 + i * 46, y: 131 + j * 46},
                    radius: 18,
                    stroke: "#5e97ff",
                    lineWidth: 2,
                    shadow: {
                        shadowColor: "#001245",
                        shadowBlur: 1,
                        shadowOffsetX: 0,
                        shadowOffsetY: 1,
                    },
                });
            }
        }

        this.Canvas.drawListOfForms(this.Canvas.layerContexts[2], listOfForms);
    }

    // Redessine tous les calques après un redimensionnement de la fenêtre
    refreshView() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[2], this.Canvas.layerElements[2]);
        this.Canvas.drawCanvas();
        this.drawBoard();
        this.drawCovers();
    }

    /*---------------------- INTERFACE ----------------------------------------------*/
    loadInterface() {
        let listOfInterfaces = [];
        for (let i = 0; i < 7; i++) {
            listOfInterfaces.push(
                new Interface(this,
                    this.drawArrow,
                    {
                        id: i,
                        type: "rectangle",
                        origin: {x: 12 + i * 48, y: 0},
                        dimensionParameters: {width: 48, height: 388},
                        triggerAction: "mouseover",
                    }
                )
            );
        }
        listOfInterfaces.push(
            new Interface(this,
                this.playTurn,
                {
                    id: 7,
                    type: "rectangle",
                    origin: {x: 12, y: 0},
                    dimensionParameters: {width: 336, height: 400},
                    triggerAction: "click",
                }
            )
        );
        return listOfInterfaces;
    }
}