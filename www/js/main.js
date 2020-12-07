"use strict";

/* Déclaration des constantes */
const EASY = "0";
const NORMAL = "1";
const HARD = "2";
const DIFFICULTY = ["Facile", "Normal", "Difficile"];
const BOARD_W = 360;
const BOARD_H = 400;
const COLORS = ["white", "blue", "red", "yellow", "black", "green", "orange", "saddlebrown"];
const LEFT = 0;
const BOTTOM = 1;
const RIGHT = 2;
const TOP = 3;

/* Chargement des events */
$("#burger_button").on("click", "", {}, toggleMenuMobile);
$("#gameList li").on("click", "", {}, loadGameForm);

$(function () {
    let containerElement = $(".container");
    containerElement.on("click", "#newAccount_div", function () {
        $("#newAccount_form").slideDown(500).removeClass("hidden");
    });
    containerElement.on("click", "#newPassword_button", {}, saveNewPassword);
    containerElement.on("click", "#changePassword_div", {}, changePassword);
    containerElement.on("click", "#login_button", {}, loginUser);
    containerElement.on("click", "#newAccount_button", {}, createNewUser);
    containerElement.on("click", "#contact_button", {}, saveMessageContact);
});


