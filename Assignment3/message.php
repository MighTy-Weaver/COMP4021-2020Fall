<?php

print "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Message Page</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
    <script language="javascript" type="text/javascript">
        var loadTimer = null;
        var request;
        var datasize;
        var lastMsgID;
        var message_length = 0;

        function load() {
            loadTimer = null;
            datasize = 0;
            lastMsgID = 0;

            var node = document.getElementById("chatroom");
            node.style.setProperty("visibility", "visible", null);

            getUpdate();
        }

        function unload() {
            var username = document.getElementById("username");
            if (username.value != "") {
                //request = new ActiveXObject("Microsoft.XMLHTTP");
                request = new XMLHttpRequest();
                request.open("POST", "logout.php", true);
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.send(null);
                username.value = "";
            }
            if (loadTimer != null) {
                loadTimer = null;
                clearTimeout("load()", 100);
            }
        }

        function getUpdate() {
            //request = new ActiveXObject("Microsoft.XMLHTTP");
            request = new XMLHttpRequest();
            request.onreadystatechange = stateChange;
            request.open("POST", "server.php", true);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send("datasize=" + datasize);
        }

        function stateChange() {
            if (request.readyState == 4 && request.status == 200 && request.responseText) {
                var xmlDoc;
                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(request.responseText, "text/xml");
                datasize = request.responseText.length;
                updateChat(xmlDoc);
                getUpdate();
            }
        }

        function updateChat(xmlDoc) {
            var messages = xmlDoc.getElementsByTagName("message");
            // compile the message to a string and show it.
            for (var i = message_length; i < messages.length; ++i) {
                var username = messages[i].getAttribute("name");
                var color = messages[i].getAttribute("color");
                showMessage(username, messages[i].textContent, color);
            }
            message_length = messages.length;
        }

        function showMessage(nameStr, contentStr, color = "red") {

            var node = document.getElementById("chattext");
            // Create the name text span
            var nameNode = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

            // Set the attributes and create the text
            nameNode.setAttribute("x", 100);
            nameNode.setAttribute("dy", 20);
            nameNode.setAttribute("style", "fill:" + color);
            nameNode.appendChild(document.createTextNode(nameStr));

            // Add the name to the text node
            node.appendChild(nameNode);

            // Create the score text span
            var conetentNode = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            var RE = /((https|http)?:\/\/[^\s]+)/g;

            contentStr = contentStr.replace(RE, '<a text-decoration="underline" target="blank" href="$1">$1</a>');

            // Set the attributes and create the text
            conetentNode.setAttribute("x", 200);
            conetentNode.setAttribute("style", "fill:" + color);
            conetentNode.innerHTML = contentStr;

            // Add the name to the text node
            node.appendChild(conetentNode);
        }

    </script>
</head>

<body style="text-align: left" onload="load()" onunload="unload()">
<svg width="800px" height="2000px"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xhtml="http://www.w3.org/1999/xhtml"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:a="http://www.adobe.com/svg10-extensions" a:timeline="independent"
>

    <g id="chatroom" style="visibility:hidden">
        <rect width="520" height="2000" style="fill:whitesmoke;stroke:red;stroke-width:3"/>
        <text x="260" y="40" style="fill:red;font-size:30px;font-weight:bold;text-anchor:middle">Chat Window</text>
        <text id="chattext" y="45" style="font-size: 20px;font-weight:bold"/>
    </g>
</svg>

</body>
</html>
