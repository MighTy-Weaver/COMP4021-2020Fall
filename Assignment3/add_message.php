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

// get the color of the message
$color = $_POST["color"];

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

$xmlh->openFile();
// Get the 'messages' element as the current element
$messages_element = $xmlh->getElement("messages");
// Create a 'message' element for each message
$message_element = $xmlh->addElement($messages_element, "message");
// Add the name and color
$xmlh->setAttribute($message_element, "name", $name);
$xmlh->setAttribute($message_element, "color", $color);
// Add the content of the message
$xmlh->addText($message_element, $message);
$xmlh->saveFile();

header("Location: client.php");

?>

