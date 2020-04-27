<?php

try{
    $db = new PDO("mysql:host=localhost;dbname=tanguy_games;charset=utf8", "root", "", [
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_PERSISTENT => true,
    ]);
}
catch (Exception $e){
    die("Erreur : ".$e->getMessage());
}

