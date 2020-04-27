<?php

include_once "../headers/headers.php";
$session = new Session();

if (!empty($_POST)) {
    if ($_POST['action'] === "loadForm") {
        include RELATIVE_PATH['views'] . "login.phtml";
        exit;
    } elseif ($_POST['action'] === "login" || $_POST['action'] === "testLogin") {
        $User = new UserModel();
        $user = $User->getUserByEmail($_POST['email']);
        if (!empty($user) && password_verify($_POST['password'], $user['password'])) {
            if ($_POST['action'] === "login") {
                $session = new Session();
                $session->create($user);
            }
            echo "login";
            exit;
        } else if (empty($user)) {
            echo "error account";
            exit;
        } else {
            echo "wrong password";
            exit;
        }
    } elseif ($_POST['action'] === "newAccount") {
        // Création de nouveau compte en vérifiant l'unicité du nom et email
        $User = new UserModel();
        if (!$User->userEmailIsUnique($_POST['email'])) {
            echo "email exists";
            exit;
        } elseif (!$User->userNameIsUnique($_POST['name'])) {
            echo "name exists";
            exit;
        } else {
            if ($User->setNewUser($_POST)) {
                $session = new Session();
                $user = $User->getUserByEmail($_POST['email']);
                $session->create($user);
                echo "account created";
                exit;
            }
        }
    } elseif ($_POST['action'] === "changePassword") {
        // Modification du mot de passe
        $User = new UserModel();
        if ($User->updatePassword($session->getUserId(), $_POST['password'])) {
            echo "password changed";
            exit;
        }
    }
}

$menu = "login";
$template = RELATIVE_PATH['views'] . $menu;
include RELATIVE_PATH['views'] . "layout.phtml";