"use strict";

const P_UP = 1, P_LEFT = 2, P_DOWN = 3, P_RIGHT = 4, P_LINE_V = 20, P_LINE_H = 21, P_TURN_BR = 22,
    P_TURN_BL = 23, P_TURN_TR = 24, P_TURN_TL = 25, P_CROSS = 26;

const WATER_COLOR = "#00c3dd";

class Pipe {

    constructor(gameOptions) {
        this.difficulty = gameOptions.difficulty;
        this.gameName = gameOptions.gameName;
        this.gameId = gameOptions.gameId;
        this.Canvas = new Canvas(this, 1);
        this.loadEventListeners();
        this.status = "new";
        this.roundTime = new Timer(0);
        this.roundTime.start();
        this.score = 0;
        this.level = 0;
        this.speed = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]; // durée du timout avant chaque rafraichissement
        this.step = 1 + parseInt(this.difficulty); // % de la case inondée à chaque rafraichissement
        this.nbOfBlockMin = [10, 10, 10, 15, 15, 15, 20, 20, 20, 30]; // objectif de case pour pouvoir changer de niveau
        let k = 4 + 2 * parseInt(this.difficulty);
        this.tankSpillingSpeed = [2 * k, 3 * k, 4 * k, 5 * k, 6 * k, 7 * k, 8 * k, 9 * k, 10 * k, 11 * k]; // décrément de la réserve avant inondation (réserve de 10000, décrément tous les 50ms)
        this.initGame();
    }

    loadEventListeners() {
        let self = this;
        let timerId;
        this.message = $(".message");
        this.nextPieces_div = $("#nextPieces div");
        this.fast_button = $("#fast_button");
        this.scoreElement = $("#score");
        this.tankElement = $("#tank_svg");
        this.blockMinElement = $("#blockMin");
        this.blockElement = $("#block");
        this.fast_button.on("click", this.fastFlood.bind(this));
        window.onresize = function () {
            clearTimeout(timerId); // pour éviter de déclencher l'event plusieurs fois lors d'un même resize
            timerId = setTimeout(function () {
                self.refreshView();
            }, 200);
        };
    }

    initGame() {
        $("#level").text(this.level + 1);
        this.showMessage("Objectif: " + this.nbOfBlockMin[this.level] + " tuyaux");
        this.blockMinElement.text(this.nbOfBlockMin[this.level]);
        this.blockElement.text(0);
        this.roundTime.seconds = -1;
        this.nbOfBlock = -1;
        this.board = [];
        this.flood = [];
        this.tank = 10000;
        for (let i = 0; i < 9; i++) {
            let row = [0, 0, 0, 0, 0, 0, 0, 0];
            let row2 = [0, 0, 0, 0, 0, 0, 0, 0];
            this.board.push(row);
            this.flood.push(row2);
        }
        this.startDirection = Math.floor(Math.random() * 4) + 1;
        this.startPosition = {i: Math.floor(Math.random() * 7 + 1), j: Math.floor(Math.random() * 6 + 1)};
        this.board[this.startPosition.i][this.startPosition.j] = this.startDirection;
        this.next = [0, 0, 0, 0, 0];
        for (let k = 0; k < 5; k++) {
            this.pickNextPiece();
        }
        this.floodPosition = this.startPosition;
        this.floodDirection = this.startDirection;
        this.flood[this.floodPosition.i][this.floodPosition.j] = 50; // On initialise le start à 50% car c'est une demi case
        this.isFastFlood = false;
        this.refreshBoard();
        this.refreshNextPieces();
        this.tankSpilling();
    }

    // On lance le décompte avant le lancement
    tankSpilling() {
        let self = this;
        setTimeout(function () {
            if (self.tank > 0) {
                self.tank -= self.isFastFlood ? 50 : self.tankSpillingSpeed[self.level];
                self.refreshTank();
                self.tankSpilling();
            } else {
                self.showMessage("L'eau arrive !");
                self.nextStepFlood();
            }
        }, this.isFastFlood ? 0 : 50);
    }

    // Affiche un message personnalisé
    showMessage(text) {
        if (text !== null) {
            this.message.fadeOut(0).fadeIn(300).html(text);
        }
    }

    getPieceMousePosition(mousePosition) {
        return {
            i: Math.floor((mousePosition.y - 20) / 40),
            j: Math.floor((mousePosition.x - 20) / 40),
        };
    }

    playPiece(self, mousePosition) {
        let position = self.getPieceMousePosition(mousePosition);
        if ((self.board[position.i][position.j] >= 20 || self.board[position.i][position.j] === 0) && self.flood[position.i][position.j] === 0 ||
            self.board[position.i][position.j] === P_CROSS && self.flood[position.i][position.j][0] === 0 && self.flood[position.i][position.j][1] === 0) {
            if (self.board[position.i][position.j] === P_CROSS) {
                self.flood[position.i][position.j] = 0; // on enlève le tableau 2d pour les croix
            }
            if (self.board[position.i][position.j] !== 0) {
                // pénalité lorsqu'on remplace une pièce
                self.score = Math.max(self.score - 50, 0);
                self.scoreElement.text(self.score);
            }
            self.board[position.i][position.j] = self.next[0];
            if (self.next[0] === P_CROSS) {
                self.flood[position.i][position.j] = [0, 0]; // pour gérer le vertical et horizontal
            }
            self.pickNextPiece();
            self.refreshBoard();
            self.refreshNextPieces();
        } else {
            self.showMessage("Impossible ici");
        }
    }

    pickNextPiece() {
        this.next = this.next.splice(1);
        this.next.push(Math.floor(Math.random() * 7) + 20);
    }

    fastFlood() {
        this.isFastFlood = true;
    }

    nextStepFlood() {
        let self = this;
        setTimeout(function () {
            let gameContinue = true;
            // Bonus croisement
            if (self.flood[self.floodPosition.i][self.floodPosition.j][0] === 100 && self.flood[self.floodPosition.i][self.floodPosition.j][1] === 50 ||
                self.flood[self.floodPosition.i][self.floodPosition.j][0] === 50 && self.flood[self.floodPosition.i][self.floodPosition.j][1] === 100) {
                self.score += 500;
                self.scoreElement.text(self.score);
                self.showMessage("Bonus +500");
            }
            let moreSpeed = self.isFastFlood ? 4 : 0;
            if (self.board[self.floodPosition.i][self.floodPosition.j] !== P_CROSS && self.flood[self.floodPosition.i][self.floodPosition.j] < 100) {
                self.flood[self.floodPosition.i][self.floodPosition.j] += self.step + moreSpeed;
            } else if (self.board[self.floodPosition.i][self.floodPosition.j] === P_CROSS && (self.floodDirection === P_UP || self.floodDirection === P_DOWN) && self.flood[self.floodPosition.i][self.floodPosition.j][0] < 100) {
                self.flood[self.floodPosition.i][self.floodPosition.j][0] += self.step + moreSpeed;
            } else if (self.board[self.floodPosition.i][self.floodPosition.j] === P_CROSS && (self.floodDirection === P_RIGHT || self.floodDirection === P_LEFT) && self.flood[self.floodPosition.i][self.floodPosition.j][1] < 100) {
                self.flood[self.floodPosition.i][self.floodPosition.j][1] += self.step + moreSpeed;
            } else {
                self.nbOfBlock++;
                self.score += 50;
                self.scoreElement.text(self.score);
                self.blockElement.text(self.nbOfBlock);
                gameContinue = self.findNextFloodPosition();
            }
            self.refreshBoard();
            if (gameContinue) {
                self.nextStepFlood();
            } else {
                self.endRound();
            }
        }, this.isFastFlood ? 0 : this.speed[this.level]);
    }

    findNextFloodPosition() {
        if (this.board[this.floodPosition.i][this.floodPosition.j] !== P_CROSS) {
            this.flood[this.floodPosition.i][this.floodPosition.j] = 100;
        } else {
            if (this.floodDirection === P_UP || this.floodDirection === P_DOWN) {
                this.flood[this.floodPosition.i][this.floodPosition.j][0] = 100;
            } else {
                this.flood[this.floodPosition.i][this.floodPosition.j][1] = 100;
            }
        }
        if (this.floodDirection === P_UP) {
            if (this.floodPosition.i > 0 && [P_CROSS, P_LINE_V, P_TURN_BR, P_TURN_BL].includes(this.board[this.floodPosition.i - 1][this.floodPosition.j])) {
                this.floodPosition.i--;
            } else {
                return false;
            }
        } else if (this.floodDirection === P_DOWN) {
            if (this.floodPosition.i < 8 && [P_CROSS, P_LINE_V, P_TURN_TR, P_TURN_TL].includes(this.board[this.floodPosition.i + 1][this.floodPosition.j])) {
                this.floodPosition.i++;
            } else {
                return false;
            }
        } else if (this.floodDirection === P_LEFT) {
            if (this.floodPosition.j > 0 && [P_CROSS, P_LINE_H, P_TURN_BR, P_TURN_TR].includes(this.board[this.floodPosition.i][this.floodPosition.j - 1])) {
                this.floodPosition.j--;
            } else {
                return false;
            }
        } else if (this.floodDirection === P_RIGHT) {
            if (this.floodPosition.j < 7 && [P_CROSS, P_LINE_H, P_TURN_BL, P_TURN_TL].includes(this.board[this.floodPosition.i][this.floodPosition.j + 1])) {
                this.floodPosition.j++;
            } else {
                return false;
            }
        }
        // On change la direction de l'eau
        if (this.board[this.floodPosition.i][this.floodPosition.j] === P_TURN_BL) {
            this.floodDirection = this.floodDirection === P_UP ? P_LEFT : P_DOWN;
        } else if (this.board[this.floodPosition.i][this.floodPosition.j] === P_TURN_BR) {
            this.floodDirection = this.floodDirection === P_UP ? P_RIGHT : P_DOWN;
        } else if (this.board[this.floodPosition.i][this.floodPosition.j] === P_TURN_TL) {
            this.floodDirection = this.floodDirection === P_RIGHT ? P_UP : P_LEFT;
        } else if (this.board[this.floodPosition.i][this.floodPosition.j] === P_TURN_TR) {
            this.floodDirection = this.floodDirection === P_LEFT ? P_UP : P_RIGHT;
        }
        if (this.board[this.floodPosition.i][this.floodPosition.j] !== P_CROSS) {
            this.flood[this.floodPosition.i][this.floodPosition.j] = this.step;
        } else {
            if (this.floodDirection === P_UP || this.floodDirection === P_DOWN) {
                this.flood[this.floodPosition.i][this.floodPosition.j][0] = this.step;
            } else {
                this.flood[this.floodPosition.i][this.floodPosition.j][1] = this.step;
            }
        }
        return true;
    }

    refreshTank() {
        let filled = Math.max(0, Math.round(this.tank / 10000 * 500));
        this.tankElement.attr("height", filled + "px");
    }

    endRound() {
        console.log(this.nbOfBlock, this.speed[this.level]);
        if (this.nbOfBlock >= this.nbOfBlockMin[this.level]) {
            if (this.level === 9) {
                this.endGame("win");
            } else {
                // niveau suivant
                this.score += this.level * 1000;
                this.scoreElement.text(this.score);
                this.level++;
                this.nbOfBlock = 0;
                $("#level").text(this.level + 1);
                this.initGame();
            }
        } else {
            this.endGame("lost");
        }
    }

    endGame(status) {
        if (status === "win") {
            setTimeout(() => {
                alert("Félicitation vous avez fini tous les niveaux !\n - Score : " + this.score + " pts");
                new Score(this.gameId, this.score, this.difficulty).saveScore();
            }, 1000);
        } else {
            setTimeout(() => {
                alert("Partie terminée ! Niveau atteint : " + (this.level + 1) + "/10\n - Score : " + this.score + " pts");
                new Score(this.gameId, this.score, this.difficulty).saveScore();
            }, 1000);
        }
    }

    /*---------------------- GRAPHISME ----------------------------------------------*/

    // Dessine le plateau de jeu vierge
    drawBoard() {
        let listOfForms = [];
        // Fond du plateau de jeu
        listOfForms.push({
            type: "rectangle",
            origin: {x: 20, y: 20},
            width: 320,
            height: 360,
            fill: "#dddddd",
        });
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 9; j++) {
                listOfForms.push({
                    type: "rectangle",
                    origin: {x: 20 + i * 40, y: 20 + j * 40},
                    width: 40,
                    height: 40,
                    stroke: "#bbbbbb",
                    lineWidth: 1,
                    shadow: {
                        shadowColor: "#555555",
                        shadowBlur: 2,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                    },
                })
            }
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 9; j++) {
                listOfForms.push({
                    type: "rectangle",
                    origin: {x: 20 + i * 40, y: 20 + j * 40},
                    width: 40,
                    height: 40,
                    stroke: "#bbbbbb",
                    lineWidth: 1,
                })
            }
        }
        listOfForms.push({
            type: "polygon",
            points: [
                {x: 10, y: 10},
                {x: 350, y: 10},
                {x: 350, y: 390},
                {x: 10, y: 390},
                {x: 10, y: 380},
                {x: 340, y: 380},
                {x: 340, y: 20},
                {x: 20, y: 20},
                {x: 20, y: 380},
                {x: 10, y: 380},
            ],
            stroke: "black",
            fill: "#c2b99d",
            shadow: {
                shadowColor: "black",
                shadowBlur: 8,
                shadowOffsetX: 2,
                shadowOffsetY: 3,
            },
        });
        return listOfForms;
    }

    generatePieces() {
        let listOfForms = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] !== 0) {
                    let offsetPipeV = 0, offsetWaterV = 0, offsetPipeH = 0, offsetWaterH = 0;
                    if (this.board[i][j] === P_UP) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        if (this.flood[i][j] > 0) {
                            offsetWaterV = (this.flood[i][j] - 50) * 40 / 100;
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40},
                                width: 4,
                                height: 20 - offsetWaterV,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20 - offsetWaterV},
                                width: 4,
                                height: offsetWaterV,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_LEFT) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        if (this.flood[i][j] > 0) {
                            offsetWaterH = (this.flood[i][j] - 50) * 40 / 100;
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40, y: 20 + i * 40 + 18},
                                width: 20 - offsetWaterH,
                                height: 4,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 20 - offsetWaterH, y: 20 + i * 40 + 18},
                                width: offsetWaterH,
                                height: 4,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_DOWN) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        if (this.flood[i][j] > 0) {
                            offsetPipeV = (this.flood[i][j] - 50) * 40 / 100;
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20 + offsetPipeV},
                                width: 4,
                                height: 20 - offsetPipeV,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20},
                                width: 4,
                                height: offsetPipeV,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_RIGHT) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        if (this.flood[i][j] > 0) {
                            offsetPipeH = (this.flood[i][j] - 50) * 40 / 100;
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 20 + offsetPipeH, y: 20 + i * 40 + 18},
                                width: 20 - offsetPipeH,
                                height: 4,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 20, y: 20 + i * 40 + 18},
                                width: offsetPipeH,
                                height: 4,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_LINE_V) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        if (this.flood[i][j] > 0) {
                            offsetPipeV = this.floodDirection === P_DOWN ? this.flood[i][j] * 40 / 100 : 0;
                            offsetWaterV = this.floodDirection === P_DOWN ? 0 : 40 - this.flood[i][j] * 40 / 100;
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetPipeV},
                                width: 4,
                                height: 40 - this.flood[i][j] * 40 / 100,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetWaterV},
                                width: 4,
                                height: this.flood[i][j] * 40 / 100,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_LINE_H) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        if (this.flood[i][j] > 0) {
                            offsetPipeH = this.floodDirection === P_LEFT ? 0 : this.flood[i][j] * 40 / 100;
                            offsetWaterH = this.floodDirection === P_LEFT ? 40 - this.flood[i][j] * 40 / 100 : 0;
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + offsetPipeH, y: 20 + i * 40 + 18},
                                width: 40 - this.flood[i][j] * 40 / 100,
                                height: 4,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + offsetWaterH, y: 20 + i * 40 + 18},
                                width: this.flood[i][j] * 40 / 100,
                                height: 4,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_TURN_BR) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        let width = 22, height = 20;
                        if (this.flood[i][j] > 0) {
                            if (this.flood[i][j] < 50) {
                                width = this.floodDirection === P_DOWN ? 22 - this.flood[i][j] * 22 / 50 : 22;
                                height = this.floodDirection === P_DOWN ? 20 : 20 - this.flood[i][j] * 20 / 50;
                                offsetPipeV = this.floodDirection === P_DOWN ? 0 : 0;
                                offsetWaterV = this.floodDirection === P_DOWN ? 0 : 20 - this.flood[i][j] * 20 / 50;
                                offsetPipeH = this.floodDirection === P_DOWN ? 0 : 0;
                                offsetWaterH = this.floodDirection === P_DOWN ? 22 - this.flood[i][j] * 22 / 50 : 0;
                            } else {
                                width = this.floodDirection === P_DOWN ? 0 : 22 - (this.flood[i][j] - 50) * 22 / 50;
                                height = this.floodDirection === P_DOWN ? 20 - (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetPipeV = this.floodDirection === P_DOWN ? (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetWaterV = this.floodDirection === P_DOWN ? 0 : 0;
                                offsetPipeH = this.floodDirection === P_DOWN ? 0 : (this.flood[i][j] - 50) * 22 / 50;
                                offsetWaterH = this.floodDirection === P_DOWN ? 0 : 0;
                            }
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20 + offsetPipeV},
                                width: 4,
                                height: height,
                                fill: "black",
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18 + offsetPipeH, y: 20 + i * 40 + 18 + offsetPipeV},
                                width: width,
                                height: 4,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18 + offsetWaterH, y: 20 + i * 40 + 18},
                                width: 22 - width,
                                height: 4,
                                fill: WATER_COLOR,
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20 + offsetWaterV},
                                width: 4,
                                height: 20 - height,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_TURN_BL) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        let width = 22, height = 20;
                        if (this.flood[i][j] > 0) {
                            if (this.flood[i][j] < 50) {
                                width = this.floodDirection === P_DOWN ? 22 - this.flood[i][j] * 22 / 50 : 22;
                                height = this.floodDirection === P_DOWN ? 20 : 20 - this.flood[i][j] * 20 / 50;
                                offsetPipeV = this.floodDirection === P_DOWN ? 0 : 0;
                                offsetWaterV = this.floodDirection === P_DOWN ? 0 : 20 - this.flood[i][j] * 20 / 50;
                                offsetPipeH = this.floodDirection === P_DOWN ? this.flood[i][j] * 22 / 50 : 0;
                                offsetWaterH = this.floodDirection === P_DOWN ? 0 : 0;
                            } else {
                                width = this.floodDirection === P_DOWN ? 0 : 22 - (this.flood[i][j] - 50) * 22 / 50;
                                height = this.floodDirection === P_DOWN ? 20 - (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetPipeV = this.floodDirection === P_DOWN ? (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetWaterV = this.floodDirection === P_DOWN ? 0 : 0;
                                offsetPipeH = this.floodDirection === P_DOWN ? 0 : 0;
                                offsetWaterH = this.floodDirection === P_DOWN ? 0 : 22 - (this.flood[i][j] - 50) * 22 / 50;
                            }
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20 + offsetPipeV},
                                width: 4,
                                height: height,
                                fill: "black",
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + offsetPipeH, y: 20 + i * 40 + 18 + offsetPipeV},
                                width: width,
                                height: 4,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20 + offsetWaterV},
                                width: 4,
                                height: 20 - height,
                                fill: WATER_COLOR,
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + offsetWaterH, y: 20 + i * 40 + 18 + offsetWaterV},
                                width: 22 - width,
                                height: 4,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_TURN_TR) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        let width = 22, height = 20;
                        if (this.flood[i][j] > 0) {
                            if (this.flood[i][j] < 50) {
                                width = this.floodDirection === P_UP ? 22 - this.flood[i][j] * 22 / 50 : 22;
                                height = this.floodDirection === P_UP ? 20 : 20 - this.flood[i][j] * 20 / 50;
                                offsetPipeV = this.floodDirection === P_UP ? 0 : this.flood[i][j] * 20 / 50;
                                offsetWaterV = this.floodDirection === P_UP ? 0 : 0;
                                offsetPipeH = this.floodDirection === P_UP ? 0 : 0;
                                offsetWaterH = this.floodDirection === P_UP ? 22 - this.flood[i][j] * 22 / 50 : 0;
                            } else {
                                width = this.floodDirection === P_UP ? 0 : 22 - (this.flood[i][j] - 50) * 22 / 50;
                                height = this.floodDirection === P_UP ? 20 - (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetPipeV = this.floodDirection === P_UP ? 0 : 0;
                                offsetWaterV = this.floodDirection === P_UP ? 20 - (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetPipeH = this.floodDirection === P_UP ? 0 : (this.flood[i][j] - 50) * 22 / 50;
                                offsetWaterH = this.floodDirection === P_UP ? 0 : 0;
                            }
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetPipeV},
                                width: 4,
                                height: height,
                                fill: "black",
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18 + offsetPipeH, y: 20 + i * 40 + 18},
                                width: width,
                                height: 4,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetWaterV},
                                width: 4,
                                height: 20 - height,
                                fill: WATER_COLOR,
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18 + offsetWaterH, y: 20 + i * 40 + 18},
                                width: 22 - width,
                                height: 4,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_TURN_TL) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        let width = 22, height = 20;
                        if (this.flood[i][j] > 0) {
                            if (this.flood[i][j] < 50) {
                                width = this.floodDirection === P_UP ? 22 - this.flood[i][j] * 22 / 50 : 22;
                                height = this.floodDirection === P_UP ? 20 : 20 - this.flood[i][j] * 20 / 50;
                                offsetPipeV = this.floodDirection === P_UP ? 0 : this.flood[i][j] * 20 / 50;
                                offsetWaterV = this.floodDirection === P_UP ? 0 : 0;
                                offsetPipeH = this.floodDirection === P_UP ? this.flood[i][j] * 22 / 50 : 0;
                                offsetWaterH = this.floodDirection === P_UP ? 0 : 0;
                            } else {
                                width = this.floodDirection === P_UP ? 0 : 22 - (this.flood[i][j] - 50) * 22 / 50;
                                height = this.floodDirection === P_UP ? 20 - (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetPipeV = this.floodDirection === P_UP ? 0 : 0;
                                offsetWaterV = this.floodDirection === P_UP ? 20 - (this.flood[i][j] - 50) * 20 / 50 : 0;
                                offsetPipeH = this.floodDirection === P_UP ? 0 : 0;
                                offsetWaterH = this.floodDirection === P_UP ? 0 : 22 - (this.flood[i][j] - 50) * 22 / 50;
                            }
                        }
                        if (this.flood[i][j] < 100) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetPipeV},
                                width: 4,
                                height: height,
                                fill: "black",
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + offsetPipeH, y: 20 + i * 40 + 18},
                                width: width,
                                height: 4,
                                fill: "black",
                            });
                        }
                        if (this.flood[i][j] > 0) {
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetWaterV},
                                width: 4,
                                height: 20 - height,
                                fill: WATER_COLOR,
                            });
                            listOfForms.push({
                                type: "rectangle",
                                origin: {x: 20 + j * 40 + offsetWaterH, y: 20 + i * 40 + 18},
                                width: 22 - width,
                                height: 4,
                                fill: WATER_COLOR,
                            });
                        }
                    } else if (this.board[i][j] === P_CROSS) {
                        this.addBackgroundPiece(i, j, listOfForms);
                        if (this.flood[i][j][0] > this.flood[i][j][1]) {
                            this.fillCrossH(listOfForms, i, j);
                            this.fillCrossV(listOfForms, i, j);
                        } else {
                            this.fillCrossV(listOfForms, i, j);
                            this.fillCrossH(listOfForms, i, j);
                        }
                    }
                }
            }
        }
        return listOfForms;
    }

    fillCrossH(listOfForms, i, j) {
        let width = 40, offsetPipeH = 0, offsetWaterH = 0;
        if (this.flood[i][j][1] === 100) {
            listOfForms.push({
                type: "rectangle",
                origin: {x: 20 + j * 40, y: 20 + i * 40 + 18},
                width: 40,
                height: 4,
                fill: WATER_COLOR,
            });
        } else {
            if (this.flood[i][j][1] > 0) {
                if (this.floodDirection === P_LEFT || this.floodDirection === P_RIGHT) {
                    offsetPipeH = this.floodDirection === P_LEFT ? 0 : this.flood[i][j][1] / 100 * 40;
                    offsetWaterH = this.floodDirection === P_LEFT ? 40 - this.flood[i][j][1] / 100 * 40 : 0;
                    width = 40 - this.flood[i][j][1] / 100 * 40;
                }
            }
            if (this.flood[i][j][1] < 100) {
                listOfForms.push({
                    type: "rectangle",
                    origin: {x: 20 + j * 40 + offsetPipeH, y: 20 + i * 40 + 18},
                    width: width,
                    height: 4,
                    fill: "black",
                });
            }
            if (this.flood[i][j][1] > 0) {
                listOfForms.push({
                    type: "rectangle",
                    origin: {x: 20 + j * 40 + offsetWaterH, y: 20 + i * 40 + 18},
                    width: 40 - width,
                    height: 4,
                    fill: WATER_COLOR,
                });
            }
        }
    }

    fillCrossV(listOfForms, i, j) {
        let height = 40, offsetPipeV = 0, offsetWaterV = 0;
        if (this.flood[i][j][0] === 100) {
            listOfForms.push({
                type: "rectangle",
                origin: {x: 20 + j * 40 + 18, y: 20 + i * 40},
                width: 4,
                height: 40,
                fill: WATER_COLOR,
            });
        } else {
            if (this.flood[i][j][0] > 0) {
                if (this.floodDirection === P_DOWN || this.floodDirection === P_UP) {
                    offsetPipeV = this.floodDirection === P_DOWN ? this.flood[i][j][0] / 100 * 40 : 0;
                    offsetWaterV = this.floodDirection === P_DOWN ? 0 : 40 - this.flood[i][j][0] / 100 * 40;
                    height = 40 - this.flood[i][j][0] / 100 * 40;
                }
            }
            if (this.flood[i][j][0] < 100) {
                listOfForms.push({
                    type: "rectangle",
                    origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetPipeV},
                    width: 4,
                    height: height,
                    fill: "black",
                });
            }
            if (this.flood[i][j][0] > 0) {
                listOfForms.push({
                    type: "rectangle",
                    origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + offsetWaterV},
                    width: 4,
                    height: 40 - height,
                    fill: WATER_COLOR,
                });
            }
        }
    }

    addBackgroundPiece(i, j, listOfForms) {
        listOfForms.push({
            type: "rectangle",
            origin: {x: 20.5 + j * 40, y: 20.5 + i * 40},
            width: 39,
            height: 39,
            stroke: "#444444",
            fill: "#ececec",
            lineWidth: 1,
        });
    }

    // Redessine tous les calques après un redimensionnement de la fenêtre
    refreshView() {
        this.Canvas.drawCanvas();
        this.refreshBoard();
    }

    // Redessine le calque de jeu avec les tuyaux et l'eau
    refreshBoard() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[0], this.Canvas.layerElements[0]);
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[0], this.generatePieces());
    }

    refreshNextPieces() {
        for (let k = 0; k < 5; k++) {
            let element = $(this.nextPieces_div[k]);
            let next = this.next[4 - k];
            if (next === P_LINE_V) {
                element.html(`<svg width="80" height="80"><rect x="36" y ="0" width="8" height="80" style="fill:black"/></svg>`)
            } else if (next === P_LINE_H) {
                element.html(`<svg width="80" height="80"><rect x="0" y ="36" width="80" height="8" style="fill:black"/></svg>`)
            } else if (next === P_TURN_BR) {
                element.html(`<svg width="80" height="80"><rect x="36" y ="40" width="8" height="40" style="fill:black"/><rect x="36" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            } else if (next === P_TURN_BL) {
                element.html(`<svg width="80" height="80"><rect x="36" y ="40" width="8" height="40" style="fill:black"/><rect x="0" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            } else if (next === P_TURN_TR) {
                element.html(`<svg width="80" height="80"><rect x="36" y ="0" width="8" height="40" style="fill:black"/><rect x="36" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            } else if (next === P_TURN_TL) {
                element.html(`<svg width="80" height="80"><rect x="36" y ="0" width="8" height="40" style="fill:black"/><rect x="0" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            } else if (next === P_CROSS) {
                element.html(`<svg width="80" height="80"><rect x="0" y ="36" width="80" height="8" style="fill:black"/><rect x="36" y ="0" width="8" height="80" style="fill:black"/></svg>`)
            }
        }
    }


    /*---------------------- INTERFACE ----------------------------------------------*/

    loadInterface() {
        let listOfInterfaces = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 9; j++) {
                listOfInterfaces.push(new Interface(this,
                    this.playPiece,
                    {
                        id: i * j,
                        type: "rectangle",
                        origin: {
                            x: 20 + i * 40,
                            y: 20 + j * 40,
                        },
                        dimensionParameters: {width: 40, height: 40},
                        triggerAction: "click",
                    }
                ));
            }
        }
        return listOfInterfaces;
    }

}