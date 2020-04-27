<?php

include_once "../headers/headers.php";
$session = new Session();

if ($session->isAdmin()) {
    $menu = "admin";
} else {
    header("Location: error");
}

if (!empty($_POST) && $session->isAdmin()) {
    if (substr($_POST['action'], 0, 12) === "getMessages_") {
        // Récupère les messages de contacts (avec un filtre sur le status : new, saved, trashed)
        $Contact = new ContactModel();
        $messages = $Contact->getMessages(substr($_POST['action'], 12));
        header('Content-Type: application/json');
        echo json_encode($messages);
    } elseif (substr($_POST['action'], 0, 14) === "updateMessage_") {
        // Change les status des messages selon les actions
        $Contact = new ContactModel();
        foreach ($_POST['messagesStatus'] as $message) {
            if (key_exists('status', $message)) {
                $Contact->updateMessageStatus($message['id'], $message['status']);
            }
        }
        header('Content-Type: application/json');
        echo json_encode($Contact->getMessages(substr($_POST['action'], 14)));
    } elseif ($_POST['action'] === "emptyTrash") {
        // Vide les messages supprimés
        $Contact = new ContactModel();
        $Contact->emptyTrash();
    } elseif ($_POST['action'] === "getScores") {
        // Récupère les scores des précédentes parties selon les filtres
        $Games = new GameModel();
        $Response = new stdClass();
        $Response->scores = $Games->getScores($_POST['filters']);
        $Response->games = $Games->getGameNames();
        header('Content-Type: application/json');
        echo json_encode($Response);
    } elseif ($_POST['action'] === "searchPlayers") {
        // Effectue une recherche de joueurs selon son email ou nom selon un coefficient de similitude
        $User = new UserModel();
        $players = $User->searchUser($_POST['name'], $_POST['email']);
        header('Content-Type: application/json');
        echo json_encode($players);
    } elseif ($_POST['action'] === "getPlayerDetails") {
        // Récupère les infos d'un joueur
        $User = new UserModel();
        $Games = new GameModel();
        $Response = new stdClass();
        $Response->player = $User->getUserById($_POST['id']);
        $Response->scores = $Games->getScoresByUserId($_POST['id']);
        $Response->games = $Games->getGameNames();
        header('Content-Type: application/json');
        echo json_encode($Response);
    }
    exit;
}

$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . "layout.phtml";