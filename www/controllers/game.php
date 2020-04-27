<?php

include_once "../headers/headers.php";

$Games = new GameModel();
$gameNames = $Games->getGameNames();

$session = new Session();
// On redirige vers la page de login si l'utilisateur n'est pas connecté
if (!$session->isAuthenticated()) {
    include RELATIVE_PATH['views'] . "login.phtml";
    exit;
}

if (!empty($_POST)) {
    if ($_POST['action'] === "loadForm") {
        // Chargement du formulaires d'options de jeu
        foreach ($gameNames as $gameName) {
            if ($gameName['id'] === $_POST['gameId']) {
                include RELATIVE_PATH['views_forms'] . $gameName['file_path'] . "_form.phtml";
            }
        }
    } elseif ($_POST['action'] === "loadBoard") {
        // Chargement de la vue du plateau de jeu
        foreach ($gameNames as $gameName) {
            if ($gameName['file_path'] === $_POST['gameOptions']['gameName']) {
                include RELATIVE_PATH['views_boards'] . $gameName['file_path'] . "_board.phtml";
            }
        }
    } elseif ($_POST['action'] === "saveScore") {
        // Enregistrement d'un nouveau score
        $scoreId = $Games->saveScore($_POST, $session->getUserId());
        $Games->replaceIfBestScore($_POST, $scoreId);
        exit;
    }
}

