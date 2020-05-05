"use strict";

class Mastermind {

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

    loadEventListeners() {
        this.newGame_button = $(".newGame_button");
        this.try_button = $(".try_button");
        this.clear_button = $(".clear_button");
        this.newGame_button.on("click", this.newGame.bind(this));
        this.try_button.on("click", this.testSolution.bind(this));
        this.clear_button.on("click", this.clearLine.bind(this));
        this.message = $(".message");
        let paletteElement = $("#colorsPalette div");
        paletteElement.on("mousedown", (event) => {
            paletteElement.removeClass("selected");
            event.target.classList.add("selected");
            this.colorSelected = parseInt(event.target.dataset.color);
        });
        let canvasElement = $("#canvas_tooltip");
        canvasElement.on("mouseout", this.clearMouseLayer.bind(this));
        let timerId;
        let self = this;
        this.Canvas.canvasDivElement.style.cursor = "default"; // pour afficher la souris
        this.defaultCursor = true;
        window.onresize = function () {
            clearTimeout(timerId); // pour éviter de déclencher l'event plusieurs fois lors d'un même resize
            timerId = setTimeout(function () {
                self.refreshView();
            }, 200);
        };
    }

    initGame() {
        if(this.round === 3){
            this.newGame_button.text("Abandonner");
        }
        if (this.round < 4) {
            this.test = this.difficulty === HARD ? [null, null, null, null, null] : [null, null, null, null];
            this.tries = 0;
            this.status = "test";
            this.colorSelected = null;
            this.oldTurns = [];
            $("#round").text(this.round);
            $("#score").text(this.score);
            $("#colorsPalette div").removeClass("selected");
            if (this.difficulty === EASY) {
                this.secret = [1, 1, 1, 1].map(x => x * Math.floor(Math.random() * 5));
            } else if (this.difficulty === NORMAL) {
                this.secret = [1, 1, 1, 1].map(x => x * Math.floor(Math.random() * 8));
            } else if (this.difficulty === HARD) {
                this.secret = [1, 1, 1, 1, 1].map(x => x * Math.floor(Math.random() * 8));
            }
        }
   }

    newGame() {
        this.roundTime.reset(0);
        if (this.status === "test") {
            this.score += 12; // pénalité en cas d'abandon
            this.totalTime += 900; // pénalité en cas d'abandon
            this.round++;
            if (this.round === 4) {
                this.endGame();
            }
        }
        this.initGame();
        this.Canvas.clearLayer(this.Canvas.layerContexts[0], this.Canvas.layerElements[0]);
        this.resetView();
        // On réactive les boutons désactivés lors d'une fin de partie
        this.newGame_button.prop("disabled", false).removeClass("disabled");
        this.try_button.prop("disabled", false).removeClass("disabled");
        this.clear_button.prop("disabled", false).removeClass("disabled");
        this.Canvas.canvasDivElement.style.cursor = "default"; // pour afficher la souris
        this.defaultCursor = true;
        this.showMessage("");
    }

    // Quand le joueur ajoute un pion
    addColor(position) {
        if (this.tries < 12 && this.status === "test") {
            this.test[position] = this.colorSelected;
            this.resetView();
            this.drawTestChoice(this.Canvas.layerContexts[1], this.test, this.tries);
        }
    }

    // Affiche un message personnalisé
    showMessage(text) {
        if (text !== null) {
            this.message.fadeOut(0).fadeIn(300).html(text);
        }
    }

    // Fait le calcul pour vérifier la combinaison testée
    testSolution() {
        let arrayTest = [...this.test]; // clone pour ne pas modifier la valeur avec splice
        let secretColors = [...this.secret];
        let goodPosition = 0;
        let wrongPosition = 0;
        let colorToDelete = new Array(this.secret.length).fill(false);
        let length = this.secret.length;
        // 1) Test des bonnes couleurs bien placées
        for (let i = 0; i < length; i++) {
            if (arrayTest[i] === secretColors[i]) {
                goodPosition++;
                colorToDelete[i] = true;
            }
        }
        // 2) Suppression des pions pour ne plus les compter
        for (let i = length - 1; i >= 0; i--) { // on commence par la fin pour éviter les problèmes d'indice avec le splice
            if (colorToDelete[i]) {
                secretColors.splice(i, 1);
                arrayTest.splice(i, 1);
            }
        }
        // 3) Test des bonnes couleurs mais mal placées
        length = arrayTest.length;
        for (let i = 0; i < length; i++) {
            let lengthColorRemaining = secretColors.length;
            for (let j = 0; j < lengthColorRemaining; j++) {
                if (arrayTest[i] === secretColors[j]) {
                    wrongPosition++;
                    secretColors.splice(j, 1);
                    break;
                }
            }
        }
        this.drawAdvice(goodPosition, wrongPosition, this.tries); // Dessine les pions d'indice
        this.drawTestChoice(this.Canvas.layerContexts[0], this.test, this.tries); // Dessine sur le calque principal les pions testés
        this.tries++;
        let message;
        if (goodPosition === this.secret.length) {
            // Le joueur a gagné
            message = this.gameWon();
        } else if (this.tries === 12) {
            // Le joueur a perdu
            message = this.gameLost();
        } else {
            // On passe au coup suivant
            message = this.gameNextTurn(goodPosition, wrongPosition);
        }
        this.showMessage(message); // Affichage d'un message
        if (this.round === 4) {
            this.endGame();
        }
    }

    gameWon() {
        this.endRound("won");
        return `<p>Bravo c'est trouvé en ${this.tries} coups !</p>`;
    }

    gameLost() {
        this.endRound("lost")
        return `<p>Dommage c'est perdu !</p>`;
    }

    endRound(status) {
        this.status = status;
        this.drawSecret();
        this.score += this.tries;
        this.round++;
        this.try_button.prop("disabled", true).addClass("disabled");
        this.clear_button.prop("disabled", true).addClass("disabled");
        this.roundTime.pause();
        this.totalTime += this.roundTime.seconds;
    }

    gameNextTurn(goodPosition, wrongPosition) {
        let message = null;
        this.resetView();
        if (this.test.includes(null)) {
            message = `<p>Attention à mettre tous les pions ! C'est dommage !</p>`
        }
        this.oldTurns.push({
            goodPosition: goodPosition,
            wrongPosition: wrongPosition,
            test: this.test,
        });
        this.test = [null, null, null, null];
        $("#score").text(this.score + this.tries);
        return message;
    }

    endGame() {
        $("#score").text(this.score);
        this.roundTime.pause();
        this.totalTime += this.roundTime.seconds;
        let timePoints = Math.round(Math.max((2000 - this.totalTime) / 2, 0));
        let score = (36 - this.score) * 31;
        this.newGame_button.prop("disabled", true).addClass("disabled");
        setTimeout(() => {
            alert("Partie terminée !\n - Score (nb essais : " + this.score + ") : " + score + " pts\n - Bonus temps (" + this.roundTime.convertSecondToMinSec(this.totalTime) + ") : " + timePoints + "pts\nTotal : " + (score + timePoints) + "pts");
            this.score += timePoints;
            new Score(this.gameId, score + timePoints, this.difficulty).saveScore();
        }, 1000);
    }

    /*---------------------- GRAPHISME ----------------------------------------------*/

    // Vide la ligne de pions non testée si annulation
    clearLine() {
        this.test = [null, null, null, null];
        this.resetView();
    }

    // Fonction qui efface le canvas avec le curseur de la souris
    clearMouseLayer() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[2], this.Canvas.layerElements[2]);
    }

    // Génère tous les pions à soumettre
    generateListOfFormsOfTest(test, turnNumber) {
        let listOfForms = [];
        let length = test.length;
        for (let i = 0; i < length; i++) {
            if (test[i] !== null) {
                listOfForms.push(this.generateFormOfOneTest(i, test, turnNumber));
            }
        }
        return listOfForms;
    }

    // Génère un pion test
    generateFormOfOneTest(position, test, turnNumber) {
        let origin = {x: this.offsetFirstPiece + position * this.spaceBetweenPiece, y: 380 - turnNumber * 30};
        return this.generateFormOfOnePieceEveryWhere(origin, COLORS[test[position]]);
    }

    // Génère un pion à la position souhaité
    generateFormOfOnePieceEveryWhere(origin, color) {
        return {
            type: "circle",
            origin: origin,
            radius: 8,
            fill: color,
            stroke: "black",
            shadow: {
                shadowColor: "black",
                shadowBlur: 2,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
            },
        };
    }

    // Génère les pions de la combinaison secrète
    generateListOfFormsOfSecret() {
        let listOfForms = [];
        let length = this.secret.length;
        for (let i = 0; i < length; i++) {
            listOfForms.push({
                type: "circle",
                origin: {x: this.offsetFirstPiece + i * this.spaceBetweenPiece, y: 20},
                radius: 8,
                fill: COLORS[this.secret[i]],
                stroke: "black",
                shadow: {
                    shadowColor: "black",
                    shadowBlur: 2,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                },
            });
        }
        return listOfForms;
    }

    // Dessine les pions des indices
    drawAdvice(goodPosition, wrongPosition, turnNumber) {
        let listOfForms = [];
        for (let i = 0; i < goodPosition; i++) {
            listOfForms.push(this.generateFormAdvice("fuchsia", listOfForms.length, turnNumber));
        }
        for (let i = 0; i < wrongPosition; i++) {
            listOfForms.push(this.generateFormAdvice("white", listOfForms.length, turnNumber));
        }
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[0], listOfForms);
    }

    // Génère le pion d'un indice
    generateFormAdvice(color, length, turnNumber) {
        return {
            type: "circle",
            origin: {x: this.offsetFirstResponse + length * this.spaceBetweenResponse, y: 380 - turnNumber * 30},
            radius: 4,
            fill: color,
            stroke: "black",
            shadow: {
                shadowColor: "black",
                shadowBlur: 2,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
            },
        }
    }

    // Dessine la ligne de pions sur le calque principal
    drawTestChoice(context, test, turnNumber) {
        let listOfForms = this.generateListOfFormsOfTest(test, turnNumber);
        this.Canvas.drawListOfForms(context, listOfForms);
    }

    // Dessine le plateau de jeu vierge
    drawBoard() {
        // Calcul des espaces en fonction du nombre de pions à tracer
        if (this.difficulty !== HARD) { // 4 pions
            this.spaceBetweenPiece = 26;
            this.offsetFirstPiece = 180;
            this.spaceBetweenResponse = 16;
            this.offsetFirstResponse = 95;
        } else { // 5 pions
            this.spaceBetweenPiece = 22;
            this.offsetFirstPiece = 175;
            this.spaceBetweenResponse = 14;
            this.offsetFirstResponse = 90;
        }
        // Fond du plateau de jeu
        let listOfForms = [];
        listOfForms.push({
            type: "rectangle",
            origin: {x: 80, y: 5},
            width: 200,
            height: 390,
            fill: "#ffa64d",
            stroke: "red",
            shadow: {
                shadowColor: "black",
                shadowBlur: 10,
                shadowOffsetX: 6,
                shadowOffsetY: 3,
            },
        });
        // Nervures sur le plateau
        for (let i = 0; i < 13; i++) {
            listOfForms.push({
                type: "rectangle",
                origin: {x: 80, y: 5 + i * 30},
                width: 200,
                height: 30,
                stroke: "#994d00",
                lineWidth: 1,
                shadow: {
                    shadowColor: "#994d00",
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                },
            });
        }
        // Trous sur le plateau pour le pions de couleurs
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < this.secret.length; j++) {
                listOfForms.push({
                    type: "circle",
                    origin: {x: this.offsetFirstPiece + j * this.spaceBetweenPiece, y: 380 - i * 30},
                    radius: 4,
                    fill: "black",
                    stroke: "#663300",
                    shadow: {
                        shadowColor: "#663300",
                        shadowBlur: 1,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                    },
                });
            }
        }
        // Trous sur le plateau pour les pions des indices
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < this.secret.length; j++) {
                listOfForms.push({
                    type: "circle",
                    origin: {x: this.offsetFirstResponse + j * this.spaceBetweenResponse, y: 380 - i * 30},
                    radius: 2,
                    fill: "black",
                });
            }
        }
        return listOfForms;
    }

    // Dessine le capot de la combinaison secrète
    drawSecretCover() {
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[1], [
            {
                type: "polygon",
                points: [
                    {x: 166, y: 25},
                    {x: 168, y: 30},
                    {x: 274, y: 30},
                    {x: 276, y: 25},
                ],
                fill: "#8e2525",
                stroke: "black",
            },
            {
                type: "polygon",
                points: [
                    {x: 166, y: 10},
                    {x: 166, y: 25},
                    {x: 276, y: 25},
                    {x: 276, y: 10},
                ],
                fill: "brown",
                stroke: "black",
                shadow: {
                    shadowColor: "black",
                    shadowBlur: 3,
                    shadowOffsetX: 0,
                    shadowOffsetY: -3,
                },
            },
        ]);
    }

    // Dessine la combinaison secrète
    drawSecret() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[1], this.Canvas.layerElements[1]);
        let listOfForms = this.generateListOfFormsOfSecret();
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[0], listOfForms);

    }

    // Dessine le curseur pour voir le tour en cours
    drawCursor() {
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[1], [{
            type: "polygon",
            points: [
                {x: 60, y: 385 - this.tries * 30},
                {x: 66, y: 379 - this.tries * 30},
                {x: 60, y: 373 - this.tries * 30},
            ],
            fill: "red",
            stroke: "black",
        }]);
    }

    // Retrace le calque 1 contenant la combinaison à tester, le capot et le curseur
    resetView() {
        this.Canvas.clearLayer(this.Canvas.layerContexts[1], this.Canvas.layerElements[1]);
        this.drawSecretCover();
        this.drawCursor();
    }

    // Redessine tous les calques après un redimensionnement de la fenêtre
    refreshView() {
        this.Canvas.drawCanvas();
        this.drawCursor();
        this.drawSecretCover();
        this.drawOldTurns();
        for (let i = 0; i < this.test.length; i++) {
            if (this.test[i] !== null) {
                this.Canvas.drawListOfForms(this.Canvas.layerContexts[1], [this.generateFormOfOneTest(i, this.test, this.tries)]);
            }
        }
    }

    // Retrace les anciens coups
    drawOldTurns() {
        let length = this.oldTurns.length;
        for (let i = 0; i < length; i++) {
            let oldTurn = this.oldTurns[i];
            this.drawAdvice(oldTurn.goodPosition, oldTurn.wrongPosition, i);
            this.drawTestChoice(this.Canvas.layerContexts[0], oldTurn.test, i);
        }
    }

    /*---------------------- INTERFACE ----------------------------------------------*/
    loadInterface() {
        let listOfInterfaces = [new Interface(this,
            this.drawPieceOnMouse,
            {
                id: 0,
                type: "rectangle",
                origin: {x: 0, y: 0},
                dimensionParameters: {width: 360, height: 400},
                triggerAction: "mouseover",
            }
        )
        ];
        listOfInterfaces.push(new Interface(this,
            this.displaySolution,
            {
                id: 1,
                type: "rectangle",
                origin: {x: 166, y: 10},
                dimensionParameters: {width: 100, height: 30},
                tooltip: "Pas touche !",
                triggerAction: "click",
            }
        ));
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < this.secret.length; j++) {
                listOfInterfaces.push(new Interface(this,
                    this.addPiece,
                    {
                        id: 2 + j + i * this.secret.length,
                        type: "circle",
                        origin: {x: this.offsetFirstPiece + j * this.spaceBetweenPiece, y: 380 - i * 30},
                        dimensionParameters: {radius: 12},
                        triggerAction: "click",
                    }
                ));
            }
        }
        return listOfInterfaces;
    }

    addPiece(self, mousePosition, idAction) {
        if (self.colorSelected !== null) {
            if (Math.floor((idAction - 2) / self.secret.length) === self.tries) { // on est sur la bonne ligne
                self.addColor((idAction - 2) % self.secret.length);
                self.showMessage("");
            } else {
                self.showMessage("Vous n'êtes par sur la bonne ligne");
            }
        } else {
            self.showMessage("Il faut choisir une couleur");
        }
    }

    // Cheat code
    displaySolution(self) {
        for (let color of self.secret) {
            console.log(COLORS[color]);
        }
    }

    // Trace le pion de couleur sélectionné à la position de la souris
    drawPieceOnMouse(self, mousePosition) {
        if (self.colorSelected !== null) {
            if (self.defaultCursor) {
                // on cache le curseur par défaut de la souris
                self.Canvas.canvasDivElement.style.cursor = "none";
                self.defaultCursor = false;
            }
            self.Canvas.clearLayer(self.Canvas.layerContexts[2], self.Canvas.layerElements[2]);
            self.Canvas.drawListOfForms(self.Canvas.layerContexts[2], [self.generateFormOfOnePieceEveryWhere(mousePosition, COLORS[self.colorSelected])]);
        }
    }
}