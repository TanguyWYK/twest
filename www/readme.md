PROJET 3WA Tanguy Westelynck - session ST17 - Octobre 2018 - Strasbourg 
---

####1) Introduction

J'ai décidé d'enfin faire mon projet lorsque j'ai appris qu'il y avait désormais une limite de temps pour remettre son projet.  
Je suis actuellement salarié temps plein dans une startup et je code une application scientifique sur la dépollution des sols www.kiwi-maps.com.  
J'ai commencé le projet 3WA en janvier 2020 par intermittence.  

Le sujet choisi est une plateforme de jeux basée sur l'utilisation de calques en ***canvas***.  
J'ai créé des classes pour gérer l'intéraction avec le canvas.  
Le temps passé sur ce projet est de __120 heures__ (oui j'ai tenu des comptes), répartis ainsi :
- Environnement, classes, panneau d'admin, css, mise en prod : 64h
- Jeu mastermind : 10h
- Puissance 4 : 11 h + 11 h sur l'IA
- Taquin : 14 h
- Snake : 10 h

####2) Détails fichiers
Les jeux sont codés en JS. La gestion des utilisateurs, des scores et des pages sont codées en PHP / mySQL sur le principe MVC.  
Les jeux sont responsive.

Les fichiers JS comportent :
- les ```classes_system``` : pour gérer l'environnement des calques canvas, les interactions souris sur le canvas, les scores et un chrono.
- les ```classes_games``` : chaque jeu à une classe contenant l'algoritmie du jeu, la génération du graphisme et l'initialisation des interactions souris.
- les autres fichiers JS pour gérer la page ***admin***, les différents onglets des menus et les requêtes associées.

Les fichiers CSS comportent :
- le fichier ```style.css``` contient le ***css*** général pour le layout et l'affichage des menus.
- le fichier ```button.css``` contient le style général pour les boutons et les sections de boutons. 
- le fichier ```board.css``` contient le style personnalisé pour chaque jeu.
J'ai fait le choix de ne pas faire de lien externe pour les ***fonts*** et les icônes qui sont sur le serveur (plus pratique pour travailler en local sans internet).

Les fichiers HTML/pHTML comportent :
- le layout général.
- les templates de chaque menu insérer dans le ***main*** du ***layout***.
- les formulaires de chaque jeu pour démarrer une partie dans le fichier ```views\forms```.
- les templates de chaque jeu dans le fichier ```views\boards```.

####3) Structure de la base de données
- table ```users```
- table ```games``` : contient l'id, nom et chemin (path) des jeux.
- table ```scores``` : enregistre l'historique des parties terminées.
- table ```best_scores``` : enregistre les 3 meilleurs scores de chaque jeux dans chaque difficulté,  
  cette table évite une requête sur l'historique global des parties lors de l'affichage des meilleurs scores.
- table ```messages``` : contient les messages envoyés via le formulaire de contact. 

####4) Tester le code

Place à l'action !  
www.twest.fr  
Vous pouvez créer un compte, il n'y a pas de validation par email.  
Pour tester le panneau d'admin : connectez-vous avec le compte admin fourni. 
Merci pour la correction ! 

Tanguy Westelynck 




