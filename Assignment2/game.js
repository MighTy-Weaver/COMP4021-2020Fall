// The point and size class used in this program
function Point(x, y) {
    this.x = (x) ? parseFloat(x) : 0.0;
    this.y = (y) ? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w) ? parseFloat(w) : 0.0;
    this.h = (h) ? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
        pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

// The player class used in this program
function Player() {
    this.node = document.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.orientation = motionType.RIGHT;
}

// Helper function to check whether the object is on the vertical platform
function onVerticalPlatform(position, motion, size) {
    var vertical_platform = document.getElementById("VP");
    var x = parseFloat(vertical_platform.getAttribute("x"));
    var y = parseFloat(vertical_platform.getAttribute("y"));
    var w = parseFloat(vertical_platform.getAttribute("width"));
    return (((position.x + size.w > x && position.x < x + w) ||
        ((position.x + size.w) == x && motion == motionType.RIGHT) ||
        (position.x == (x + w) && motion == motionType.LEFT)) &&
        (position.y <= y - size.h + 2 && position.y >= y - 1.2 * size.h));
}

Player.prototype.isOnPlatform = function () {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        if ((((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
            ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
            (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) || onVerticalPlatform(player.position, player.motion, PLAYER_SIZE)) {
            return true;
        }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;
    return false;
}

Player.prototype.collidePlatform = function (position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function (position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}

//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(800, 600);       // The size of the game screen
var PLAYER_INIT_POS = new Point(0, 420);   // The initial position of the player
var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed
var GAME_INTERVAL = 30;                     // The time interval of running the game
var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var monsterCanShoot = true;                   // A flag indicating whether the monster can shoot a bullet
var MONSTER_SIZE = new Size(40, 40);        // The size of the monster
var GOOD_SIZE = new Size(20, 20);           // size of a good thing
var EXIT_SIZE = new Size(30, 30);           // size of the exit
var PORTAL_SIZE = new Size(40, 80);        // size of the portal
var total_score = 0;                            // total score
var level = 0;                                  // level number
var cheat = false;                              // is cheating or not

//
// Variables in the game
//
var motionType = {NONE: 0, LEFT: 1, RIGHT: 2}; // Motion enum
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var vertical_platform = null;               // The vertical platform object
var vertical_platform_moving_up = true;     // is the vertical platform moving up
var disappearing_platform_1 = null;         // the disappearing platform object 1
var disappearing_platform_2 = null;         // the disappearing platform object 2
var disappearing_platform_3 = null;           // the disappearing platform object 3
var time_remaining = 5;                     // remaining time of the game
var timer = null;                           // the timer to count down the time
var player_name = "Enter your name here";   // the variable to store the input name
var player_nametag = null;                  // the object of the name tag displayed
var player_in_portal = false;               // If the player run into the portal or not
var canMonsterShoot = true;
// Background musics
var BGM = new Audio("unstoppable.wav");
BGM.loop = true;
var bullet_sound = new Audio("shoot.wav");
var next_level_sound = new Audio("next_level.wav");
var game_over_sound = new Audio("game_over.wav");
var kill_monster_sound = new Audio("kill.wav");
var cheat_on_sound = new Audio("cheat_on.wav");
var cheat_off_sound = new Audio("cheat_off.wav");
var good_thing_sound = new Audio("good_thing.wav");

// this function starts the game
function game_start() {
    player_name = prompt("Please enter your name below", player_name);
    if (player_name == null || player_name == "" || player_name == "Enter your name here") {
        player_name = "Anonymous";
    }
    level = 0;
    cheat = false;
    total_score = 0;
    canMonsterShoot = true;
    // load every components of the game
    load();
    // hide the main page and highscoretable
    document.getElementById("mainPage").style.setProperty("visibility", "hidden", null);
    document.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    // start the time counter
    start_time();
}

// The load function
function load() {
    delete_by_id("name_tag", false);
    delete_by_id("monsters", false);
    delete_by_id("bullets", false);
    // Attach keyboard events
    document.documentElement.addEventListener("keydown", keydown, false);
    document.documentElement.addEventListener("keyup", keyup, false);
    //restart timer
    clearInterval(gameInterval);
    clearInterval(timer);
    time_remaining = 100;
    // Create the player
    player = new Player();
    player.name = player_name;
    player.bullet = 8;
    player_in_portal = false;
    document.getElementById("score").firstChild.data = total_score;
    document.getElementById("bullets_number").firstChild.data = player.bullet;
    // Create the monsters
    createMonsters();
    //create the VP
    vertical_platform = document.getElementById("VP");
    vertical_platform.setAttribute("y", 340);
    vertical_platform_moving_up = true;
    //create the DPs
    createDisappearingPlatforms();
    //create the GTs
    create_good_things();
    //create exit
    create_exit();
}

// start the time counter
function start_time() {
    level++;
    document.getElementById("level").firstChild.data = level;
    document.getElementById("tag").firstChild.data = player_name;
    player_nametag = document.createElementNS("http://www.w3.org/2000/svg", "use");
    player_nametag.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#name");
    player_nametag.setAttribute("x", player.position.x);
    player_nametag.setAttribute("y", player.position.y - 5);
    document.getElementById("name_tag").appendChild(player_nametag);
    // set the timer change interval
    timer = setInterval("second_off()", 1000);
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    //play music
    BGM.play();
}

// this function ends the game and update the high score
function game_end() {
    BGM.pause();
    game_over_sound.load();
    game_over_sound.play();
    clearInterval(gameInterval);
    clearInterval(timer);
    score_table = getHighScoreTable();
    player_name = player.name;
    var score_record = new ScoreRecord(player.name, total_score);
    var record_length = score_table.length;
    for (var i = 0; i < score_table.length; i++) {
        if (score_record.score > score_table[i].score) {
            record_length = i;
            break;
        }
    }
    score_table.splice(record_length, 0, score_record);
    setHighScoreTable(score_table);
    showHighScoreTable(score_table, record_length);
}

// this function restarts the game
function restart() {
    // delete all the objects
    delete_by_id("name_tag", false);
    delete_by_id("monsters", false);
    delete_by_id("bullets", false);
    delete_by_id("highscoretext", false);
    delete_by_id("GTs", false);
    delete_by_id("platforms", true);
    if (disappearing_platform_1 != null) {
        disappear_platform(disappearing_platform_1);
        disappearing_platform_1 = null;
    }
    if (disappearing_platform_2 != null) {
        disappear_platform(disappearing_platform_2);
        disappearing_platform_2 = null;
    }
    if (disappearing_platform_3 != null) {
        disappear_platform(disappearing_platform_3);
        disappearing_platform_3 = null;
    }
    // hide the high score table
    document.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    game_start();
}

// This function creates the exitdoor in the game
function create_exit() {
    var exit = document.createElementNS("http://www.w3.org/2000/svg", "use");
    exit.setAttribute("x", 20);
    exit.setAttribute("y", 15);
    exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
    document.getElementById("exit_point").appendChild(exit);
}

// This function creates the monsters in the game
function createMonsters() {
    var monsters = 0;
    var platforms = document.getElementById("platforms");
    let collision;
    while (monsters < (6 + level * 4)) {
        var monster_x = Math.floor(Math.random() * 700) + 100;//floor
        var monster_y = Math.floor(Math.random() * 600);
        collision = false;
        for (var j = 0; j < platforms.childNodes.length; j++) {
            var node = platforms.childNodes.item(j);
            if (node.nodeName != "rect")
                continue;
            var x = parseInt(node.getAttribute("x"));
            var y = parseInt(node.getAttribute("y"));
            var width = parseInt(node.getAttribute("width"));
            var height = parseInt(node.getAttribute("height"));
            var temp_point = new Point(x, y);
            var block_size = new Size(width, height);
            if (intersect(new Point(monster_x, monster_y), MONSTER_SIZE, temp_point, block_size)) {
                collision = true;
            }
        }
        // test if the monsters are out of screen
        if (monster_x + MONSTER_SIZE.w > SCREEN_SIZE.w)
            collision = true;
        // random walk away and create each one
        if (!collision) {
            var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
            monster.setAttribute("x", monster_x);
            monster.setAttribute("y", monster_y);
            var random_type = Math.floor(Math.random() * 10) % 2;
            if (random_type == 0) {
                monster.setAttribute("m_direction", "left");
            } else {
                monster.setAttribute("m_direction", "right");
            }
            if (monsters == 0) {
                monster.setAttribute("shooter", "yes");
                monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#shooter");
            } else {
                monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
                monster.setAttribute("shooter", "no");
            }
            document.getElementById("monsters").appendChild(monster);
            monsters++;
        }
    }
}

// This function creates the good things in the game
function create_good_things() {
    var i = 0;
    var platforms = document.getElementById("platforms");
    var collision = false;
    while (i < 9) {
        var random_x = Math.floor(Math.random() * 700) + 40; // size of game area with floor
        var random_y = Math.floor(Math.random() * 560) + 40; // size of game area with floor
        collision = false;
        if (i == 0) {
            random_x = 400 + Math.floor(Math.random() * 50);
            random_y = 300;
        }
        if (i == 1) {
            random_x = 260 + Math.floor(Math.random() * 50);
            random_y = 410;
        }
        if (i == 2) {
            random_x = 560 + Math.floor(Math.random() * 50);
            random_y = 70;
        }
        for (var j = 0; j < platforms.childNodes.length; j++) {
            var node = platforms.childNodes.item(j);
            if (node.nodeName != "rect") continue;
            var x = parseInt(node.getAttribute("x"));
            var y = parseInt(node.getAttribute("y"));
            var width = parseInt(node.getAttribute("width"));
            var height = parseInt(node.getAttribute("height"));
            var temp_point = new Point(x, y);
            var block_size = new Size(width, height);
            if (intersect(new Point(random_x, random_y), GOOD_SIZE, temp_point, block_size)) {
                collision = true;
            }
        }
        if (!collision) {
            var good_thing = document.createElementNS("http://www.w3.org/2000/svg", "use");
            good_thing.setAttribute("x", random_x);
            good_thing.setAttribute("y", random_y);
            good_thing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#GT");
            document.getElementById("GTs").appendChild(good_thing);
            i++;
        }
    }
}

// This function shoots a bullet from the player
function shootBullet() {
    if (!cheat && player.bullet <= 0) {
        return;
    } else if (!cheat) {
        player.bullet--;
    }
    bullet_sound.load();
    bullet_sound.play();
    document.getElementById("bullets_number").firstChild.data = player.bullet;
    // shooting time interval
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);
    // create the bullet
    var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
    if (player.orientation == motionType.RIGHT) {
        bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    } else {
        bullet.setAttribute("x", player.position.x - PLAYER_SIZE.w / 2 + BULLET_SIZE.w / 2);
    }
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttribute("direction", player.orientation);
    bullet.setAttribute("player_shoot", "true");
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    document.getElementById("bullets").appendChild(bullet);
}

// This is the function to shoot special_bullet
function shootMonsterBullet(position, moving_right) {
    canMonsterShoot = false;
    setTimeout("canMonsterShoot = true", 2000);
    var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
    if (moving_right)
        bullet.setAttribute("direction", motionType.RIGHT);
    else
        bullet.setAttribute("direction", motionType.LEFT);
    bullet.setAttribute("x", position.x + MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", position.y + MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttribute("player_shoot", "false");
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    document.getElementById("bullets").appendChild(bullet);
}

// This function moves the vertical platform
function move_vertical_platform() {
    const y = parseInt(vertical_platform.getAttribute("y"));
    if (vertical_platform_moving_up) {
        if (y > 100)
            vertical_platform.setAttribute("y", y - VERTICAL_DISPLACEMENT);
        else
            vertical_platform_moving_up = false;
    } else {
        if (y < 340)
            vertical_platform.setAttribute("y", y + VERTICAL_DISPLACEMENT);
        else
            vertical_platform_moving_up = true;
    }
}

// This function takes one second of the remaining time and check is there time left
function second_off() {
    time_remaining -= 1;
    if (time_remaining <= 0)
        game_end();
    document.getElementById("time_remaining").firstChild.data = time_remaining + "s";
}

// This function deletes all the objects by their id
function delete_by_id(id, is_text) {
    var child, next_child;
    var objects = document.getElementById(id);
    child = objects.firstChild;
    while (child != null) {
        next_child = child.nextSibling;
        if (!is_text || child.nodeType == 3)
            objects.removeChild(child);
        child = next_child;
    }
}

// This function creates the disappearing platforms
function createDisappearingPlatforms() {
    disappearing_platform_1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    disappearing_platform_2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    disappearing_platform_3 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    disappearing_platform_1.setAttribute("x", 380);
    disappearing_platform_1.setAttribute("y", 340);
    disappearing_platform_1.setAttribute("width", 80);
    disappearing_platform_1.setAttribute("height", 20);
    disappearing_platform_1.setAttribute("type", "disappearing");
    disappearing_platform_1.setAttribute("style", "fill:purple; fill-opacity:1");
    disappearing_platform_2.setAttribute("x", 280);
    disappearing_platform_2.setAttribute("y", 440);
    disappearing_platform_2.setAttribute("width", 80);
    disappearing_platform_2.setAttribute("height", 20);
    disappearing_platform_2.setAttribute("type", "disappearing");
    disappearing_platform_2.setAttribute("style", "fill:purple; fill-opacity:1");
    disappearing_platform_3.setAttribute("x", 580);
    disappearing_platform_3.setAttribute("y", 100);
    disappearing_platform_3.setAttribute("width", 60);
    disappearing_platform_3.setAttribute("height", 20);
    disappearing_platform_3.setAttribute("type", "disappearing");
    disappearing_platform_3.setAttribute("style", "fill:purple; fill-opacity:1");
    document.getElementById("platforms").appendChild(disappearing_platform_1);
    document.getElementById("platforms").appendChild(disappearing_platform_2);
    document.getElementById("platforms").appendChild(disappearing_platform_3);
}

// This is the keydown handling function for the SVG document
function keydown(evt) {
    var keyCode = (evt.keyCode) ? evt.keyCode : evt.getKeyCode();
    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.orientation = motionType.LEFT;
            break;
        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.orientation = motionType.RIGHT;
            break;
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
        case "H".charCodeAt(0):
            if (canShoot) shootBullet();
            break;
        case "C".charCodeAt(0):
            if (cheat == false) {
                cheat = true;
            }
            cheat_on_sound.load();
            cheat_on_sound.play();
            break;
        case "V".charCodeAt(0):
            if (cheat == true) {
                cheat = false;
            }
            cheat_off_sound.load();
            cheat_off_sound.play();
            break;
        case "K".charCodeAt(0):
            if (cheat = false) {
                cheat = true;
            }
            cheat_on_sound.load();
            cheat_on_sound.play();
            delete_by_id("monsters", false);
            break;
    }
}

// This is the keyup handling function for the SVG document
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode) ? evt.keyCode : evt.getKeyCode();
    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;
        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

// This function checks collision
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    if (!cheat)
        for (var i = 0; i < monsters.childNodes.length; i++) {
            var monster = monsters.childNodes.item(i);
            var x = parseInt(monster.getAttribute("x"));
            var y = parseInt(monster.getAttribute("y"));
            if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
                game_end();
                return;
            }
        }
    // Check whether a player collides with the monster's bullet
    if (!cheat) {
        var bullets = document.getElementById("bullets");
        for (var i = 0; i < bullets.childNodes.length; i++) {
            var bullet = bullets.childNodes.item(i);
            if (bullet.getAttribute("player_shoot") == "false") {
                var x = parseInt(bullet.getAttribute("x"));
                var y = parseInt(bullet.getAttribute("y"));
                if (intersect(new Point(x, y), BULLET_SIZE, player.position, PLAYER_SIZE)) {
                    game_end();
                    return;
                }
            }
        }
    }
    // Check whether the monster collides with a bullet
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        if (bullet.getAttribute("player_shoot") == "false") {
            continue;
        }
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));
        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var monster_x = parseInt(monster.getAttribute("x"));
            var monster_y = parseInt(monster.getAttribute("y"));
            if (intersect(new Point(x, y), BULLET_SIZE, new Point(monster_x, monster_y), MONSTER_SIZE)) {
                kill_monster_sound.load();
                kill_monster_sound.play();
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                // Update the score and display information
                total_score += 10;
                document.getElementById("score").firstChild.data = total_score;
                document.getElementById("bullets_number").firstChild.data = player.bullet;
                document.getElementById("level").firstChild.data = level;
            }
        }
    }
    // Check if the player collides a good thing
    var good_things = document.getElementById("GTs");
    for (var i = 0; i < good_things.childNodes.length; i++) {
        var good_thing = good_things.childNodes.item(i);
        var good_x = parseInt(good_thing.getAttribute("x"));
        var good_y = parseInt(good_thing.getAttribute("y"));
        if (intersect(new Point(good_x, good_y), GOOD_SIZE, player.position, PLAYER_SIZE)) {
            good_things.removeChild(good_thing);
            good_thing_sound.load();
            good_thing_sound.play();
            i--;
            total_score += 10;
            document.getElementById("score").firstChild.data = total_score;
        }
    }
    //Check if player is on a disappearing platform
    if (disappearing_platform_1 != null && (player.position.x + PLAYER_SIZE.w > 380 && player.position.x + PLAYER_SIZE.w < 460) && (player.position.y + PLAYER_SIZE.h == 340)) {
        disappear_platform(disappearing_platform_1);
        disappearing_platform_1 = null;
    }
    if (disappearing_platform_2 != null && (player.position.x + PLAYER_SIZE.w > 280 && player.position.x + PLAYER_SIZE.w < 360) && (player.position.y + PLAYER_SIZE.h == 440)) {
        disappear_platform(disappearing_platform_2);
        disappearing_platform_2 = null;
    }
    if (disappearing_platform_3 != null && (player.position.x + PLAYER_SIZE.w > 580 && player.position.x + PLAYER_SIZE.w < 660) && (player.position.y + PLAYER_SIZE.h == 100)) {
        disappear_platform(disappearing_platform_3);
        disappearing_platform_3 = null;
    }
    // Check if the player is in either portals
    if (!player_in_portal) {
        var portal1_x = parseInt(portal1.getAttribute("x"));
        var portal1_y = parseInt(portal1.getAttribute("y"));
        var portal2_x = parseInt(portal2.getAttribute("x"));
        var portal2_y = parseInt(portal2.getAttribute("y"));
        if (intersect(new Point(portal1_x, portal1_y), PORTAL_SIZE, player.position, PLAYER_SIZE)) {
            player.position.x = portal2_x;
            player.position.y = portal2_y;
            player_in_portal = true;
            setTimeout(function () {
                player_in_portal = false;
            }, 2000);
        }
        if (intersect(new Point(portal2_x, portal2_y), PORTAL_SIZE, player.position, PLAYER_SIZE) && !player_in_portal) {
            player.position.x = portal1_x;
            player.position.y = portal1_y;
            player_in_portal = true;
            setTimeout(function () {
                player_in_portal = false;
            }, 2000);
        }
    }
    // check if the player collides with the exit door
    var exit = document.getElementById("exit_point").childNodes.item(0);
    if (good_things.childNodes.length == 0) {
        var x = parseInt(exit.getAttribute("x"));
        var y = parseInt(exit.getAttribute("y"));
        if (intersect(new Point(x, y), EXIT_SIZE, player.position, PLAYER_SIZE)) {
            document.getElementById("score").firstChild.data = total_score;
            total_score = total_score + level * 100 + time_remaining;
            next_level_sound.load();
            next_level_sound.play();
            load();
            start_time();
            return;
        }
    }
}

// This function updates the position of the bullets
function moveBullets() {
    // Go through all bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if (node.getAttribute("direction") == motionType.LEFT) {
            node.setAttribute("x", x - BULLET_SPEED);
        } else {
            node.setAttribute("x", x + BULLET_SPEED);
        }
        if (parseInt(node.getAttribute("x")) + BULLET_SPEED > SCREEN_SIZE.w || parseInt(node.getAttribute("x")) - BULLET_SPEED < 0) {
            bullets.removeChild(node);
            i--;
        }
        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            i--;
        }
    }
}

// This function checks whether the monster is on a platform
function monster_on_platform(monster) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect")
            continue;
        var x = parseInt(node.getAttribute("x"));
        var y = parseInt(node.getAttribute("y"));
        var w = parseInt(node.getAttribute("width"));
        var position = new Point(parseInt(monster.getAttribute("x")), parseInt(monster.getAttribute("y")));
        var type = monster.getAttribute("m_direction");
        if ((((position.x + MONSTER_SIZE.w > x && position.x < x + w) || ((position.x + MONSTER_SIZE.w) == x
            && type == "right") || (position.x == (x + w) && type == "left")) && position.y + MONSTER_SIZE.h == y) ||
            onVerticalPlatform(position, monster.motion, MONSTER_SIZE)) {
            return true;
        }
    }
    if (position.y + MONSTER_SIZE.h == SCREEN_SIZE.h) {
        return true;
    }
    return false;
}

// this function checks the collision between monsters and platforms
function monster_collide_platform(monster, new_position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") {
            continue;
        }
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var width = parseFloat(node.getAttribute("width"));
        var height = parseFloat(node.getAttribute("height"));
        var position = new Point(x, y);
        var size = new Size(width, height);
        var original_position = new Point(parseFloat(monster.getAttribute("x")), parseFloat(monster.getAttribute("y")));
        if (intersect(new_position, MONSTER_SIZE, position, size)) {
            new_position.x = original_position.x;
            if (intersect(new_position, MONSTER_SIZE, position, size)) {
                if (original_position.y >= y + height)
                    new_position.y = y + height;
                else
                    new_position.y = y - MONSTER_SIZE.h;
            }
        }
    }
}

// This function moves the monsters
function moveMonsters() {
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; ++i) {
        var monster = monsters.childNodes.item(i);
        var original_position = new Point(parseFloat(monster.getAttribute("x")), parseFloat(monster.getAttribute("y")));
        if (monster.getAttribute("shooter") == "yes" && canMonsterShoot)
            shootMonsterBullet(original_position, player.x > original_position.x);
        var moved_position = new Point(parseFloat(monster.getAttribute("x")), parseFloat(monster.getAttribute("y")));
        var monster_direction = monster.getAttribute("m_direction");
        if (monster_on_platform(monster)) {
            if (monster_direction == "left") {
                moved_position.x -= 1;
            }
            if (monster_direction == "right") {
                moved_position.x += 1;
            }
            monster_collide_platform(monster, moved_position);
            if (moved_position.x == original_position.x) {
                if (monster_direction == "left") {
                    monster.setAttribute("m_direction", "leftup");
                }
                if (monster_direction == "right") {
                    monster.setAttribute("m_direction", "rightup");
                }
                moved_position.y -= 1;
                monster_collide_platform(monster, moved_position);
                if (moved_position.y == original_position.y) {
                    if (monster_direction == "left") {
                        monster.setAttribute("m_direction", "right");
                    }
                    if (monster_direction == "right") {
                        monster.setAttribute("m_direction", "left");
                    }
                } else monster.setAttribute("y", moved_position.y);
            } else if (moved_position.x < 0) {
                monster.setAttribute("m_direction", "right");
            } else if (moved_position.x + MONSTER_SIZE.w > SCREEN_SIZE.w) {
                monster.setAttribute("m_direction", "left");
            } else monster.setAttribute("x", moved_position.x);
        } else {
            if (monster_direction == "leftup") {
                moved_position.x -= 1;
                monster_collide_platform(monster, moved_position);
                if (moved_position.x == original_position.x) {
                    moved_position.y -= 1;
                    monster_collide_platform(monster, moved_position);
                    if (moved_position.y == original_position.y) {
                        monster.setAttribute("m_direction", "right");
                    } else monster.setAttribute("y", moved_position.y);
                } else {
                    monster.setAttribute("x", moved_position.x);
                    monster.setAttribute("m_direction", "left");
                }
            } else if (monster_direction == "rightup") {
                moved_position.x += 1;
                monster_collide_platform(monster, moved_position);
                if (moved_position.x == original_position.x) {
                    moved_position.y -= 1;
                    monster_collide_platform(monster, moved_position);
                    if (moved_position.y == original_position.y) {
                        monster.setAttribute("m_direction", "left");
                    } else monster.setAttribute("y", moved_position.y);
                } else {
                    monster.setAttribute("x", moved_position.x);
                    monster.setAttribute("m_direction", "right");
                }
            } else {
                moved_position.y += 1;
                monster.setAttribute("y", moved_position.y);
            }
        }
    }
}

// This function makes the platform disappears
function disappear_platform(Platform) {
    setTimeout(function () {
        Platform.style.fillOpacity -= 0.3;
    }, 100);
    setTimeout(function () {
        Platform.style.fillOpacity -= 0.4;
    }, 200);
    setTimeout(function () {
        Platform.style.fillOpacity -= 0.4;
    }, 300);
    setTimeout(function () {
        Platform.parentNode.removeChild(Platform);
    }, 300);
    return null;
}

// This function updates everything moving in the game
function gamePlay() {
    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move bullets, monsters, vertical platform
    moveBullets();
    moveMonsters();
    move_vertical_platform();
    // move the player
    updateScreen();
}

// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
function updateScreen() {
    if (player.orientation == motionType.LEFT) {
        player.node.setAttribute("transform", "translate(" + (PLAYER_SIZE.w + player.position.x) + "," + player.position.y + ") scale(-1, 1)");
    } else {
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var monster_direction = monster.getAttribute("m_direction")
        if (monster_direction == "left" || monster_direction == "leftup") {
            var monster_x = monster.getAttribute("x");
            monster.setAttribute("transform", " translate(" + (2 * monster_x + MONSTER_SIZE.w) + ", 0) scale(-1, 1)");
        } else {
            monster.setAttribute("transform", "");
        }
    }
    //player's name tag
    player_nametag.setAttribute("x", player.position.x + 15);
    player_nametag.setAttribute("y", player.position.y - 5);
}
