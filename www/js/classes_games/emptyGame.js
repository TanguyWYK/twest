"use strict";

class Taupe{

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
    }

    /*---------------------- GRAPHISME ----------------------------------------------*/

    // Dessine le plateau de jeu vierge
    drawBoard() {
        // Fond du plateau de jeu
        return [
            {
                type: "rectangle",
                origin: {x: 27, y: 47},
                width: 306,
                height: 306,
                fill: "#281200",
            },
            {
                type: "rectangle",
                origin: {x: 30, y: 50},
                width: 300,
                height: 300,
                fill: "#555555",
            },
            {
                type: "polygon",
                points: [
                    {x: 10, y: 30},
                    {x: 350, y: 30},
                    {x: 350, y: 370},
                    {x: 10, y: 370},
                    {x: 10, y: 353},
                    {x: 333, y: 353},
                    {x: 333, y: 47},
                    {x: 27, y: 47},
                    {x: 27, y: 353},
                    {x: 10, y: 353},
                ],
                stroke: "black",
                fill: "#fff5cd",
                shadow: {
                    shadowColor: "black",
                    shadowBlur: 10,
                    shadowOffsetX: 2,
                    shadowOffsetY: 6,
                },
            },
        ];
    }

    // Redessine tous les calques après un redimensionnement de la fenêtre
    refreshView() {
        this.Canvas.drawCanvas();
        this.refreshBoard();
    }

    // Redessine le calque de jeu avec le snake et la balle
    refreshBoard() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[0], this.Canvas.layerElements[0]);
        //this.Canvas.drawListOfForms(this.Canvas.layerContexts[0], this.generateSnakeForm());
    }

    // Génère le curseur à la position souhaité
    generateCursor(mousePosition) {
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