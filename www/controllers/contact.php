<?php

include_once "../headers/headers.php";

$session = new Session();
// On récupère l'email pour préremplir le formulaire de contact
$email = "";
if ($session->isAuthenticated()) {
    $email = $session->getEmail();
}

if (!empty($_POST)) {
    if ($_POST['action'] === "newMessage") {
        $Contact = new ContactModel();
        if ($Contact->saveMessage($_POST)) {
            echo "message send";
        } else {
            echo "error message";
        }
        exit;
    }
}

$menu = "contact";
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . "layout.phtml";