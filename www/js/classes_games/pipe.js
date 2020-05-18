"use strict";

const P_START_T = 1, P_START_L = 2, P_START_B = 3, P_START_R = 4, P_LINE_V = 20, P_LINE_H = 21, P_TURN_BR = 22,
    P_TURN_BL = 23, P_TURN_TR = 24, P_TURN_TL = 25, P_CROSS = 26;

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
        this.initGame();

    }

    loadEventListeners() {
        let self = this;
        let timerId;
        this.message = $(".message");
        this.nextPieces_div = $("#nextPieces div");
        window.onresize = function () {
            clearTimeout(timerId); // pour éviter de déclencher l'event plusieurs fois lors d'un même resize
            timerId = setTimeout(function () {
                self.refreshView();
            }, 200);
        };
    }

    initGame() {
        this.roundTime.seconds = -1;
        this.score = 0;
        this.level = 1;
        this.board = [];
        for (let i = 0; i < 9; i++) {
            let row = [0, 0, 0, 0, 0, 0, 0, 0];
            this.board.push(row);
        }
        let startDirection = Math.floor(Math.random() * 4) + 1;
        let position = {i: Math.floor(Math.random() * 7 + 1), j: Math.floor(Math.random() * 6 + 1)};
        this.board[position.i][position.j] = startDirection;
        this.next = [0, 0, 0, 0, 0];
        for (let k = 0; k < 5; k++) {
            this.pickNextPiece();
        }
        this.refreshBoard();
        this.refreshNextPieces();
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
        if (self.board[position.i][position.j] >= 20 || self.board[position.i][position.j] === 0) {
            self.board[position.i][position.j] = self.next[0];
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
        //this.next.push(P_CROSS);
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
                    if (this.board[i][j] === P_START_T) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40},
                            width: 4,
                            height: 20,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_START_L) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40, y: 20 + i * 40 + 18},
                            width: 20,
                            height: 4,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_START_B) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20},
                            width: 4,
                            height: 20,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_START_R) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 20, y: 20 + i * 40 + 18},
                            width: 20,
                            height: 4,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_LINE_V) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40},
                            width: 4,
                            height: 40,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_LINE_H) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40, y: 20 + i * 40 + 18},
                            width: 40,
                            height: 4,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_TURN_BR) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20},
                            width: 4,
                            height: 20,
                            fill: "#000000",
                        });
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 18},
                            width: 22,
                            height: 4,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_TURN_BL) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40 + 20},
                            width: 4,
                            height: 20,
                            fill: "#000000",
                        });
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40, y: 20 + i * 40 + 18},
                            width: 22,
                            height: 4,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_TURN_TR) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40},
                            width: 4,
                            height: 22,
                            fill: "#000000",
                        });
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 20, y: 20 + i * 40 + 18},
                            width: 20,
                            height: 4,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_TURN_TL) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40},
                            width: 4,
                            height: 22,
                            fill: "#000000",
                        });
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40, y: 20 + i * 40 + 18},
                            width: 20,
                            height: 4,
                            fill: "#000000",
                        });
                    } else if (this.board[i][j] === P_CROSS) {
                        this.addBackgroundPiece(i,j,listOfForms);
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40 + 18, y: 20 + i * 40},
                            width: 4,
                            height: 40,
                            fill: "#000000",
                        });
                        listOfForms.push({
                            type: "rectangle",
                            origin: {x: 20 + j * 40, y: 20 + i * 40 + 18},
                            width: 40,
                            height: 4,
                            fill: "#000000",
                        });
                    }
                }
            }
        }
        return listOfForms;
    }

    addBackgroundPiece(i,j,listOfForms){
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
            if(next === P_LINE_V){
                element.html(`<svg width="80" height="80"><rect x="36" y ="0" width="8" height="80" style="fill:black"/></svg>`)
            }else if(next === P_LINE_H){
                element.html(`<svg width="80" height="80"><rect x="0" y ="36" width="80" height="8" style="fill:black"/></svg>`)
            }else if(next === P_TURN_BR){
                element.html(`<svg width="80" height="80"><rect x="36" y ="40" width="8" height="40" style="fill:black"/><rect x="36" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            }else if(next === P_TURN_BL){
                element.html(`<svg width="80" height="80"><rect x="36" y ="40" width="8" height="40" style="fill:black"/><rect x="0" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            }else if(next === P_TURN_TR){
                element.html(`<svg width="80" height="80"><rect x="36" y ="0" width="8" height="40" style="fill:black"/><rect x="36" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            }else if(next === P_TURN_TL){
                element.html(`<svg width="80" height="80"><rect x="36" y ="0" width="8" height="40" style="fill:black"/><rect x="0" y ="36" width="44" height="8" style="fill:black"/></svg>`)
            }else if(next === P_CROSS){
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