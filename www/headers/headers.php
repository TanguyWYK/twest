<?php

/* Definition des chemins relatif et absolu */
define("ABSOLUTE_PATH", substr(__DIR__, 0, -7));
define("RELATIVE_PATH", [
    "controllers" => ABSOLUTE_PATH . "controllers/",
    "models" => ABSOLUTE_PATH . "models/",
    "classes" => ABSOLUTE_PATH . "classes/",
    "views" => ABSOLUTE_PATH . "views/",
    "views_forms" => ABSOLUTE_PATH . "views/forms/",
    "views_boards" => ABSOLUTE_PATH . "views/boards/",
    "headers" => ABSOLUTE_PATH . "headers/",
    "database" => ABSOLUTE_PATH . "database/",
]);

/* Constantes*/
const EASY = "0";
const NORMAL = "1";
const HARD = "2";
const BOARD_W = 360;
const BOARD_H = 400;
const DIFFICULTY = ["Facile", "Normal", "Difficile"];

/* Include des modèles */
include RELATIVE_PATH['models'] . "GameModel.php";
include RELATIVE_PATH['models'] . "UserModel.php";
include RELATIVE_PATH['models'] . "ContactModel.php";

/* Include des classes */
include RELATIVE_PATH['classes'] . "Session.php";

/* Fonction pour charger une icône en svg */
function icon($name, $dimensions)
{
    return '<svg class="icons i_' . $dimensions . '" role="img"><use xlink:href="css/icons/fonts-defs.svg#' . $name . '"></use></svg>';
}

/* Fonction pour convertir une datetime en date fr */
function dateFr($date)
{
    $dateParts = explode('-', substr($date, 0, 10));
    return $dateParts[2] . "/" . $dateParts[1] . "/" . $dateParts[0];
}