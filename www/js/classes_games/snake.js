"use strict";

class Snake {

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
        this.turnLeft_button = document.getElementById("turnLeft_button");
        this.turnLeft_button.addEventListener("touchstart", this.turnLeft.bind(this));
        this.turnRight_button = document.getElementById("turnRight_button");
        this.turnRight_button.addEventListener("touchstart", this.turnRight.bind(this));
        this.ballsElement = $("#balls");
        let self = this;
        this.loadKeyBoardEvents(self);
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
        this.initBoard();
        this.refreshView();
        this.speed = 300 - this.difficulty * 100;
        this.score = 0;
        this.nbOfBalls = 0;
        this.ballsElement.text(0);
        let self = this;
        this.status = "play";
        self.oneStep();
    }

    initBoard() {
        // construction d'un tableau 2D contenant les états du jeu 30 cases x 30 cases
        // 0 : case vide
        // 1 : balle
        // 2 : balle bonus
        // 3 : tête du snake
        // 4 à n : corps du snake
        this.board = [...Array(30)].map(() => Array(30).fill(0));
        for (let i = 3; i < 8; i++) {
            this.board[15][i + 18] = i; // corps du snake
        }
        // On ajoute de la queue pour le mode Difficile
        if (this.difficulty === HARD) {
            for (let i = 0; i < 15; i++) {
                this.board[15-i][25] = 8 + i; // corps du snake
                this.board[i+1][27] = 24 + i; // corps du snake
            }
            this.board[1][26] = 23;
        }
        // On ajoute de la queue pour le mode Normal
        if (this.difficulty === NORMAL) {
            for (let i = 0; i < 15; i++) {
                this.board[15-i][25] = 8 + i; // corps du snake
            }
        }
        this.addBall("normal");
        this.drawBoard();
        this.direction = TOP;
        this.directionFree = true;
        this.buttonsEvent = [];
        this.head = {i: 15, j: 21};
        this.bonusBall = {
            position: {i: null, j: null},
            opacity: "FF",
            exists: false,
            startTime: null,
            previousTime: null,
        }
        clearTimeout(this.loopTimer);
    }

    turnLeft() {
        this.buttonsEvent.push("left");
        this.turnLeftIfAllowed();
    }

    turnLeftIfAllowed(){
        if(this.directionFree) { //pour éviter le demi tour en cas de double clic
            this.direction = this.direction === LEFT ? TOP : this.direction - 1;
            this.directionFree = false;
        }
    }

    turnRight() {
        this.buttonsEvent.push("right");
        this.turnRightIfAllowed();
    }

    turnRightIfAllowed(){
        if(this.directionFree) { //pour éviter le demi tour en cas de double clic
            this.direction = (this.direction + 1) % 4;
            this.directionFree = false;
        }
    }

    addBall(type) {
        // On cherche les cases vides puis on en tire une au sort pour mettre la balle (les bordures ne sont pas utilisées)
        let emptyCases = [];
        for (let i = 1; i < 29; i++) {
            for (let j = 1; j < 29; j++) {
                if (this.board[i][j] === 0) {
                    emptyCases.push({i: i, j: j});
                }
            }
        }
        let randomPosition = emptyCases[Math.floor(Math.random() * emptyCases.length)];
        if (type === "normal") {
            this.ball = randomPosition;
            this.board[randomPosition.i][randomPosition.j] = 1;
        } else if (type === "bonus") {
            this.bonusBall.exists = true;
            this.bonusBall.position = randomPosition;
            this.bonusBall.opacity = "FF";
            this.bonusBall.startTime = this.roundTime.seconds;
            this.bonusBall.previousTime = this.roundTime.seconds;
            this.board[randomPosition.i][randomPosition.j] = 2;
        }
    }

    oneStep() {
        let self = this;
        this.loopTimer = setTimeout(function () {
            if (self.status === "play") {
                self.moveSnake();
                if (self.status === "play") {
                    self.refreshBoard();
                    self.oneStep();
                }
            }
        }, this.speed);
    }

    moveSnake() {
        let max = {i: 0, j: 0, value: 0};
        for (let i = 0; i < 30; i++) {
            for (let j = 0; j < 30; j++) {
                if (this.board[i][j] > 2) {
                    this.board[i][j]++;
                    if (this.board[i][j] > max.value) {
                        max = {i: i, j: j, value: this.board[i][j]};
                    }
                }
            }
        }
        let nextPosition;
        if (this.direction === TOP) {
            nextPosition = {i: this.head.i, j: this.head.j - 1};
            this.head.j--;
        } else if (this.direction === BOTTOM) {
            nextPosition = {i: this.head.i, j: this.head.j + 1};
            this.head.j++;
        } else if (this.direction === RIGHT) {
            nextPosition = {i: this.head.i - 1, j: this.head.j};
            this.head.i--;
        } else if (this.direction === LEFT) {
            nextPosition = {i: this.head.i + 1, j: this.head.j};
            this.head.i++;
        }
        if (nextPosition.i < 0 || nextPosition.i > 29 || nextPosition.j < 0 || nextPosition.j > 29 || this.board[nextPosition.i][nextPosition.j] > 2) {
            this.endGame();
        } else if (nextPosition.i === this.ball.i && nextPosition.j === this.ball.j) {
            this.ballsElement.text(++this.score);
            this.nbOfBalls++;
            this.addBall("normal");
            this.board[nextPosition.i][nextPosition.j] = 3;
            this.testIfAccelerate();
        } else if (this.bonusBall.exists && nextPosition.i === this.bonusBall.position.i && nextPosition.j === this.bonusBall.position.j) {
            this.score += 3;
            this.nbOfBalls++;
            this.ballsElement.text(this.score);
            this.bonusBall.exists = false;
            this.bonusBall.position = {i: null, j: null};
            this.board[nextPosition.i][nextPosition.j] = 3;
            this.testIfAccelerate();
        } else {
            // on efface la queue
            this.board[max.i][max.j] = 0;
            this.board[nextPosition.i][nextPosition.j] = 3;
        }
        // on ajoute aléatoirement une balle bonus
        if (Math.random() * (400 - this.speed) < 1 && !this.bonusBall.exists) {
            this.addBall("bonus");
            this.bonusBall.exists = true;
        }
        if (this.bonusBall.exists) {
            let difference = this.roundTime.seconds - this.bonusBall.startTime;
            if (this.bonusBall.previousTime !== this.roundTime.seconds) {
                this.bonusBall.opacity = (parseInt(this.bonusBall.opacity, 16) - 17).toString(16);
                this.bonusBall.previousTime = this.roundTime.seconds;
            }
            if (difference > 12) {
                // on supprime la balle bonus
                this.bonusBall.exists = false;
                this.bonusBall.opacity = "FF";
                this.board[this.bonusBall.position.i][this.bonusBall.position.j] = 0;
                this.bonusBall.position = {i: null, j: null};
            }
        }
        this.directionFree = true; // on autorise de nouveau de tourner (pour éviter le demi tour en cas de double clic)
        this.buttonsEvent.shift();
        if(this.buttonsEvent.length){
            if(this.buttonsEvent[0] === "left"){
                this.turnLeftIfAllowed();
            }else{
                this.turnRightIfAllowed();
            }
        }
    }

    testIfAccelerate() {
        // on accélère
        if (this.nbOfBalls % 5 === 0 && this.speed > 30) {
            this.speed = Math.ceil(this.speed * (0.9 + (0.03 - this.difficulty * 0.01)));
        }
    }

    endGame() {
        this.roundTime.pause();
        this.status = "lost";
        setTimeout(() => {
            alert("Partie terminée !\n - Score : " + this.score + " pts");
            new Score(this.gameId, this.score, this.difficulty).saveScore();
        }, 1000);
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
        this.Canvas.drawListOfForms(this.Canvas.layerContexts[0], this.generateSnakeForm());
    }

    // Génère les formes pour le calque du plateau (snake et balle)
    generateSnakeForm() {
        let listOfForms = [];
        for (let i = 0; i < 30; i++) {
            for (let j = 0; j < 30; j++) {
                if (this.board[i][j] === 1) {
                    // La balle
                    listOfForms.push({
                        type: "circle",
                        origin: {x: i * 10 + 35, y: j * 10 + 55},
                        radius: 5,
                        fill: "blue",
                        shadow: {
                            shadowColor: "white",
                            shadowBlur: 5,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                        }
                    });
                } else if (this.board[i][j] === 2) {
                    // La balle bonus
                    listOfForms.push({
                        type: "circle",
                        origin: {x: i * 10 + 35, y: j * 10 + 55},
                        radius: 5,
                        fill: "#FF0000" + this.bonusBall.opacity,
                        stroke: "#FF000066",
                        shadow: {
                            shadowColor: "white",
                            shadowBlur: 5,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                        }
                    });
                } else if (this.board[i][j] === 3) {
                    // La tête du snake
                    let sign1, sign2;
                    if (this.direction === TOP) {
                        sign1 = 1;
                        sign2 = 0;
                    } else if (this.direction === BOTTOM) {
                        sign1 = -1;
                        sign2 = 0;
                    } else if (this.direction === RIGHT) {
                        sign1 = 0;
                        sign2 = 1;
                    } else if (this.direction === LEFT) {
                        sign1 = 0;
                        sign2 = -1;
                    }
                    listOfForms.push({
                            type: "polygon",
                            points: [
                                {x: i * 10 + 35 + sign2 * 5 - Math.abs(sign1) * 5, y: j * 10 + 55 + sign1 * 5 + sign2 * 5},
                                {x: i * 10 + 35 - sign2 - Math.abs(sign1) * 4, y: j * 10 + 55 - sign1 + sign2 * 4},
                                {x: i * 10 + 35 - sign2 * 5, y: j * 10 + 55 - sign1 * 5},
                                {x: i * 10 + 35 - sign2 + Math.abs(sign1) * 4, y: j * 10 + 55 - sign1 - sign2 * 4},
                                {x: i * 10 + 35 + sign2 * 5 + Math.abs(sign1) * 5, y: j * 10 + 55 + sign1 * 5 - sign2 * 5},
                            ],
                            fill: "chartreuse",
                            stroke: "black",
                            shadow: {
                                shadowColor: "white",
                                shadowBlur: 2,
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,
                            }
                        },
                        {
                            type: "circle",
                            origin: {x: i * 10 + 35 - Math.abs(sign1) * 4, y: j * 10 + 55 - Math.abs(sign2) * 4},
                            radius: 1,
                            fill: "red",
                            shadow: {
                                shadowColor: "black",
                                shadowBlur: 2,
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,
                            }
                        },
                        {
                            type: "circle",
                            origin: {x: i * 10 + 35 + Math.abs(sign1) * 4, y: j * 10 + 55 + Math.abs(sign2) * 4},
                            radius: 1,
                            fill: "red",
                            shadow: {
                                shadowColor: "black",
                                shadowBlur: 2,
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,
                            }
                        },
                        {
                            type: "polygon",
                            points: [
                                {x: i * 10 + 35 - sign2 * 5, y: j * 10 + 55 - sign1 * 5},
                                {x: i * 10 + 35 - sign2 * 7, y: j * 10 + 55 - sign1 * 7},
                                {
                                    x: i * 10 + 35 - Math.abs(sign1) - sign2 * 9,
                                    y: j * 10 + 55 - sign1 * 9 - Math.abs(sign2)
                                },
                                {x: i * 10 + 35 - sign2 * 7, y: j * 10 + 55 - sign1 * 7},
                                {
                                    x: i * 10 + 35 + Math.abs(sign1) - sign2 * 9,
                                    y: j * 10 + 55 - sign1 * 9 + Math.abs(sign2)
                                },
                                {x: i * 10 + 35 - sign2 * 7, y: j * 10 + 55 - sign1 * 7},
                            ],
                            fill: "red",
                            stroke: "red",
                        }
                    );
                } else if (this.board[i][j] > 2) {
                    // Le corps du snake
                    listOfForms.push({
                        type: "rectangle",
                        lineWidth: 1,
                        origin: {x: i * 10 + 30, y: j * 10 + 50},
                        width: 10,
                        height: 10,
                        fill: "green",
                        shadow: {
                            shadowColor: "white",
                            shadowBlur: 2,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                        }
                    });
                }
            }
        }
        return listOfForms;
    }

    /*---------------------- INTERFACE ----------------------------------------------*/

    loadKeyBoardEvents(self) {
        $(document).on("keyup", function (event) {
            // pour éviter le scroll de la page web avec les flèches haut et bas
            document.onkeydown = function (event) {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault();
                }
            };
            if (event.key === "ArrowRight") {
                if (self.direction !== RIGHT) {
                    self.direction = LEFT;
                }
            } else if (event.key === "ArrowLeft") {
                if (self.direction !== LEFT) {
                    self.direction = RIGHT;
                }
            } else if (event.key === "ArrowUp") {
                if (self.direction !== BOTTOM) {
                    self.direction = TOP;
                }
            } else if (event.key === "ArrowDown") {
                if (self.direction !== TOP) {
                    self.direction = BOTTOM;
                }
            }
        });
    }
}