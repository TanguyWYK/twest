<?php

class Session
{
    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function create($user = [])
    {
        if ($user !== null) {
            $_SESSION['name'] = $user['name'];
            $_SESSION['id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
        }
    }

    public function destroy()
    {
        $_SESSION = [];
        session_destroy();
    }

    public function getName()
    {
        return htmlentities($_SESSION['name']);
    }

    public function getEmail()
    {
        return htmlentities($_SESSION['email']);
    }

    public function getUserId()
    {
        return $_SESSION['id'];
    }

    public function isAuthenticated()
    {
        return (array_key_exists("id", $_SESSION) && !empty($_SESSION['id']));
    }

    public function isAdmin()
    {
        return (array_key_exists("id", $_SESSION) && $_SESSION['id'] === "1");
    }

}