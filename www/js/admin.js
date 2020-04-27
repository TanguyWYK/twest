"use strict";

/*--------------------------- Event listeners --------------------------------------------------*/
$(function () {
    let containerElement = $(".container");
    containerElement.on("change", ".admin_message_select", {}, loadMessages);
    containerElement.on("change", ".admin_score_select", {}, copyScoreSelects);
    containerElement.on("click", ".admin_playerLink", {}, showPlayerDetails);
});

/*--------------------------- Messages de contact ----------------------------------------------*/

function showMessages(option) {
    $("#admin_ul li:not(#admin_messages)").removeClass("selected");
    $("#admin_messages").addClass("selected");
    $("#playerDetails_div").remove();
    $.post("controllers/admin.php", {
        action: "getMessages_" + option,
    }).then(function (data) {
        fillMessageTable(data, option);
    });
}

function fillMessageTable(data, option) {
    let selectedSaved = option === 'saved' ? "selected" : "";
    let selectedDeleted = option === 'deleted' ? "selected" : "";
    let filters = '<select class="admin_message_select">' +
        '<option value="new">Nouveaux messages</option>' +
        '<option value="saved"' + selectedSaved + '>Messages archivés</option>' +
        '<option value="deleted"' + selectedDeleted + '>Corbeille</option>' +
        '</select>';
    let buttons = '<button onclick="applyMessageActions(\'' + option + '\')">Appliquer actions</button>';
    if (data.length > 0) {
        let table = '<thead>' +
            '<tr>' +
            '<th>Date</th>' +
            '<th>Email</th>' +
            '<th>Sujet</th>' +
            '<th>Message</th>' +
            '<th>Actions</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';
        for (let message of data) {
            if (message['status'] === option) {
                table += '<tr data-id="' + message['id'] + '">' +
                    '<td>' + message['date'] + '</td>' +
                    '<td>' + message['email'] + '</td>' +
                    '<td>' + message['subject'] + '</td>' +
                    '<td class="td_50">' + message['message'] + '</td>' +
                    '<td>';
                if (option === "deleted" || option === "new") {
                    table += '<p class="messageSave adminButton" title="archiver" onclick="saveMessage($(this).parent().parent())" >' + icons('save', '16x16') + '</p>';
                }
                if (option === "saved" || option === "new") {
                    table += '<p class="messageDelete adminButton" title="supprimer" onclick="deleteMessage($(this).parent().parent())">' + icons('trash', '16x16') + '</p>';
                }
                table += '</td></tr>';
            }
        }
        table += '</tbody>';
        $("#admin_section table").empty().append(table);
        $(".admin_filters").empty().append(filters);
        $(".admin_buttons").empty().append(buttons);
        $("#errorAdmin").hide();
    } else {
        $("#admin_section table").empty();
        let text;
        if (option === "new") {
            text = "Aucun nouveau message";
        } else if (option === "saved") {
            text = "Aucun message archivé";
        } else if (option === "deleted") {
            text = "Corbeille vide";
        }
        $("#errorAdmin").hide().html("<p>" + text + "</p>").fadeIn(300);
        let filterElements = $(".admin_filters");
        filterElements.empty().append(filters);
        filterElements.last().empty();
        $(".admin_buttons").empty();
    }
    if (option === "deleted" && data.length > 0) {
        $(".admin_buttons").append('<button onclick="emptyTrash()">Vider la corbeille</button>');
    }
}

function saveMessage(element) {
    element.removeClass("deleted");
    element.toggleClass("saved");
}

function deleteMessage(element) {
    element.removeClass("saved");
    element.toggleClass("deleted");
}

function applyMessageActions(option) {
    let messagesStatus = [];
    $("tbody tr").each(function () {
        let line = $(this);
        messagesStatus.push({
            id: line.data('id'),
            status: line.attr("class"),
        });
    });
    $.post("controllers/admin.php", {
        action: "updateMessage_" + option,
        messagesStatus: messagesStatus,
    }).then(function (data) {
        fillMessageTable(data, option);
    });
}

function loadMessages() {
    let option = ($(this).find("option:selected").val());
    showMessages(option);
}

function emptyTrash() {
    $.post("controllers/admin.php", {
        action: "emptyTrash",
    }).then(function () {
        fillMessageTable([], 'deleted');
    });
}

/*--------------------------- Historique des parties ----------------------------------------------*/

function showScores(filters, callback) {
    $("#admin_ul li:not(#admin_scores)").removeClass("selected");
    $("#admin_scores").addClass("selected");
    $("#playerDetails_div").remove();
    $.post("controllers/admin.php", {
        action: "getScores",
        filters: filters,
    }).then(function (data) {
        fillScoreTable(data['scores'], data['games'], callback);
    });
}

function fillScoreTable(scores, games, callback) {
    let filters = '<select class="admin_scoreQuantity_select admin_score_select">' +
        '<option value="25">25</option>' +
        '<option value="50">50</option>' +
        '<option value="100">100</option>' +
        '</select>';
    filters += '<select class="admin_game_select admin_score_select">' +
        '<option value="all">Tous les jeux</option>';
    for (let game of games) {
        filters += '<option value="' + game['id'] + '">' + game['name'] + '</option>';
    }
    filters += '</select>';
    filters += '<select class="admin_difficulty_select admin_score_select">' +
        '<option value="all">Toutes difficultés</option>' +
        '<option value="' + EASY + '">' + DIFFICULTY[EASY] + '</option>' +
        '<option value="' + NORMAL + '">' + DIFFICULTY[NORMAL] + '</option>' +
        '<option value="' + HARD + '">' + DIFFICULTY[HARD] + '</option>' +
        '</select>';
    let buttons = '<button onclick="applyScoreFilters()">Appliquer filtres</button>';
    if (scores.length > 0) {
        let table = '<thead>' +
            '<tr>' +
            '<th>Date</th>' +
            '<th>Joueur</th>' +
            '<th>Jeu</th>' +
            '<th>Difficulté</th>' +
            '<th>Score</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';
        for (let score of scores) {
            table += '<tr data-id="' + score['id'] + '">' +
                '<td>' + score['date'] + '</td>' +
                '<td>' + score['user'] + '</td>' +
                '<td>' + games.find(game => game['id'] === score['id_game'])['name'] + '</td>' +
                '<td class="td_10">' + DIFFICULTY[score['difficulty']] + '</td>' +
                '<td>' + score['score'] + '</td>' +
                '</tr>';
        }
        table += '</tbody>';
        $("#admin_section table").empty().append(table);
        $(".admin_filters").empty().append(filters);
        $(".admin_buttons").empty().append(buttons);
        $("#errorAdmin").hide();
    } else {
        $("#admin_section table").empty();
        let filterElements = $(".admin_filters");
        filterElements.empty().append(filters);
        filterElements.last().empty();
        let buttonElement = $(".admin_buttons");
        buttonElement.empty().append(buttons);
        buttonElement.last().empty();
        $("#errorAdmin").hide().html("<p>Aucun score</p>").fadeIn(300);
    }
    if (callback !== undefined) {
        callback();
    }
}

function applyScoreFilters() {
    let filters = {
        quantity: $(".admin_scoreQuantity_select").val(),
        game: $(".admin_game_select").val(),
        difficulty: $(".admin_difficulty_select").val(),
    };
    showScores(filters, function () {
        $(".admin_scoreQuantity_select").val(filters.quantity);
        $(".admin_game_select").val(filters.game);
        $(".admin_difficulty_select").val(filters.difficulty);
    });
}

function copyScoreSelects() {
    let element = $(this);
    if (element.hasClass("admin_scoreQuantity_select")) {
        $(".admin_scoreQuantity_select").val(element.val());
    } else if (element.hasClass("admin_game_select")) {
        $(".admin_game_select").val(element.val());
    } else if (element.hasClass("admin_difficulty_select")) {
        $(".admin_difficulty_select").val(element.val());
    }
}

/*---------------------------- Recherche de joueurs ----------------------------------------------*/

function showPlayers(filters, callback) {
    $("#admin_ul li:not(#admin_players)").removeClass("selected");
    $("#admin_players").addClass("selected");
    $(".admin_buttons").empty();
    $("#playerDetails_div").remove();
    $.post("controllers/admin.php", {
        action: "searchPlayers",
        email: filters.email,
        name: filters.name,
    }).then(function (data) {
        fillPlayerTable(data, callback);
    });
}

function fillPlayerTable(data, callback) {
    let filters = '<div class="flex_div"><label for="namePlayer">nom joueur : </label><input type="text" name="namePlayer" id="namePlayer_input">' +
        '<span>ou</span><label for="emailPlayer">email joueur : </label><input type="text" name="emailPlayer" id="emailPlayer_input"></div>';
    let buttons = '<button onclick="applyPlayerFilters()">Rechercher joueur</button>';
    if (data.length > 0) {
        let table = '<thead>' +
            '<tr>' +
            '<th>Nom</th>' +
            '<th>Email</th>' +
            '<th>Date de création</th>' +
            '<th>Nombre de parties</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';
        for (let player of data) {
            table += '<tr>' +
                '<td class="admin_playerLink" data-id="' + player['player']['id'] + '">' + player['player']['name'] + '</td>' +
                '<td class="admin_playerLink" data-id="' + player['player']['id'] + '">' + player['player']['email'] + '</td>' +
                '<td>' + player['player']['creation_date'] + '</td>' +
                '<td>' + player['nbOfScores'] + '</td>' +
                '</tr>';
        }
        table += '</tbody>';
        $("#admin_section table").empty().append(table);
        $(".admin_buttons").empty().append(buttons);
        $("#errorAdmin").hide();
    } else {
        $("#admin_section table").empty();
        $("#errorAdmin").hide().html("<p>Aucun résultat</p>").fadeIn(300);
    }
    let filterElements = $(".admin_filters");
    filterElements.empty().append(filters);
    filterElements.last().empty();
    let buttonElement = $(".admin_buttons");
    buttonElement.empty().append(buttons);
    buttonElement.last().empty();
    if (callback !== undefined) {
        callback();
    }
}

function applyPlayerFilters() {
    let filters = {
        name: $("#namePlayer_input").val(),
        email: $("#emailPlayer_input").val(),
    };
    showPlayers(filters, function () {
        $("#namePlayer_input").val(filters.name);
        $("#emailPlayer_input").val(filters.email);
    });
}

function showPlayerDetails() {
    let id = this.dataset.id;
    $.post("controllers/admin.php", {
        action: "getPlayerDetails",
        id: id,
    }).then(function (data) {
        fillPlayerDetailsTable(data);
    });
}

function fillPlayerDetailsTable(data) {
    let playerResume = '<div id="playerDetails_div">' +
        '<ul id="playerDetails_ul">' +
        '<li>Nom : <span>' + data['player']['name'] + '</span></li>' +
        '<li>Email : <span>' + data['player']['email'] + '</span></li>' +
        '<li>Créé le : <span>' + data['player']['creation_date'] + '</span></li>' +
        '</ul>' +
        '<h3>Historiques des 100 dernières parties :</h3>';
    let table = '<table>' +
        '<thead>' +
        '<tr>' +
        '<th>Date</th>' +
        '<th>Jeu</th>' +
        '<th>Difficulté</th>' +
        '<th>Score</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';
    for (let score of data['scores']) {
        table += '<tr>' +
            '<td>' + score['date'] + '</td>' +
            '<td>' + data['games'].find(game => game['id'] === score['id_game'])['name'] + '</td>' +
            '<td class="td_10">' + DIFFICULTY[score['difficulty']] + '</td>' +
            '<td>' + score['score'] + '</td>' +
            '</tr>';
    }
    table += '</tbody></table></div>';
    $("#playerDetails_div").remove();
    $("#admin_section table").after(playerResume + table);
}
