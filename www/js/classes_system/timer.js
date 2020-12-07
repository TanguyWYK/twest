"use strict";

/**
 *
 *  Class qui gère un chronomètre pour les jeux
 *
 *
 *
 */

class Timer {
    constructor(startSeconds) {
        this.displayElement = $("#time");
        this.reset(startSeconds);
    }

    pause() {
        this.paused = true;
        let time = new Date().getTime();
        this.waitMilliseconds = (time - this.time) % 1000;
    }

    start() {
        if (this.paused === true) { // pour éviter d'avoir une double fréquence
            this.paused = false;
            let self = this;
            this.seconds -= 1;
            setTimeout(function () {
                self.time = new Date().getTime() - self.waitMilliseconds;
                self.run(self);
            }, 1000 - this.waitMilliseconds);
        }
    }

    reset(startSeconds) {
        this.time = new Date().getTime();
        clearTimeout(this.chronometer);
        this.displayElement.text(this.convertSecondToMinSec(0));
        this.seconds = startSeconds;
        this.waitMilliseconds = 0;
        this.paused = false;
        this.run(this);
    }

    run(self) {
        let time = new Date().getTime();
        let error = (time - self.time) % 1000;
        //console.log(error);
        this.chronometer = setTimeout(function () {
            self.seconds++;
            if (!self.paused) {
                self.displayElement.text(self.convertSecondToMinSec(self.seconds));
                self.run(self);
            }
        }, 1000 - error);
    }

    convertSecondToMinSec(time) {
        let minutes = Math.floor(time / 60);
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        let seconds = time % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes + ":" + seconds;
    }

    getMilliseconds() {
        return new Date().getTime() - this.time;
    }
}