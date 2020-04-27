"use strict";

/* Fonction qui vérifie la connexion de l'utilisateur */
function checkLogin(callback){
    $("#login_form").on("submit", function (event) {
        event.preventDefault();
    });
    let email = $("#login_email").val();
    let password = $("#login_password").val();
    let errorElement = $("#errorLogin");
    errorElement.text("");
    let errorMessage = checkIfLoginInputsAreValid(email, password);
    if (errorMessage === "") {
        $.post("controllers/login.php", {
            email: email,
            password: password,
            action: "login",
        }).then(function (data) {
            if (data === "login") {
                callback();
            } else {
                if (data === "error account") {
                    errorMessage = "Compte inconnu";
                } else if (data === "wrong password") {
                    errorMessage = "Mot de passe erroné"
                }
                displayErrorMessage(errorElement, errorMessage)
            }
        });
    }else {
        displayErrorMessage(errorElement, errorMessage)
    }
}

/* Fonction pour se connecter */
function loginUser() {
    checkLogin(function(){
        document.location.href = "home";
    });
}

/* Fonction pour changer le mot de passe */
function changePassword() {
    checkLogin(function(){
        $("#newPassword_form").slideDown(500).removeClass("hidden");
    });
}

/* Fonction qui créée un nouvel utilisateur */
function createNewUser() {
    $("#newAccount_form").on("submit", function (event) {
        event.preventDefault();
    });
    let email = $("#newAccount_email").val();
    let password = $("#newAccount_password").val();
    let confirmPassword = $("#newAccount_confirmPassword").val();
    let name = $("#newAccount_name").val();
    let errorElement = $("#errorNewAccount");
    errorElement.text("");
    let errorMessage = checkIfNewAccountInputsAreValid(email, password, confirmPassword, name);
    if (errorMessage === "") {
        $.post("controllers/login.php", {
            email: email,
            password: password,
            name: name,
            action: "newAccount",
        }).then(function (data) {
            if (data === "account created") {
                document.location.href = "home";
            } else {
                if (data === "email exists") {
                    errorMessage = "Le compte existe déjà, si vous avez oublié votre mot de passe, vous pouvez envoyer une demande via le formulaire de contact";
                } else if (data === "name exists") {
                    errorMessage = "Ce nom est déjà utilisé !"
                    $("#newAccount_name").trigger("focus");
                }
                displayErrorMessage(errorElement, errorMessage)
            }
        });
    } else {
        displayErrorMessage(errorElement, errorMessage)
    }
}

/* Fonction qui enregistre un nouveau message de contact */
function saveMessageContact() {
    $("#contact_form").on("submit", function (event) {
        event.preventDefault();
    });
    let email = $("#contact_email").val();
    let subject = $("#contact_subject").val();
    let message = $("#contact_message").val();
    let errorElement = $("#errorContact");
    errorElement.text("");
    let errorMessage = checkIfContactInputsAreValid(email, subject, message);
    if (errorMessage === "") {
        $.post("controllers/contact.php", {
            email: email,
            subject: subject,
            message: message,
            action: "newMessage",
        }).then(function (data) {
            if (data === "message send") {
                $("#contact_form")
                    .empty()
                    .html(`<p class="noErrorMessage">Merci pour votre message !</p>`)
                    .hide()
                    .fadeIn(600);
            } else {
                errorMessage = "Une erreur est apparue, le message n'a pas été envoyé";
                displayErrorMessage(errorElement, errorMessage);
            }
        });
    } else {
        displayErrorMessage(errorElement, errorMessage);
    }
}

/* Fonction qui sauvegarde le nouveau mot de passe */
function saveNewPassword(){
    $("#newPassword_form").on("submit", function (event) {
        event.preventDefault();
    });
    let password = $("#new_password").val();
    let confirmPassword = $("#confirm_newPassword").val();
    let errorElement = $("#errorNewPassword");
    errorElement.text("");
    let errorMessage = checkIfNewPasswordInputsAreValid(password, confirmPassword);
    if (errorMessage === "") {
        $.post("controllers/login.php", {
            password: password,
            action: "changePassword",
        }).then(function (data) {
            if(data === "password changed") {
                document.location.href = "home";
            }else {
                displayErrorMessage(errorElement, "Une erreur c'est produite");
            }
        });
    } else {
        displayErrorMessage(errorElement, errorMessage)
    }
}