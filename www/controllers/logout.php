<?php

include_once "../headers/headers.php";
$session = new Session();

$session->destroy();

$menu = "login";
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . "layout.phtml";