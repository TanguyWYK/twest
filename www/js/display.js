"use strict";

/* Fonction qui affiche le menu pour la version mobile */
function toggleMenuMobile() {
    let menuElement = $("#menu");
    if (menuElement.hasClass("hidden")) {
        menuElement.toggleClass("hidden hideMenu showMenu").slideUp(500);
    } else {
        menuElement.toggleClass("hidden showMenu hideMenu").slideDown(500);
    }
    $("#menu_open").toggleClass("hidden");
    $("#menu_close").toggleClass("hidden");
}

/* Fonction qui lance le jeu sélectionné */
function loadGameForm() {
    let gameId = this.dataset.id;
    $("main").load("controllers/game.php", {
        gameId: gameId,
        action: "loadForm",
    }, function () {
        $("#menu,#burger_button").addClass("hidden");
    });
}

/* Fonction qui charge le board du jeu */
function startGame(gameName, gameId) {
    let gameOptions = {
        difficulty: $("input[name=difficulty]:checked").val(),
        gameName: gameName,
        gameId: gameId,
    };
    $("main").load("controllers/game.php", {
        gameOptions: gameOptions,
        action: "loadBoard",
    }, function () {
        if (gameName === "mastermind") {
            new Mastermind(gameOptions);
        } else if (gameName === "puissance4") {
            new Puissance4(gameOptions);
        } else if (gameName === "taquin") {
            new Taquin(gameOptions, Math.floor(Math.random() * 4 + 1));
        } else if (gameName === "snake") {
            new Snake(gameOptions);
        }
    });
}

/* Fonction qui affiche le message d'erreur avec une animation */
function displayErrorMessage(errorElement, errorMessage) {
    errorElement
        .hide()
        .text(errorMessage)
        .fadeIn(200);
}

/* Fonction qui renvoie le svg d'une icône */
function icons(name, dimensions) {
    return '<svg class="icons i_' + dimensions + '" role="img"><use xlink:href="css/icons/fonts-defs.svg#' + name + '"></use></svg>'
}