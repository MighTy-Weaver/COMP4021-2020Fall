<?php
session_start();

if (isset($_SESSION['name']) && !empty($_SESSION['name'])) {
    header("Location: client.php");
}


if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['name'];
    if (isset($_FILES['avatar'])) {
        $filename=explode('.', $_FILES['avatar']['name']);
        $filepath = 'images/' . $username . '.' . end($filename);
        if (!move_uploaded_file($_FILES['avatar']['tmp_name'], $filepath)) {
            header("Location: file_error.html");
        }
    } else {
        header("Location: file_error.html");
        exit;
    }

    require_once('xmlHandler.php');

    // create the chatroom xml file handler
    $xmlh = new xmlHandler("chatroom.xml");
    if (!$xmlh->fileExist()) {
        header("Location: error.html");
        exit;
    }

    // open the existing XML file
    $xmlh->openFile();

    // get the 'users' element
    $users_element = $xmlh->getElement("users");

    // create a 'user' element
    $user_element = $xmlh->addElement($users_element, "user");

    // add the user name
    $xmlh->setAttribute($user_element, "name", $_POST["name"]);
    $xmlh->setAttribute($user_element, "filepath", $filepath);

    // save the XML file
    $xmlh->saveFile();

    // set the name to the cookie
    setcookie("name", $_POST["name"]);
    $_SESSION['name'] = $_POST["name"];
    header("Location: client.php");
}
?>
