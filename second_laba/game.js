var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

window.onload = function() {
    document.addEventListener('touchstart', changeTouchStart);
    document.addEventListener('touchmove', changeTouchMove);
    document.addEventListener('touchend', changeTouchEnd);
    document.addEventListener("mousemove", changeMousePos);
    document.addEventListener('mousedown', mKeyPressed);
    document.addEventListener('mouseup', mKeyReleased);
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);
    canvas.addEventListener('click', changeLMousePos);
}


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const KEY_CODES = {
    LEFT_MOUSE: 0,
    SPACEBAR: 32,
    LEFT_KEY: 37,
    UP_KEY: 38,
    RIGHT_KEY: 39,
    DOWN_KEY: 40,
}





function draw() {
    game.draw();
}

function changeTouchEnd(e) {
    dTouchX = 0;
    dTouchY = 0;
}

function changeTouchMove(e) {
    dTouchX = lTouchX - e.touches[0].clientX;
    dTouchY = lTouchY - e.touches[0].clientY;
    lTouchX = e.touches[0].clientX;
    lTouchY = e.touches[0].clientY;
}

function changeTouchStart(e) {
    lTouchX = e.touches[0].clientX;
    lTouchY = e.touches[0].clientY;
}

function clearLMousePos() {
    lMouseY = null;
    lMouseX = null;
}

function changeLMousePos(e) {
    // EventListener Click Mouse
    lMouseX = e.clientX;
    lMouseY = e.clientY;

}

function changeMousePos(e) {
    // EventListener mousemove
    mouseY = e.clientY;
    mouseX = e.clientX;
}

function mKeyPressed(e) {
    // EventListener mouse key pressed
    keysStatus[e.button] = true;
}

function mKeyReleased(e) {
    // EventListener mouse key released
    keysStatus[e.button] = false;
}

function keyPressed(e) {
    // EventListener keydown
    keysStatus[e.keyCode] = true;

}

function keyReleased(e) {
    // EventListener keyup
    keysStatus[e.keyCode] = false;
}



class Bullet {
    constructor(ctx, objGame, x, y, color, angle = Math.PI / 2, damageToPlayer = 0, damageToEnemy = 0) {
        this.del = false;
        this.ctx = ctx;
        this.objGame = objGame;
        this.color = color;
        this.radius = canvas.height / 150;
        this.speed = canvas.height / 150;
        this.angle = angle;
        this.x = x - this.radius / 2;
        this.y = y - this.radius / 2;
        this.damageToPlayer = damageToPlayer;
        this.damageToEnemy = damageToEnemy;

    }

    draw() {
        if (!this.checkCrush()) {
            this.drawBullet();
            this.move();
        } else {
            this.del = true;
        }
    }

    move() {
        this.y -= this.speed * Math.sin(this.angle);
        this.x -= this.speed * Math.cos(this.angle);
    }

    drawBullet() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x + this.radius / 2, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    checkCrush() {
        if (this.y + this.radius * 2 < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width) { //borders
            return true;
        }
        for (const obj of this.objGame.drawableObjects[1]) { //esLi adelo
            if (Math.pow(obj.x + obj.width / 2 - this.x, 2) + Math.pow(obj.y + obj.height / 2 - this.y, 2) <= Math.pow(obj.radius, 2)) {
                if (obj.type === 'player' && this.damageToPlayer !== 0) {
                    obj.takeDamage(this.damageToPlayer);
                }
                if (obj.type === 'enemy' && this.damageToEnemy !== 0) {
                    obj.countOfLives -= this.damageToEnemy;
                    this.objGame.currentScore += this.damageToEnemy;
                }
                return true;
            }
        }
        return false;
    }
} //rabotaet


class Player {
    constructor(x, y, ctx, objGame, controlledBy) {
        this.type = 'player';
        this.del = false;
        this.objGame = objGame;
        this.ctx = ctx;
        this.countOfLives = 10;
        this.damage = 1;
        this.maxFiringFrequency = 300; // balance?
        this.immortal = false;
        this.timeOfLastImmortal = Date.now();
        this.timeOfLastShot = Date.now();
        this.autoFire = false;
        this.img = new Image();
        this.img.src = 'images/playerpic.png';

        this.width = window.innerHeight / 10;
        this.height = this.width;
        this.radius = this.width / 4;
        this.speed = this.width / 40;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;

        switch (controlledBy) {
            case 1:
                this.movemenetInterval = setInterval(this.controlledByMouse, 1, this);
                this.autoFire = false;
                break;
            case 2:
                this.movemenetInterval = setInterval(this.controlledByMouseAuto, 1, this);
                this.autoFire = true;
                break;
            case 3:
                this.movemenetInterval = setInterval(this.controlledByTouchAuto, 1, this);
                this.autoFire = true;
                break;
            default:
                this.movemenetInterval = setInterval(this.controlledByKeyboard, 1, this);
                this.autoFire = false;
        }
    }

    draw() {
        this.checkCrush();
        if (this.countOfLives <= 0) {
            this.death();
        }
        this.drawLifes();
        this.drawPlayer();
        if (this.immortal) {
            this.drawImmortal();
            if (Date.now() - 3000 - this.timeOfLastImmortal >= 0) {
                this.timeOfLastImmortal = Date.now();
                this.immortal = false;
            }
        }
        if (this.autoFire) {
            this.fire();
        }
    }

    drawPlayer() {
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        this.ctx.beginPath();
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawLifes() {
        this.ctx.beginPath();
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '25px Calibri';
        this.ctx.textAlign = 'start';
        this.ctx.fillText(`❤️  ${this.countOfLives}`, 10, 30);
        this.ctx.closePath();
    }

    fire() {
        if (Date.now() - this.timeOfLastShot - this.maxFiringFrequency > 0) {
            this.timeOfLastShot = Date.now();
            this.drawFireSpray(1);
        }
    }

    drawFireSpray(n) {
        for (let i = 1; i < n + 1; i++) {
            this.objGame.drawableObjects[0].push(new Bullet(ctx, this.objGame, this.x + this.width / 2, this.y - 15, '#a00404', Math.PI / (n + 1) * i, 0, this.damage));
        }
    }

    drawImmortal() {
        this.ctx.fillStyle = 'rgba(32,20,186,0.4)'
        this.ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2)),
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    addToCoord(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    moveTo(x, y) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
    }

    controlledByKeyboard(self) {
        if (keysStatus[KEY_CODES.SPACEBAR]) {
            self.fire();
        }
        if (keysStatus[KEY_CODES.DOWN_KEY] && self.y < canvas.height - self.height) {
            self.addToCoord(0, self.speed);
        }
        if (keysStatus[KEY_CODES.UP_KEY] && self.y > 0) {
            self.addToCoord(0, -self.speed);
        }
        if (keysStatus[KEY_CODES.LEFT_KEY] && self.x > 0) {
            self.addToCoord(-self.speed, 0);
        }
        if (keysStatus[KEY_CODES.RIGHT_KEY] && self.x < canvas.width - self.width) {
            self.addToCoord(self.speed, 0);
        }
    }

    controlledByMouse(self) {
        self.shootByMouse();
        self.movementByMouse();
    }

    controlledByMouseAuto(self) {
        self.movementByMouse();
    }

    controlledByTouchAuto(self) {
        self.x -= dTouchX * 0.4;
        if (self.x <= 0) {
            self.x = 1;
        }
        if (self.x + self.width >= canvas.width) {
            self.x = canvas.width - self.width;
        }
        self.y -= dTouchY * 0.4;
        if (self.y <= 0) {
            self.y = 1;
        }
        if (self.y + self.height >= canvas.height) {
            self.y = canvas.height - self.height;
        }
    }

    shootByMouse() {
        if (keysStatus[KEY_CODES.LEFT_MOUSE]) {
            this.fire();
        }
    }

    movementByMouse() {
        this.x = mouseX - this.width / 2;
        this.y = mouseY - this.height / 2;
    }

    takeDamage(n) {
        if (!this.immortal) {
            this.countOfLives -= n;
            this.immortal = true;
            this.timeOfLastImmortal = Date.now();
        }
    }

    checkCrush() {
        for (const obj of this.objGame.drawableObjects[1]) {
            if (Math.sqrt(
                    Math.pow(this.x + this.width / 2 - obj.x - obj.width / 2, 2) +
                    Math.pow(this.y + this.height / 2 - obj.y - obj.height / 2, 2)) < (this.radius + obj.radius) &&
                obj.type !== 'player'
            ) {
                this.takeDamage(1);
            }
        }
    }

    death() {

        clearInterval(this.movemenetInterval);
        this.del = true;
    }
}

class Obstacle {
    constructor(x, y, ctx, objGame, speed, angle) {
        this.type = 'obstacle';
        this.ctx = ctx;
        this.del = false;
        this.objGame = objGame;
        this.speed = speed;
        this.angle = angle;
        this.radius = canvas.height / 20;
        this.width = this.radius * 2;
        this.height = this.width;
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.img.src = 'images/meteor.png';
    }

    draw() {
        this.movement();
        this.checkCrush();
        this.drawObstacle();
    }

    drawObstacle() {
            this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            this.ctx.beginPath();
            this.ctx.fill();
            this.ctx.closePath();
        }
        /*drawPlayer() {
            this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            this.ctx.beginPath();
            this.ctx.fill();
            this.ctx.closePath();
        }*/
    movement() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    checkCrush() {
        if (this.x + this.radius * 2 < 0 ||
            this.x - this.radius * 2 > canvas.width ||
            this.y + this.radius * 2 < 0 ||
            this.y - this.radius * 2 > canvas.height
        ) {
            this.death();
        }
    }

    death() {
        this.del = true;

    }
}

class Enemy {
    constructor(x, y, ctx, objGame) {
        objGame.enemyCount++;
        this.type = 'enemy';
        this.ctx = ctx;
        this.objGame = objGame;
        this.width = window.innerHeight / 10;
        this.height = this.width;
        this.speed = this.width / 50;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.radius = this.width / 2;
        this.del = false;
        this.timeOfLastShot = Date.now();
        this.autoFire = true;
        this.maxFiringFrequency = 500;
        this.damage = 1;
        this.countOfLives = 3;
        this.img = new Image();
        this.img.src = 'images/enemy1.png';
    }

    draw() {
        this.movement();
        this.drawEnemy();
        if (this.autoFire) {
            this.fire();
        }
        if (this.countOfLives <= 0 || this.y > canvas.height) {
            this.death();
        }
    }

    movement() {
        this.x += this.speed * 3;
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.speed *= -1;
        }
        this.y += Math.abs(this.speed) * 0.4;
    }

    drawEnemy() {
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        this.ctx.beginPath();
        this.ctx.fill();
        this.ctx.closePath();
    }

    fire() {
        if (Date.now() - this.timeOfLastShot - this.maxFiringFrequency >= 0) {
            this.timeOfLastShot = Date.now();
            this.drawFire();
        }
    }

    drawFire() {
        this.drawFireSpray(1);
    }

    drawFireSpray(n) {
        for (let i = 1; i < n + 1; i++) {
            this.objGame.drawableObjects[0].push(new Bullet(ctx, this.objGame, this.x + this.width / 2, this.y + this.height + 15, '#1fd030', Math.PI / (n + 1) * i + Math.PI, this.damage, 0));
        }
    }

    death() {
        this.objGame.enemyCount--;

        this.del = true;
    }
}

class Enemy1 extends Enemy {
    constructor(x, y, ctx, objGame) {
        super(x, y, ctx, objGame);
        //this.img = new Image();
        //this.img.src = 'images/enemy2.png';
        this.maxFiringFrequency *= 1.2;
        this.countOfLives = 10;
        t
    }

    drawEnemy() {
        this.ctx.fillStyle = 'rgb(199,0,255)';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    movement() {
        this.x += this.speed * 2;
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.speed *= -1;
        }
        this.y += Math.abs(this.speed) * 0.05;
    }

    drawFire() {
        this.drawFireSpray(5);
    }
}

class Boss extends Enemy1 {
    constructor(x, y, ctx, objGame) {
        super(x, y, ctx, objGame);
        this.radius *= 2.5;
        this.countOfLives = 20;
        this.frequencyOfSpawn = 7000;
        this.timeOfLastSpawn = Date.now();
        this.width *= 5;
        this.height *= 5;
    }

    movement() {
        this.x += this.speed * 2;
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.speed *= -1;
        }
    }

    draw() {
        if (Date.now() - this.frequencyOfSpawn - this.timeOfLastSpawn > 0) {
            this.timeOfLastSpawn = Date.now();
            this.spawn();
        }
        super.draw();
    }

    drawFire() {
        this.drawFireSpray(8);
    }

    spawn() {
        for (let i = 1; i < 4; i++) {
            this.objGame.drawableObjects[1].push(
                new Enemy(canvas.width / 4 * i, canvas.height / 10 + 10 * i, this.ctx, this.objGame)
            );
        }
    }
}

class Button {
    constructor(ctx, objGame, x, y, width, height, text) {
        this.ctx = ctx;
        this.objGame = objGame;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.clicked = false;
    }

    draw() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '20px Calibri';
        this.ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
        this.checkClicked();
    }

    checkClicked() {
        if (lMouseX > this.x && lMouseX < this.x + this.width && lMouseY > this.y && lMouseY < this.y + this.height) {
            this.clicked = true;
        }
    }
}

class Game {
    constructor(ctx) {
        this.drawableObjects = {
            0: [],
            1: [],
        };
        this.level = 1;
        this.levelsCount = 2;
        this.ctx = ctx;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.inBeforeGameMenu = true;
        this.inAfterGameMenu = false;
        this.timeOfLastObstacle = Date.now();
        this.frequencyOfObstacle = 1000 + 100 * Math.random();
        this.currentScore = 0;
        this.bestScore = 0;
        this.message = '';
        this.enemyCount = 0;
        this.controllerType = 0;
        this.prepareInGameBackground();
        this.prepareButtons();
    }

    prepare() {
        this.currentScore = 0;
        this.enemyCount = 0;
        // Level 1 Player, Enemies, Obstacles, Bullets
        this.player = new Player(this.width / 2, (this.height / 10) * 9, this.ctx, this, this.controllerType);
        this.drawableObjects[1].push(this.player);
        //
        this.levels(this.level);
    }

    prepareButtons() {
        let n = 4;
        this.beforeGameMenuButtons = [
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1), (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Клавиатура'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 2, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Мышь'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 3, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Мышь(авто)'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 4, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Тач(авто)'),
        ];
        n = 2
        this.afterGameMenuButtons = [
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1), (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Новая игра'),
            new Button(ctx, this, (canvas.width - canvas.width / 15) / (n + 1) * 2, (canvas.height - canvas.height / 10) / 2, canvas.width / 10, canvas.height / 7, 'Выход'),
        ];
    }

    createObstacle() {
        if (Date.now() - this.frequencyOfObstacle - this.timeOfLastObstacle > 0) {
            this.timeOfLastObstacle = Date.now();
            this.frequencyOfObstacle = 1000 + 500 * Math.random();
            this.drawableObjects[1].push(
                new Obstacle(canvas.width * Math.random(), 0, this.ctx, this, 4 + 3 * Math.random(), Math.PI * Math.random())
            );
        }
    }

    draw() {
        // Draw level 0
        this.drawBackground();
        // Draw level 1
        if (this.enemyCount <= 0 && !this.inBeforeGameMenu) {
            if (this.level === this.levelsCount) {
                this.drawableObjects[0].length = 0;
                this.drawableObjects[1].length = 0;
                this.message = 'Ты победил!';
                this.checkBestScore();
                this.level = 0;
                this.inAfterGameMenu = true;
            } else {
                this.level++;
                this.levels(this.level);
            }
        }
        if (this.inAfterGameMenu) {
            this.afterGameMenu();
        } else if (this.inBeforeGameMenu) {
            this.beforeGameMenu();
        } else {
            this.inGame();
        }

    }

    checkBestScore() {
        this.bestScore = this.currentScore > this.bestScore ? this.currentScore : this.bestScore;
    }

    drawCurrentScore() {
        this.ctx.beginPath();
        this.ctx.font = '25px Calibri';
        this.ctx.fillStyle = '#FFF';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Score: ${this.currentScore}`, canvas.width / 2, 20);
        this.ctx.fill();
        this.ctx.closePath();
    }

    inGame() {
        this.createObstacle();
        for (const obj of this.drawableObjects[0]) {
            obj.draw();
        }
        this.drawableObjects[0] = this.drawableObjects[0].filter(item => !item.del);
        for (const obj of this.drawableObjects[1]) {
            obj.draw();
        }
        this.drawableObjects[1] = this.drawableObjects[1].filter(item => !item.del);
        //
        if (typeof this.player.del !== undefined && this.player.del) {
            this.drawableObjects[0].length = 0;
            this.drawableObjects[1].length = 0;
            this.message = 'Ты умер!';
            this.checkBestScore();
            this.inAfterGameMenu = true;
        }
        this.drawCurrentScore();
    }

    beforeGameMenu() {
        for (const button of this.beforeGameMenuButtons) {
            button.draw();
        }
        for (let i = 0; i < this.beforeGameMenuButtons.length; i++) {
            if (this.beforeGameMenuButtons[i].clicked) {
                this.controllerType = i;
                this.beforeGameMenuButtons[i].clicked = false;
                clearLMousePos();
                this.inBeforeGameMenu = false;
                this.enemyCount = 0;
                this.level = 0;
                this.prepare();
                break;
            }
        }
    }

    levels(level) {
        let n = null;
        switch (level) {
            case 1:
                n = 5;
                for (let i = 1; i < n + 1; i++) {
                    this.drawableObjects[1].push(
                        new Enemy(canvas.width / (n + 1) * i, canvas.height / 10, this.ctx, this)
                    );
                }
                n = 1;
                for (let i = 1; i < n + 1; i++) {
                    this.drawableObjects[1].push(
                        new Enemy1(canvas.width / (n + 1) * i, canvas.height / 10, this.ctx, this)
                    );
                }
                break;
            case 2:
                this.drawableObjects[1].push(
                    new Boss(canvas.width / 2, canvas.height / 10, this.ctx, this)
                );
                break;
        }
    }

    afterGameMenu() {
        this.ctx.beginPath();
        this.ctx.textAlign = 'center';
        this.ctx.font = '30px Calibri';
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(this.message + `\nТвой счёт: ${this.currentScore}\nЛучший счёт: ${this.bestScore}`, canvas.width / 2, canvas.height / 4);
        this.ctx.closePath();
        for (const button of this.afterGameMenuButtons) {
            button.draw();
        }
        let status = null;
        for (let i = 0; i < this.afterGameMenuButtons.length; i++) {
            if (this.afterGameMenuButtons[i].clicked) {
                this.afterGameMenuButtons[i].clicked = false;
                status = i;
                clearLMousePos();
                break;
            }
        }
        switch (status) {
            case 0:
                this.inBeforeGameMenu = true;
                this.inAfterGameMenu = false;
                break;
            case 1:
                close();
                break;
        }
    }


    drawBackground() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#0c0b38"
        this.ctx.fillRect(0, 0, this.width, this.height);
        for (let star of this.arrayOfStars) {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(156,155,155,${Math.sin(-Date.now() * 0.0000001 + (star.x + star.y) * 0.07)})`;
            this.ctx.fillRect(star.x, star.y, 5, 5);
            this.ctx.closePath();
            star.x -= 0.1;
            star.y -= 0.1;
            if (star.x < 0) {
                star.x = this.width;
            }
            if (star.y < 0) {
                star.y = this.height;
            }
        }
    }

    prepareInGameBackground() {
        this.arrayOfStars = [];
        for (let i = 0; i < Math.floor(this.width * this.height / 2500); i++) {
            this.arrayOfStars.push({ x: Math.random() * this.width, y: Math.random() * this.height })
        }
    }
}




let keysStatus = {};
let mouseX = 0;
let mouseY = 0;
let lMouseX = 0;
let lMouseY = 0;
let lTouchX = 0;
let lTouchY = 0;
let dTouchX = 0;
let dTouchY = 0;
let game = new Game(ctx);
let inGame = true;
let drawInterval = setInterval(draw, 1000 / 60);





/*
                         this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                         this.ctx.fill();
                         this.ctx.fillStyle = '#fff';
                         this.ctx.font = '20px Calibri';
                         this.ctx.textBaseline = 'middle';
                         this.ctx.textAlign = 'center';
                         this.ctx.fillText('M', this.x, this.y);*/