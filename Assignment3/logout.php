<?php 

require_once('xmlHandler.php');

if (!isset($_COOKIE["name"])) {
    header("Location: error.html");
    exit;
}

// create the chatroom xml file handler
$xmlh = new xmlHandler("chatroom.xml");
if (!$xmlh->fileExist()) {
    header("Location: file_error.html");
    exit;
}

$name = $_COOKIE["name"];
$xmlh->openFile();
$users_element = $xmlh->getElement("users");
$user_element = $xmlh->getChildNodes("user");

if($user_element != null) {
    // delete the current user from the users element
    foreach ($user_element as $user) {
        $username = $xmlh->getAttribute($user, "name");
        if ($username == $name)
        	//remove the user & pic if match
            $file = $xmlh->getAttribute($user, "filepath");
            unlink($file);
            $xmlh->removeElement($users_element, $user);
    }
}

$xmlh->saveFile();

//user has no name
setcookie("name", "");

//redurect to login page
header("Location: login.html");

?>
