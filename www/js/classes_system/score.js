"use strict";

/**
 *
 *  Class qui enregistre le score en fin de partie et qui renvoie au menu principal
 *
 *
 */


class Score {
    constructor(gameId, score, difficulty) {
        this.gameId = gameId;
        this.score = score;
        this.difficulty = difficulty;
    }

    saveScore() {
        $.post("controllers/game.php", {
            action: "saveScore",
            gameId: this.gameId,
            difficulty: this.difficulty,
            score: this.score,
        }).then(function () {
            document.location.href = "home";
        });
    }
}