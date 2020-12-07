<?php


class GameModel
{
    private $_gameNames;

    public function __construct()
    {
        $this->setGameNames($this->loadGameNames());
    }

    private function loadGameNames()
    {
        include RELATIVE_PATH['database'] . "connection.php";
        $query = $db->prepare("SELECT *
                                FROM ".$db_prefix."games
                                WHERE 1");
        $query->execute();
        return $query->fetchAll();
    }

    private function setGameNames($games)
    {
        $this->_gameNames = $games;
    }

    public function getGameNames()
    {
        return $this->_gameNames;
    }

    public function saveScore($score, $userId)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("INSERT INTO ".$db_prefix."scores(id_user,id_game,score,difficulty,date)
                                VALUES (?,?,?,?,NOW())");
        $query->execute([
            $userId,
            $score['gameId'],
            $score['score'],
            $score['difficulty'],
        ]);
        $query = $db->prepare("SELECT MAX(id) AS 'last_id'
                               FROM ".$db_prefix."scores");
        $query->execute();
        return $query->fetch()['last_id'];
    }

    private function addNewBestScore($scoreId)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("INSERT INTO ".$db_prefix."best_scores(id_score)
                                VALUES (?)");
        $query->execute([
            $scoreId,
        ]);
        return true;
    }

    private function removeOneBestScore($scoreId)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("DELETE FROM ".$db_prefix."best_scores
                                WHERE id_score = ?");
        $query->execute([
            $scoreId,
        ]);
        return true;
    }

    public function getBestScores()
    {
        include RELATIVE_PATH['database'] . "connection.php";
        $query = $db->prepare("SELECT ".$db_prefix."scores.id, ".$db_prefix."scores.id_game,".$db_prefix."games.name AS 'game',".$db_prefix."scores.difficulty,".$db_prefix."users.name AS 'user',".$db_prefix."scores.score,".$db_prefix."scores.date
                               FROM ".$db_prefix."best_scores
                               LEFT JOIN ".$db_prefix."scores on ".$db_prefix."scores.id = ".$db_prefix."best_scores.id_score
                               LEFT JOIN ".$db_prefix."games on ".$db_prefix."games.id = ".$db_prefix."scores.id_game
                               LEFT JOIN ".$db_prefix."users on ".$db_prefix."users.id = ".$db_prefix."scores.id_user          
                               WHERE 1
                               ORDER BY 'id_game',difficulty DESC,score DESC");
        $query->execute();
        return $query->fetchAll();
    }

    public function getScores($filters)
    {
        include RELATIVE_PATH['database'] . "connection.php";
        $whereString = "WHERE ";
        if ($filters['difficulty'] === "all") {
            $whereString .= "1";
        } else {
            $whereString .= "difficulty=" . $filters['difficulty'];
        }
        if ($filters['game'] !== "all") {
            $whereString .= " AND id_game = " . $filters['game'];
        }
        $query = $db->prepare("SELECT ".$db_prefix."scores.id_game,".$db_prefix."scores.difficulty,".$db_prefix."scores.score,".$db_prefix."scores.date,".$db_prefix."users.name AS 'user'
                               FROM ".$db_prefix."scores
                               LEFT JOIN ".$db_prefix."users ON ".$db_prefix."users.id = ".$db_prefix."scores.id_user
                               " . $whereString . "
                               ORDER BY ".$db_prefix."scores.date DESC
                               LIMIT " . $filters['quantity']);
        $query->execute();
        return $query->fetchAll();
    }

    public function getScoresByUserId($userId)
    {
        include RELATIVE_PATH['database'] . "connection.php";
        $query = $db->prepare("SELECT ".$db_prefix."scores.id_game,".$db_prefix."scores.difficulty,".$db_prefix."scores.score,".$db_prefix."scores.date,".$db_prefix."users.name AS 'user'
                               FROM ".$db_prefix."scores
                               LEFT JOIN ".$db_prefix."users ON ".$db_prefix."users.id = ".$db_prefix."scores.id_user
                               WHERE id_user = ?
                               ORDER BY ".$db_prefix."scores.date DESC
                               LIMIT 100");
        $query->execute([
            $userId,
        ]);
        return $query->fetchAll();
    }

    public function replaceIfBestScore($game, $scoreId)
    {
        $bestScores = $this->getBestScores();
        $scores = [];
        foreach ($bestScores as $bestScore) {
            if ($bestScore['id_game'] === $game['gameId'] && $bestScore['difficulty'] === $game['difficulty']) {
                $scores[] = $bestScore;
            }
        }
        if (count((array)$scores) < 3) {
            $this->addNewBestScore($scoreId);
        } elseif ($game['score'] >= $scores[2]['score']) {
            $this->addNewBestScore($scoreId);
            $this->removeOneBestScore($scores[2]['id']);
        }
    }
}