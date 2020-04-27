"use strict";

/* Fonction qui vérifie si les champs de message de contact sont corrects */
function checkIfContactInputsAreValid(email, subject, message) {
    if (/\S+@\S+\.\S+/.test(email) === false) {
        $("#contact_email").trigger('focus');
        return "Le format d'email est non valide";
    } else if (subject === "") {
        $("#contact_subject").trigger('focus');
        return "Veuillez indiquer le sujet de votre message";
    } else if (message === "") {
        $("#contact_message").trigger('focus');
        return "Le message est vide";
    }
    return "";
}

/* Fonction qui vérifie si les champs de login sont corrects */
function checkIfLoginInputsAreValid(email, password) {
    if (/\S+@\S+\.\S+/.test(email) === false) {
        $("#login_email").trigger('focus');
        return "Le format d'email est non valide";
    } else if (password === "" || password.length < 8) {
        $("#login_password").trigger('focus');
        return "Le mot de passe doit faire au moins 8 caractères";
    }
    return "";
}

/* Fonction qui vérifie si les champs de création de compte sont corrects */
function checkIfNewAccountInputsAreValid(email, password, confirmPassword, name) {
    if (/\S+@\S+\.\S+/.test(email) === false) {
        $("#login_email").trigger('focus');
        return "Le format d'email est non valide";
    } else if (password !== confirmPassword) {
        return "Les deux mots de passes sont différents"
    } else if (password === "" || password.length < 8) {
        $("#login_password").trigger('focus');
        return "Le mot de passe doit faire au moins 8 caractères";
    } else if (name === "") {
        return "Veuillez choisir un nom";
    }
    return "";
}

/* Fonction qui vérifie si les champs de changement de mot de passe sont corrects */
function checkIfNewPasswordInputsAreValid(password, confirmPassword) {
    if (password !== confirmPassword) {
        return "Les deux mots de passes sont différents"
    } else if (password === "" || password.length < 8) {
        $("#new_password").trigger('focus');
        return "Le mot de passe doit faire au moins 8 caractères";
    }
    return "";
}