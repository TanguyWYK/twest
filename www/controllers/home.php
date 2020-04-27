<?php

include_once "../headers/headers.php";

$session = new Session();
if (!$session->isAuthenticated()) {
    $menu = "login";
    $template = RELATIVE_PATH['views'] . $menu;
    include RELATIVE_PATH['views'] . "layout.phtml";
    exit;
}
$Games = new GameModel();
$gameNames = $Games->getGameNames();
$menu = "home";
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . "layout.phtml";