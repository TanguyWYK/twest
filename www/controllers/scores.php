<?php

include_once "../headers/headers.php";
$session = new Session();

$Games = new GameModel();
$gameNames = $Games->getGameNames();

$bestScores = $Games->getBestScores();

$menu = "scores";
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . "layout.phtml";