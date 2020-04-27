<?php

include_once "../headers/headers.php";
$session = new Session();

$menu = "error";
$error = "404";
$message = "Une erreur c'est produite, cette page introuvable !";
if (!empty($_GET) && isset($_GET['e'])) {
    if ($_GET['e'] === "500") {
        $error = "500";
        $message = "Le serveur rencontre un problème, veuillez nous excuser";
    }
}
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . "layout.phtml";