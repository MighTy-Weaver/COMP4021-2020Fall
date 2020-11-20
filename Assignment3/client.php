<?php

if (!isset($_COOKIE["name"])) {
    header("Location: error.html");
    return;
}

// get the name from cookie
$name = $_COOKIE["name"];

print "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Add Message Page</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
    <style>
        .div-color {
            position: absolute;
            width: 30px;
            height: 30px;
        }
    </style>
    <script type="text/javascript">
        function load() {
            var name = "<?php print $name; ?>";

            setTimeout("document.getElementById('msg').focus()", 100);
        }

        // get the user list from the html file
        function get_user_list(url) {
            var new_window = window.open(url, 'name', 'height=600,width=800');
            if (window.focus) {
                new_window.focus()
            }
            return false;
        }

        // select the color
        function select(color) {
            if (confirm("Please confirm to change the color of message to " + color)) {
                document.getElementById("color").value = color;
            }
        }
    </script>
</head>

<body style="text-align: left" onload="load()">
<form action="add_message.php" method="post">
    <table border="0" cellspacing="5" cellpadding="0">
        <tr>
            <td colspan="3">What is your message?</td>
        </tr>
        <tr>
            <td colspan="3"><input class="text" type="text" name="message" id="msg" style="width: 780px"/></td>
        </tr>
        <tr>
            <td><input class="button" type="submit" value="Send Your Message" style="width: 200px"/></td>
            <td valign="middle" align="right">Choose your color:</td>
            <td>
                <button style="background-color:black;width:30px;height:30px" onclick="select('black');return false;"/>
                <button style="background-color:orange;width:30px;height:30px"
                        onclick="select('orange');return false;"/>
                <button style="background-color:gold;width:30px;height:30px"
                        onclick="select('gold');return false;"/>
                <button style="background-color:green;width:30px;height:30px" onclick="select('green');return false;"/>
                <button style="background-color:cyan;width:30px;height:30px" onclick="select('cyan');return false;"/>
                <button style="background-color:blue;width:30px;height:30px" onclick="select('blue');return false;"/>
                <button style="background-color:purple;width:30px;height:30px"
                        onclick="select('purple');return false;"/>
            </td>
        </tr>
    </table>
    <input type="hidden" name="color" id="color" value="black">
</form>

<!--logout & user list-->
<table border="0" cellspacing="5" cellpadding="0">
    <tr>
        <td>
            <form action="logout.php" method="post">
                <input class="button" type="submit" value="Logout" style="position:relative; width: 200px;"/>
            </form>
        </td>
        <td>
            <button class="button" style="margin-left: 5px;width: 200px"
                    onclick="get_user_list('list.html'); return false;">Show Online Users List
            </button>
        </td>
    </tr>
</table>

</body>
</html>
