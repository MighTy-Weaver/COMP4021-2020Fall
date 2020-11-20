<?php

require_once('xmlHandler.php');

$datasize = $_POST["datasize"];

// set the execution time limit for this php session to 60 seconds (default is in php.ini)
set_time_limit(60);
        
// create the chatroom xml file handler
$xmlh = new xmlHandler("chatroom.xml");

// check if the chatroom XML data file exists
if (!$xmlh->fileExist()) {
    // create new XML file
    $xmlh->openFile();

    // create a 'chatroom' element, as root element
    $root = $xmlh->addRootElement("chatroom");
                                
    // create a 'messages' element for the set of messages
    $xmlh->addElement($root, "users");
    $xmlh->addElement($root, "messages");
                                
    // save the XML file
    $xmlh->saveFile();
}

$start = gettimeofday();

while (1) {
    // if the file size of chatroom.xml is changed, that means new message has been added
    if ($xmlh->fileExist()) {
        // if data size is changed,
        // stop running this while loop to send messages to user
        if ($_POST["datasize"] != filesize("chatroom.xml")) {
            break;
        }
    }

    // clear the internal cache of file system functions from php
    clearstatcache();

    // we are not going to run the loop for more than 30 seconds
    $time = gettimeofday();
    if ($time["sec"] - $start["sec"] > 30) break;
        
    // stop running the while loop for a second
    sleep(1);
}

$output = "";

// output the content of chatroom.xml as XML message
if ($xmlh->fileExist()) {
    // open the existing XML file
    $xmlh->openFile();
        
    // get all the elements in the XML file
    $output = $xmlh->dumpToString();
}

// print the XML output	
print $output;

?>
