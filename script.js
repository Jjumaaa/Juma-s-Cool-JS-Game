/* This is the Player object */
const plr = {
    Name: "ike",
    Character: document.getElementById("character"),
    Left_Eye: document.getElementById("char-eye-1"),
    Right_Eye: document.getElementById("char-eye-2"),
    Health: 100,
    Ammo: 30,
    Speed: 5,
    coolDownActive: false,
    movementEnabled: true,
    Front_Feeler: document.getElementById("collision-check-front"),
    Left_Feeler: document.getElementById("collision-check-left"),
    Right_Feeler: document.getElementById("collision-check-right"),
    Back_Feeler: document.getElementById("collision-check-back"),
    HP: document.getElementById(`HPteller`),
}

/** This is a table of all enemies and their intervals(a function that allows them to shoot every few milliseconds) */
let all_Enemies = [];
let enemyIntervals = {};

/* Player Character */
const Plr = plr.Character;

/** Boxes*/
const boxes = document.getElementsByClassName("box");

/** enemies with the class "enemies"*/
const enemies = document.getElementsByClassName("enemies");

/** A button that makes enemies*/
const mB = document.getElementById('enemy_maker');

/**input field where you input the positions of the enemies in pixels and the name of your enemy*/
const topB = document.getElementById('top');
const leftB = document.getElementById('left');
const nameBox = document.getElementById(`namebox`)


/** An object of disabled keys so you cant move when blocked by boxes*/

let dis = {
    w: false,
    s: false,
    a: false,
    d: false,
}

/* Player Position */
let posX = 200; // Initial X position
let posY = 200; // Initial Y position
let angle = 0; // Initial rotation
let angle2 = 0; // Initial rotation for enemy

let keys = {}
/* all functions */

let pX = 0;
let pY = 0;


let pXE = 0;
let pYE = 0;
/*Bullet Collision for player */
let bullets = []; // Store bullets for collision detection



/** A function for the player to shoot bullets*/
function shoot_bullet() {
    if (plr.Ammo >0) {
        plr.Ammo -= 1
        plr.HP.innerHTML = `Health: ${plr.Health}   Ammo: ${plr.Ammo}`
        let bullet = document.createElement("div");
        bullet.style.position = "absolute"; 
        bullet.style.width = `20px`;
        bullet.style.height = `10px`;
        bullet.style.backgroundColor = " rgb(0, 255, 106)";
        bullet.style.boxShadow = "0px 0px 30px green";
        bullet.className = "bullets";
        document.body.appendChild(bullet);

        let bulletX = parseFloat(pX);
        let bulletY = parseFloat(pY);

        bullet.style.left = `${bulletX}px`;
        bullet.style.top = `${bulletY}px`;

        bullet.style.transform = `rotate(${angle}deg)`;

        bullet.angle = angle; // Store the angle for movement
        bullets.push(bullet); // Add to array for collision checks

        function animateBullet() {
            let rad = bullet.angle * (Math.PI / 180);
            let speed = 10;
            bulletX += Math.cos(rad) * speed;
            bulletY += Math.sin(rad) * speed;

            bullet.style.left = `${bulletX}px`;
            bullet.style.top = `${bulletY}px`;

            if (
                bulletX > 0 && bulletX < window.innerWidth &&
                bulletY > 0 && bulletY < window.innerHeight
            ) {
                requestAnimationFrame(animateBullet);
            } else {
                bullet.remove();
                bullets = bullets.filter(b => b !== bullet);
            }
        }

        requestAnimationFrame(animateBullet);
    }else{
        setTimeout(()=>{plr.Ammo = 30}, 1000);
    }

 
}

/** A function for the bullets shot by the player to hit enemies*/
function checkBulletCollisions() {
    for (let bullet of bullets) {
        for (let e of enemies) {
            if (isColliding(bullet, e)) {
                console.log("Bullet hit an enemy!");

                // Remove bullet
                bullet.remove();
                bullets = bullets.filter(b => b !== bullet);

                // Change box color to indicate hit (optional)
                
                let name = e.id;

                for (let i=0; i<all_Enemies.length; i++) {

                    let x = all_Enemies[i];
                    if (x.Name === name) {
                        x.Character.style.backgroundColor = "orange";
                        x.Health -= 50;
                        x.HP.innerHTML = `Health: ${x.Health}`;
                        if (x.Health <= 0) {
                            document.body.removeChild(x.Character);
                            all_Enemies.splice(i, 1);
                            console.log(all_Enemies)

                            function removeEnemy(name) {
                                if (enemyIntervals[name]) {
                                    clearInterval(enemyIntervals[name].movement);
                                    clearInterval(enemyIntervals[name].shooting);
                                    delete enemyIntervals[name];
                                }
                            }
                            
                            
                        }
                        setInterval(()=>{
                            x.Character.style.backgroundColor = "rgb(255, 0, 0)";
                        }, 500)
                    }
        
                }
                
                
                break; // Exit loop after detecting collision
            }
        }
    }
    requestAnimationFrame(checkBulletCollisions);
}


/*Bullet collision for enemy */
let bullets2 = []; // Store bullets for collision detection

/** A function for the enemies to shoot at the player*/

function shoot_bullet_Enemy(enemyChar) {
    if (!enemyChar) return; // Ensure enemy exists before shooting

    let enemyRect = enemyChar.getBoundingClientRect();

    // Ensure enemy is actually inside the visible area before shooting
    if (
        enemyRect.right < 0 || enemyRect.left > window.innerWidth ||
        enemyRect.bottom < 0 || enemyRect.top > window.innerHeight
    ) {
        return; // Don't shoot if the enemy is off-screen
    }

        let bullet = document.createElement("div");
        
        bullet.style.position = "absolute"; 
        bullet.style.width = `20px`;
        bullet.style.height = `10px`;
        bullet.style.backgroundColor = "red";
        bullet.style.boxShadow = "0px 0px 30px red";
        bullet.className = "bullets";
        document.body.appendChild(bullet);
        
        let bulletX = enemyRect.left + window.scrollX + enemyRect.width / 2;
        let bulletY = enemyRect.top + window.scrollY + enemyRect.height / 2;

        bullet.style.left = `${bulletX}px`;
        bullet.style.top = `${bulletY}px`;

        let dx = Plr.offsetLeft - bulletX;
        let dy = Plr.offsetTop - bulletY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        bullet.style.transform = `rotate(${angle}deg)`;
        bullet.angle = angle;

        bullets2.push(bullet);

        function animateBullet() {
            let rad = bullet.angle * (Math.PI / 180);
            let speed = 10;
            bulletX += Math.cos(rad) * speed;
            bulletY += Math.sin(rad) * speed;

            bullet.style.left = `${bulletX}px`;
            bullet.style.top = `${bulletY}px`;

            // Call checkBulletCollisions_Enemy here
            checkBulletCollisions_Enemy(bullet);

            if (
                bulletX > 0 && bulletX < window.innerWidth &&
                bulletY > 0 && bulletY < window.innerHeight
            ) {
                requestAnimationFrame(animateBullet);
            } else {
                bullet.remove();
                bullets2 = bullets2.filter(b => b !== bullet);
            }
    }

    requestAnimationFrame(animateBullet);eout(()=>{plr.Ammo = 30}, 1000)
    
}

/** A function for the bullets shot by the enemies to hit the player*/
function checkBulletCollisions_Enemy(bullet) {
    if (isColliding(bullet, Plr)) {
        // Bullet hit player
        console.log("Enemy Bullet Hit Player!");
        bullet.remove();
        bullets2 = bullets2.filter(b => b !== bullet);

        Plr.style.backgroundColor = "orange";
        plr.Health -= 5;
        plr.HP.innerHTML = `Health: ${plr.Health}`;

        if (plr.Health <= 0) {
            document.body.removeChild(Plr);
            location.reload()
        }
    }
}



/* create the enemy object */
function make_Enemies(name, character) {

    const enemy = {
        Name: name,
        Character: character,
        Left_Eye: document.getElementById(`${name}-eye-1`),
        Right_Eye: document.getElementById(`${name}-eye-2`),
        Health: 100,
        Ammo: 30,
        Speed: 5,
        coolDownActive: false,
        movementEnabled: true,
        Front_Feeler: document.getElementById(`${name}-collision-check-front`),
        Left_Feeler: document.getElementById(`${name}-collision-check-left`),
        Right_Feeler: document.getElementById(`${name}-collision-check-right`),
        Back_Feeler: document.getElementById(`${name}-collision-check-back`),
        HP: document.getElementById(`${name}-HPteller`),
    }

    return enemy
}

/* create the enemy character */

function makeCharacter(name) {

    const charText = `

        <div class="Eye-Left" id="${name}-eye-1"></div>
        <div class="Eye-Right" id="${name}-eye-2"></div>
        <div id="${name}-collision-check-front" style="width: 10px; height: 50px; background-color: rgb(255, 255, 255); margin-left: 50px;position: absolute;"></div>
        <div id="${name}-collision-check-back" style="width: 10px; height: 50px; background-color: rgb(255, 255, 255); margin-left: -10px;position: absolute;"></div>
        <div id="${name}-collision-check-left" style="width: 50px; height: 10px; background-color: rgb(255, 255, 255); margin-left: 0px; margin-top: -10px;position: absolute;"></div>
        <div id="${name}-collision-check-right" style="width: 50px; height: 10px; background-color: rgb(255, 255, 255); margin-left: 0px; margin-top: 50px;position: absolute;"></div>
        <p id="${name}-HPteller" style="text-align:justify; justify-content: center; font-size: small; font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; color: green; box-shadow: 0px 0px 10px green;">Health: 100</p>
        
    `

    const newPlayer = document.createElement("div");
    newPlayer.id = name;
    newPlayer.className = "enemies";

    /*

    position: relative;
    width: 50px;
    height: 50px;
    background-color: rgb(255, 0, 0);
    box-shadow: 0px 0px 20px aqua;
    left: 150px;
    top:250px;

    */

    let p = Plr.getBoundingClientRect 
    newPlayer.style.position = "fixed";
    newPlayer.style.width = `50px`;
    newPlayer.style.height = "50px";
    newPlayer.style.backgroundColor = "rgb(255, 0, 0)";
    newPlayer.style.boxShadow = "0px 0px 20px aqua";
    
    if (leftB.value !== "") {
        newPlayer.style.left = leftB.value;
        newPlayer.style.top = topB.value;
    } else {
        newPlayer.style.left = `${Math.random() * (window.innerWidth - 50)}px`; 
        newPlayer.style.top = `${Math.random() * (window.innerHeight - 50)}px`;  
    }

    newPlayer.innerHTML = charText;

    document.body.appendChild(newPlayer);
    return newPlayer;
}

/* Move the character according to the where he's facing */
function moveAccordingToOrientation() { 

    let speed = plr.Speed
    if (keys["w"]) { // Move right relative to angle
        posX += speed * cosA;
        posY += speed * sinA;
    }
    if (keys["s"]) { // Move left relative to angle
        posX -= speed * cosA;
        posY -= speed * sinA;
    }

    if (keys["a"]) { // Move forward relative to angle
        posX += speed * sinA;
        posY -= speed * cosA;
    }

    if (keys["d"]) { // Move backward relative to angle
        posX -= speed * sinA;
        posY += speed * cosA;
    }


    Plr.style.left = `${posX}px`;
    Plr.style.top = `${posY}px`;

    

    requestAnimationFrame(moveAccordingToOrientation);
}



/*  collision checker for the player and the boxes (although the collsion is very buggy) */
function isColliding(a, b) { 

    if (!(a instanceof HTMLElement) || !(b instanceof HTMLElement)) {
        console.error("One or both elements are invalid.");
        return false;
    }

    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();

    return !(
        rectA.right < rectB.left ||
        rectA.left > rectB.right ||
        rectA.bottom < rectB.top ||
        rectA.top > rectB.bottom
    );
}

// Check collision in a loop
function checkCollisionLoop() {
    let side = "front";
    for (i of boxes) {
        if (isColliding(i, plr.Front_Feeler)) {
            plr.Front_Feeler.style.backgroundColor = "red";
            dis.w = true;
            side = "front";
        }else {
            plr.Front_Feeler.style.backgroundColor = "white"
            dis.w = false 
        }
        if (isColliding(i, plr.Back_Feeler)) { 
            plr.Back_Feeler.style.backgroundColor = "red"
            dis.s = true
            side = "back";
        }else {
            plr.Back_Feeler.style.backgroundColor = "white"
            dis.s = false 
        }
        if (isColliding(i, plr.Left_Feeler)) { 
            plr.Left_Feeler.style.backgroundColor = "red"
            dis.a = true
            side = "left";
        }else {
            plr.Left_Feeler.style.backgroundColor = "white"
            dis.a = false 
        }
        if (isColliding(i, plr.Right_Feeler)) { 
            plr.Right_Feeler.style.backgroundColor = "red"
            dis.d = true
            side = "right";
        }else {
            plr.Right_Feeler.style.backgroundColor = "white"
            dis.d = false 
        }
        if (isColliding(i, Plr)) { 
            Plr.style.backgroundColor = "red"
            let speed = 10;
            if (side === "front") {
                posX -= speed * cosA;
                posY -= speed * sinA;
                Plr.style.left = `${posX}px`;
                Plr.style.top = `${posY}px`;
            }else if (side === "left") {
                posX -= speed * sinA;
                posY += speed * cosA;
            
                
                Plr.style.left = `${posX}px`;
                Plr.style.top = `${posY}px`;
            }else if (side === "right") {
                posX += speed * sinA;
                posY -= speed * cosA;
                Plr.style.left = `${posX}px`;
                Plr.style.top = `${posY}px`;
            }else if (side === "back") {
                posX += speed * cosA;
                posY += speed * sinA;
                Plr.style.left = `${posX}px`;
                Plr.style.top = `${posY}px`;
            }
        }else {
            Plr.style.backgroundColor = "aqua"
            
        }
    }
    
    requestAnimationFrame(checkCollisionLoop);
}




let rad = angle * (Math.PI / 180);
let cosA = Math.cos(rad);
let sinA = Math.sin(rad);

/* Rotate the player to face the mouse */
addEventListener("mousemove", function(event) {
    let fx = Plr.offsetLeft + Plr.offsetWidth / 2;
    let fy = Plr.offsetTop + Plr.offsetHeight / 2;

    let dx = event.clientX - fx;
    let dy = event.clientY - fy;

    angle = Math.atan2(dy, dx) * (180 / Math.PI);
    Plr.style.transform = `rotate(${angle}deg)`;
    rad = angle * (Math.PI / 180);
    cosA = Math.cos(rad);
    sinA = Math.sin(rad);
});

/* Handle movement */
addEventListener("keydown", (event) => { 
    if (dis[event.key] === false) {
        keys[event.key] = true;
        
        
    }else{keys[event.key] = false;}
});

addEventListener("keyup", (event) => {
    keys[event.key] = false; 
})

/**Shoot bullets upon clicking */
let alt = false
addEventListener("mousedown", (event) => { 
    if (plr.coolDownActive === false) {

        if (alt == false) {
            plr.coolDownActive = true;
            let eyeRect = plr.Left_Eye.getBoundingClientRect(); // Get absolute position

            pX = eyeRect.left + window.scrollX; // Account for scrolling
            pY = eyeRect.top + window.scrollY;  // Account for scrolling

            console.log("Bullet spawn position:", pX, pY); // Debugging

            shoot_bullet();

            setInterval(()=> {plr.coolDownActive = false;  alt = true}, 700)
        } else {
            plr.coolDownActive = true;
            let eyeRect = plr.Right_Eye.getBoundingClientRect(); // Get absolute position

            pX = eyeRect.left + window.scrollX; // Account for scrolling
            pY = eyeRect.top + window.scrollY;  // Account for scrolling

            console.log("Bullet spawn position:", pX, pY); // Debugging

            shoot_bullet();

            setInterval(()=> {plr.coolDownActive = false; alt = false}, 700)
        }

    }
});

/**create enemies when you press the button */

setTimeout(() => {
    
    mB.addEventListener("mousedown", ()=>{

        let name = nameBox.value
        let char = makeCharacter(name);
        
        let enemy = make_Enemies(name, char);
        all_Enemies.push(enemy);

        
    })
    // Store intervals for each enemy

/**spawn an enemy ever 10 seconds*/
setInterval(() => {
    let name = `enemy ${Math.ceil(Math.random() * 1000000)}`;
    let char = makeCharacter(name);
    let enemy = make_Enemies(name, char);

    all_Enemies.push(enemy);

    function trackEnemy(char) {
        if (!char) return;
    
        let fx = char.offsetLeft + char.offsetWidth / 2;
        let fy = char.offsetTop + char.offsetHeight / 2;
    
        let dx = Plr.offsetLeft - fx;
        let dy = Plr.offsetTop - fy;
    
        let angle2 = Math.atan2(dy, dx) * (180 / Math.PI);
        char.style.transform = `rotate(${angle2}deg)`;
    }
    // Store individual intervals for movement and shooting
    
    enemyIntervals[name] = {
        movement: setInterval(() => trackEnemy(char), 50), // Enemy follows the player
        /**enemies shoot bullets at the player every 700ms */
        shooting: setInterval(() => {
            console.log(`Enemy ${name} shooting!`); 
            shoot_bullet_Enemy(char); // Pass the enemy reference
        }, 700) // Shoot every 700ms
    };
}, 10000);

    
}, 1000);

/**call the movement function*/
moveAccordingToOrientation();
// Ensure elements exist first

/**check for collisions between the player and the object after 100ms*/
setTimeout(() => {
    
    checkCollisionLoop();
}, 100);


checkBulletCollisions(); // Start the bullets' collision check loop
