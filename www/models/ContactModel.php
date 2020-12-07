<?php


class ContactModel
{
    public function getMessages($status)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT * FROM ".$db_prefix."messages WHERE status = ?");
        $query->execute([
            $status,
        ]);
        return $query->fetchAll();
    }

    public function saveMessage($contact)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("INSERT INTO ".$db_prefix."messages(email, subject, message, date,status)
                                VALUES (?,?,?,NOW(),?)");
        $query->execute([
            $contact['email'],
            $contact['subject'],
            $contact['message'],
            "new",
        ]);
        return true;
    }

    public function updateMessageStatus($messageId, $status)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("UPDATE ".$db_prefix."messages
                                SET status = ?
                                WHERE id=?");
        $query->execute([
            $status,
            $messageId,
        ]);
    }

    public function emptyTrash()
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("DELETE FROM messages
                                WHERE status=?");
        $query->execute([
            "deleted",
        ]);
    }
}