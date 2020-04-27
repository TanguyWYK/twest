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
                                FROM games
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
        $query = $db->prepare("INSERT INTO scores(id_user,id_game,score,difficulty,date)
                                VALUES (?,?,?,?,NOW())");
        $query->execute([
            $userId,
            $score['gameId'],
            $score['score'],
            $score['difficulty'],
        ]);
        $query = $db->prepare("SELECT MAX(id) AS 'last_id'
                               FROM scores");
        $query->execute();
        return $query->fetch()['last_id'];
    }

    private function addNewBestScore($scoreId)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("INSERT INTO best_scores(id_score)
                                VALUES (?)");
        $query->execute([
            $scoreId,
        ]);
        return true;
    }

    private function removeOneBestScore($scoreId)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("DELETE FROM best_scores
                                WHERE id_score = ?");
        $query->execute([
            $scoreId,
        ]);
        return true;
    }

    public function getBestScores()
    {
        include RELATIVE_PATH['database'] . "connection.php";
        $query = $db->prepare("SELECT scores.id, scores.id_game,games.name AS 'game',scores.difficulty,users.name AS 'user',scores.score,scores.date
                               FROM best_scores
                               LEFT JOIN scores on scores.id = best_scores.id_score
                               LEFT JOIN games on games.id = scores.id_game
                               LEFT JOIN users on users.id = scores.id_user          
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
        $query = $db->prepare("SELECT scores.id_game,scores.difficulty,scores.score,scores.date,users.name AS 'user'
                               FROM scores
                               LEFT JOIN users ON users.id = scores.id_user
                               " . $whereString . "
                               ORDER BY scores.date DESC
                               LIMIT " . $filters['quantity']);
        $query->execute();
        return $query->fetchAll();
    }

    public function getScoresByUserId($userId)
    {
        include RELATIVE_PATH['database'] . "connection.php";
        $query = $db->prepare("SELECT scores.id_game,scores.difficulty,scores.score,scores.date,users.name AS 'user'
                               FROM scores
                               LEFT JOIN users ON users.id = scores.id_user
                               WHERE id_user = ?
                               ORDER BY scores.date DESC
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