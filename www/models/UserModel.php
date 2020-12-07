<?php
/**
 * Created by PhpStorm.
 * User: tanguy
 * Date: 11/01/2019
 * Time: 12:44
 */

class UserModel
{

    public function getUserByEmail($email)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT * FROM ".$db_prefix."users
					           WHERE email=?");
        $query->execute([
            $email
        ]);
        return $query->fetch();
    }

    public function getUserById($id)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT name,email,creation_date FROM ".$db_prefix."users
					           WHERE id=?");
        $query->execute([
            $id
        ]);
        return $query->fetch();
    }

    public function searchUser($name, $email)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT id,name,email,creation_date FROM ".$db_prefix."users
					           WHERE 1");
        $query->execute();
        $players = $query->fetchAll();
        $map = [];
        foreach ($players as $player) {
            similar_text(strtolower($name),  strtolower($player['name']), $percent1);
            // on teste la similarité du mail sans le nom de domaine.
            similar_text(explode('@', $email)[0], explode('@', $player['email'])[0], $percent2);
            if ($percent1 > 40 || $percent2 > 40) {
                $map[] = (object)[
                    "player" => $player,
                    "nbOfScores" => $this->getNumberOfGameOfPlayerById($player['id']),
                    "percent" => max($percent1, $percent2),
                ];
            }
        }
        usort($map, "self::_orderNameSearch");
        return $map;
    }

    private function _orderNameSearch($a, $b)
    {
        return $a->percent < $b->percent;
    }

    public function getNumberOfGameOfPlayerById($id)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT count(id) AS 'quantity' FROM ".$db_prefix."scores
					           WHERE id_user=?");
        $query->execute([
            $id
        ]);
        return $query->fetch()['quantity'];
    }

    public function userEmailIsUnique($email)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT email FROM ".$db_prefix."users
                            WHERE email=?");
        $query->execute([
            $email,
        ]);
        return empty($query->fetch());
    }

    public function userNameIsUnique($name)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT name FROM ".$db_prefix."users
                            WHERE name=?");
        $query->execute([
            $name,
        ]);
        return empty($query->fetch());
    }

    public function setNewUser($user)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("INSERT INTO ".$db_prefix."users(email,name,password,creation_date)
                                VALUES (?,?,?,NOW())");
        $query->execute([
            $user['email'],
            $user['name'],
            password_hash($user['password'], PASSWORD_BCRYPT),
        ]);
        return true;
    }

    public function updatePassword($userId,$newPassword)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("UPDATE ".$db_prefix."users SET password = ?
                               WHERE id = ?");
        $query->execute([
            password_hash($newPassword, PASSWORD_BCRYPT),
            $userId,
        ]);
        return true;
    }
}