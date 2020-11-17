<?php

if (!isset($_COOKIE["name"])) {
    header("Location: error.html");
    return;
}

// get the name from cookie
$name = $_COOKIE["name"];

// get the message content
$message = $_POST["message"];
if (trim($message) == "") $message = "__EMPTY__";

require_once('xmlHandler.php');

// create the chatroom xml file handler
$xmlh = new xmlHandler("chatroom.xml");
if (!$xmlh->fileExist()) {
    header("Location: error.html");
    exit;
}

// create the following DOM tree structure for a message
// and add it to the chatroom XML file
//
// <message name="...">...</message>
//

/* Add your code here */

header("Location: client.php");

?>
