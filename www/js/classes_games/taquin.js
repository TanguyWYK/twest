"use strict";

class Taquin {

    constructor(gameOptions, imageId) {
        this.difficulty = gameOptions.difficulty;
        this.gameName = gameOptions.gameName;
        this.gameId = gameOptions.gameId;
        this.imageId = imageId;
        this.nbOfPieces = parseInt(this.difficulty) + 3;
        this.removedPiece = this.nbOfPieces - 1;// on enlève la pièce du coin haut à droite
        this.dimension = 300 / this.nbOfPieces;
        this.Canvas = new Canvas(this, 2);
        this.imgExample = document.getElementById("img_example");
        let self = this;
        this.imgExample.onload = function () {
            self.roundTime = new Timer(0);
            self.loadEventListeners();
            self.initGame();
            self.imgExample.onload = null;
        }
        this.imgExample.src = "images/taquin/image" + this.imageId + ".jpg";
    }

    loadEventListeners() {
        this.newGame_button = $(".newGame_button");
        this.newGame_button.on("click", this.initGame.bind(this));
        this.start_button = $(".start_button");
        this.start_button.on("click", this.startGame.bind(this));
        this.changeImg_button = $(".changeImg_button");
        this.changeImg_button.on("click", this.changeImg.bind(this));
        this.message = $(".message");
        this.movesElement = $("#moves");
        let canvasElement = $("#canvas_tooltip");
        canvasElement.on("mouseout", this.clearMouseLayer.bind(this));
        let timerId;
        let self = this;
        window.onresize = function () {
            clearTimeout(timerId); // pour éviter de déclencher l'event plusieurs fois lors d'un même resize
            timerId = setTimeout(function () {
                self.refreshView();
            }, 200);
        };
    }

    initGame() {
        this.roundTime.reset(-1);
        this.roundTime.pause();
        this.board = [];
        this.moves = 0;
        this.movesElement.text(0);
        this.status = "wait";
        this.initBoard();
        this.drawPieces();
        this.defaultCursor = true;
        let self = this;
        this.newGame_button.prop("disabled", true).addClass("disabled");
        this.start_button.prop("disabled", false).removeClass("disabled");
        this.changeImg_button.prop("disabled", false).removeClass("disabled");
        setTimeout(function () {
            self.showMessage("Appuyer sur Commencer pour lancer la partie");
        }, 0);
    }

    initBoard() {
        let nbOfPieces = Math.pow(parseInt(this.difficulty) + 3, 2);// 9,16 ou 25
        let row = [];
        for (let i = 0; i < nbOfPieces; i++) {
            row.push(i);
            if (i % this.nbOfPieces === this.nbOfPieces - 1) {
                this.board.push(row);
                row = [];
            }
        }
        this.refreshPieces();
    }

    mixBoard() {
        // On mélange en simulant un mélange manuel, car sur une génération aléatoire, il y a des plateaux sans solution
        let mixTimes = Math.pow(this.nbOfPieces, 4);
        for (let k = 0; k < mixTimes; k++) {
            let emptyPosition = this.findEmptyPiecePosition();
            let position;
            if (k % 2 === 0) {  // on mélange une fois sur deux ligne ou colonne
                position = {
                    i: emptyPosition.i,
                    j: Math.round(Math.random() * (this.nbOfPieces - 1)),
                };
            } else {
                position = {
                    i: Math.round(Math.random() * (this.nbOfPieces - 1)),
                    j: emptyPosition.j,
                };
            }
            this.testMove(position);
        }
    }

    startGame() {
        this.mixBoard();
        this.showMessage("C'est parti !");
        this.newGame_button.prop("disabled", false).removeClass("disabled");
        this.start_button.prop("disabled", true).addClass("disabled");
        this.changeImg_button.prop("disabled", true).addClass("disabled");
        this.roundTime.start();
        this.totalTime = 0;
        this.defaultCursor = false;
        this.status = "play";
        this.refreshPieces();
    }

    // Affiche un message personnalisé
    showMessage(text) {
        if (text !== null) {
            this.message.fadeOut(0).fadeIn(300).html(text);
        }
    }

    // Fait le calcul pour vérifier la combinaison testée
    testSolution() {
        for (let k = 0; k < this.nbOfPieces * this.nbOfPieces - 1; k++) {
            // On test s'il y a bien un numéro d'écart entre chaque pièce, sinon c'est faux
            if (this.board[Math.floor(k / this.nbOfPieces)][k % (this.nbOfPieces)] + 1 !== this.board[Math.floor((k + 1) / this.nbOfPieces)][(k + 1) % (this.nbOfPieces)]) {
                return false;
            }
        }
        return true;
    }

    getPieceMousePosition(mousePosition) {
        return {
            i: Math.floor((mousePosition.y - 50) / this.dimension),
            j: Math.floor((mousePosition.x - 30) / this.dimension),
        };
    }

    findEmptyPiecePosition() {
        if (this.board !== undefined) {
            for (let i = 0; i < this.nbOfPieces; i++) {
                for (let j = 0; j < this.nbOfPieces; j++) {
                    if (this.board[i][j] === this.removedPiece) {
                        return {
                            i: i,
                            j: j,
                        }
                    }
                }
            }
        }
    }

    testMoveClick(self, mousePosition) {
        if (self.status === "play") {
            if (self.testMove(self.getPieceMousePosition(mousePosition))) {
                self.showMessage("");
                self.moves++;
                self.movesElement.text(self.moves);
                self.refreshPieces();
                if (self.testSolution()) {
                    self.newGame_button.prop("disabled", false).removeClass("disabled");
                    self.start_button.prop("disabled", true).addClass("disabled");
                    self.endGame();
                }
            } else {
                self.showMessage("Déplacement impossible !");
            }
        }
    }

    testMove(position) {
        let emptyPosition = this.findEmptyPiecePosition();
        if (position.i !== emptyPosition.i || position.j !== emptyPosition.j) {
            if (emptyPosition.i === position.i) {
                // translation ligne
                this.moveRow(emptyPosition, position);
                return true;
            } else if (emptyPosition.j === position.j) {
                // translation colonne
                this.moveColumn(emptyPosition, position);
                return true;
            }
        }
        return false;
    }

    getArrow(position) {
        let emptyPosition = this.findEmptyPiecePosition();
        if (position.i !== emptyPosition.i || position.j !== emptyPosition.j) {
            if (emptyPosition.i === position.i) {
                if (emptyPosition.j - position.j > 0) {
                    return RIGHT;
                } else {
                    return LEFT;
                }
            } else if (emptyPosition.j === position.j) {
                if (emptyPosition.i - position.i > 0) {
                    return BOTTOM;
                } else {
                    return TOP;
                }
            }
        }
        return "impossible";
    }

    moveRow(emptyPosition, position) {
        let difference = emptyPosition.j - position.j;
        if (difference > 0) {
            // translation droite
            for (let k = 0; k < difference; k++) {
                this.board[position.i][position.j + difference - k] = this.board[position.i][position.j + difference - k - 1];
            }
        } else {
            // translation gauche
            for (let k = 0; k < -difference; k++) {
                this.board[position.i][position.j + difference + k] = this.board[position.i][position.j + difference + k + 1];
            }
        }
        this.board[position.i][position.j] = this.removedPiece;
    }

    moveColumn(emptyPosition, position) {
        let difference = emptyPosition.i - position.i;
        if (difference > 0) {
            // translation bas
            for (let k = 0; k < difference; k++) {
                this.board[position.i + difference - k][position.j] = this.board[position.i + difference - k - 1][position.j];
            }
        } else {
            // translation haut
            for (let k = 0; k < -difference; k++) {
                this.board[position.i + difference + k][position.j] = this.board[position.i + difference + k + 1][position.j];
            }
        }
        this.board[position.i][position.j] = this.removedPiece;
    }

    endGame() {
        this.roundTime.pause();
        this.status = "won";
        this.defaultCursor = true;
        this.Canvas.canvasDivElement.style.cursor = "default";
        this.Canvas.clearLayer(this.Canvas.layerContexts[1], this.Canvas.layerElements[1]);
        this.totalTime += this.roundTime.seconds;
        this.showMessage(`<p>Bravo c'est gagné en ${this.moves} coups !</p>`);
        let score = Math.max(1000 - this.moves, 0);
        let timePoints = Math.max(1000 - this.totalTime, 0);
        setTimeout(() => {
            alert("Partie terminée !\n - Nombre de coups (" + this.moves + ") : " + score + "pts\n - Bonus temps (" + this.roundTime.convertSecondToMinSec(this.totalTime) + ") : " + timePoints + "pts\nTotal : " + (score + timePoints) + "pts");
            new Score(this.gameId, (score + timePoints), this.difficulty).saveScore();
        }, 1000);
    }

    changeImg() {
        this.imageId = this.imageId % 4 + 1;
        let self = this;
        this.imgExample.onload = function () {
            self.refreshPieces();
        };
        this.imgExample.src = "images/taquin/image" + this.imageId + ".jpg";
    }

    /*---------------------- GRAPHISME ----------------------------------------------*/

    // Fonction qui efface le canvas avec le curseur de la souris
    clearMouseLayer() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[1], this.Canvas.layerElements[1]);
    }

    // Dessine le plateau de jeu vierge
    drawBoard() {
        // Fond du plateau de jeu
        return [
            {
                type: "polygon",
                points: [
                    {x: 10, y: 30},
                    {x: 350, y: 30},
                    {x: 350, y: 370},
                    {x: 10, y: 370},
                    {x: 10, y: 350},
                    {x: 330, y: 350},
                    {x: 330, y: 50},
                    {x: 30, y: 50},
                    {x: 30, y: 350},
                    {x: 10, y: 350},
                ],
                stroke: "black",
                fill: "#fff5cd",
                shadow: {
                    shadowColor: "black",
                    shadowBlur: 10,
                    shadowOffsetX: 2,
                    shadowOffsetY: 6,
                },
            }
        ];
    }

    drawPieces() {
        let listOfForms = [];
        for (let i = 0; i < this.nbOfPieces; i++) {
            for (let j = 0; j < this.nbOfPieces; j++) {
                if (this.board[i][j] !== this.removedPiece) {
                    listOfForms.push({
                        type: "image",
                        imageSrc: this.imgExample,
                        origin: {
                            x: (this.board[i][j] % this.nbOfPieces) * this.dimension * 2,
                            y: Math.floor(this.board[i][j] / this.nbOfPieces) * this.dimension * 2,
                            width: this.dimension * 2,
                            height: this.dimension * 2
                        }, //img source 600x600 destination 300x300
                        destination: {
                            x: 30 + j * this.dimension,
                            y: 50 + i * this.dimension,
                            width: this.dimension,
                            height: this.dimension
                        },
                    });
                }
            }
        }
        for (let i = 0; i < this.nbOfPieces; i++) {
            for (let j = 0; j < this.nbOfPieces; j++) {
                if (this.board[i][j] !== this.removedPiece) {
                    listOfForms.push({
                        type: "rectangle",
                        origin: {x: 30 + j * this.dimension, y: 50 + i * this.dimension},
                        width: this.dimension,
                        height: this.dimension,
                        stroke: "black",
                        lineWidth: 1,
                    });
                }
            }
        }
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[0], listOfForms);
    }

    // Redessine tous les calques après un redimensionnement de la fenêtre
    refreshView() {
        this.Canvas.drawCanvas();
        this.Canvas.clearLayer(this.Canvas.layerContexts[0], this.Canvas.layerElements[0]);
        this.drawPieces();
    }

    // Redessine le calque des pièces
    refreshPieces() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[0], this.Canvas.layerElements[0]);
        this.drawPieces();
    }

    // Génère le curseur à la position souhaité
    generateCursor(mousePosition) {
        let arrow = this.getArrow(this.getPieceMousePosition(mousePosition));
        if (arrow === "impossible") {
            return [{
                type: "circle",
                origin: mousePosition,
                radius: 8,
                stroke: "red",
                lineWidth: 3,
            },
                {
                    type: "path",
                    origin: {x: mousePosition.x - 5, y: mousePosition.y - 5},
                    end: {x: mousePosition.x + 5, y: mousePosition.y + 5},
                    stroke: "red",
                    lineWidth: 3,
                }
            ];
        } else {
            let sign1, sign2;
            if (arrow === TOP) {
                sign1 = 1;
                sign2 = 0;
            } else if (arrow === BOTTOM) {
                sign1 = -1;
                sign2 = 0;
            } else if (arrow === RIGHT) {
                sign1 = 0;
                sign2 = 1;
            } else if (arrow === LEFT) {
                sign1 = 0;
                sign2 = -1;
            }
            return [{
                type: "polygon",
                points: [
                    {x: mousePosition.x - sign1 * 8, y: mousePosition.y + sign2 * 8},
                    {x: mousePosition.x + sign2 * 8, y: mousePosition.y - sign1 * 8},
                    {x: mousePosition.x + sign1 * 8, y: mousePosition.y - sign2 * 8},
                    {x: mousePosition.x + sign1 * 3, y: mousePosition.y - sign2 * 3},
                    {x: mousePosition.x + sign1 * 3 - sign2 * 8, y: mousePosition.y + sign1 * 8 - sign2 * 3},
                    {x: mousePosition.x - sign1 * 3 - sign2 * 8, y: mousePosition.y + sign1 * 8 + sign2 * 3},
                    {x: mousePosition.x - sign1 * 3, y: mousePosition.y + sign2 * 3},
                ],
                fill: "chartreuse",
                stroke: "black",
                shadow: {
                    shadowColor: "black",
                    shadowBlur: 2,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                },
            }];
        }
    }

    /*---------------------- INTERFACE ----------------------------------------------*/
    loadInterface() {
        // curseur de la souris
        let listOfInterfaces = [new Interface(this,
            this.drawCustomCursorOnMouse,
            {
                id: 0,
                type: "rectangle",
                origin: {x: 0, y: 0},
                dimensionParameters: {width: 360, height: 400},
                triggerAction: "mouseover",
            }
        )
        ];
        // pièces du puzzle
        for (let i = 0; i < this.nbOfPieces; i++) {
            for (let j = 0; j < this.nbOfPieces; j++) {
                listOfInterfaces.push(new Interface(this,
                    this.changeCursor,
                    {
                        id: 1 + j + i * this.nbOfPieces,
                        type: "rectangle",
                        origin: {
                            x: 30 + i * this.dimension,
                            y: 50 + j * this.dimension,
                        },
                        dimensionParameters: {width: this.dimension, height: this.dimension},
                        triggerAction: "mouseover",
                    }
                ));
            }
        }
        for (let i = 0; i < this.nbOfPieces; i++) {
            for (let j = 0; j < this.nbOfPieces; j++) {
                listOfInterfaces.push(new Interface(this,
                    this.testMoveClick,
                    {
                        id: 1 + this.nbOfPieces * this.nbOfPieces + j + i * this.nbOfPieces,
                        type: "rectangle",
                        origin: {
                            x: 30 + i * this.dimension,
                            y: 50 + j * this.dimension,
                        },
                        dimensionParameters: {width: this.dimension, height: this.dimension},
                        triggerAction: "click",
                    }
                ));
            }
        }
        return listOfInterfaces;
    }

    // Trace le curseur personnalisé à la position de la souris
    drawCustomCursorOnMouse(self, mousePosition) {
        if (self.status === "play") {
            self.Canvas.clearLayer(self.Canvas.layerContexts[1], self.Canvas.layerElements[1]);
            self.defaultCursor = !(mousePosition.x > 30 && mousePosition.x < 330 && mousePosition.y > 50 && mousePosition.y < 350);
            if (self.defaultCursor) {
                self.Canvas.canvasDivElement.style.cursor = "default";
            } else {
                // on cache le curseur par défaut de la souris
                self.Canvas.canvasDivElement.style.cursor = "none";
            }
        }
    }

    // Fonction qui change le curseur en fonction du déplacement possible */
    changeCursor(self, mousePosition) {
        if (self.defaultCursor) {
            // on affiche le curseur par défaut de la souris
            self.Canvas.canvasDivElement.style.cursor = "default";
        } else {
            self.Canvas.drawListOfForms(self.Canvas.layerContexts[1], self.generateCursor(mousePosition));
        }
    }
}