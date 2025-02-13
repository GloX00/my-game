const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const gameOverMenu = document.getElementById("gameOver");
const winMenu = document.createElement("div");

winMenu.classList.add("menu", "hidden");
winMenu.innerHTML = `<h2>Победа! Ну ты и лох 😂</h2><button onclick="restartGame()">Играть снова</button>`;
document.body.appendChild(winMenu);

let player, bonuses, mobs, shields, level, isGameOver, lives;
let keys = {};
let touchX = null, touchY = null; // Координаты касания

const MAX_LEVEL = 10;

function startGame() {
    menu.classList.add("hidden");
    canvas.classList.remove("hidden");
    gameOverMenu.classList.add("hidden");
    winMenu.classList.add("hidden");

    level = 1;
    lives = 3;
    isGameOver = false;

    player = { x: 50, y: 50, size: 20, speed: 3, shield: false };
    bonuses = [];
    mobs = [];
    shields = [];

    generateBonuses();
    generateMobs();
    generateShields();
    gameLoop();
}

function restartGame() {
    startGame();
}

function generateBonuses() {
    bonuses = [];
    for (let i = 0; i < level * 2; i++) {
        bonuses.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 15
        });
    }
}

function generateMobs() {
    mobs = [];
    for (let i = 0; i < level; i++) {
        mobs.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 20,
            speedX: (Math.random() - 0.5) * 3,
            speedY: (Math.random() - 0.5) * 3
        });
    }
}

function generateShields() {
    shields = [];
    for (let i = 0; i < 1; i++) {
        shields.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            size: 20
        });
    }
}

function gameLoop() {
    if (isGameOver) return;

    movePlayer();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем игрока
    ctx.fillStyle = player.shield ? "cyan" : "blue";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Рисуем бонусы
    bonuses.forEach((bonus, index) => {
        ctx.fillStyle = "green";
        ctx.fillRect(bonus.x, bonus.y, bonus.size, bonus.size);

        if (player.x < bonus.x + bonus.size &&
            player.x + player.size > bonus.x &&
            player.y < bonus.y + bonus.size &&
            player.y + player.size > bonus.y) {
            bonuses.splice(index, 1);
        }
    });

    // Рисуем щиты
    shields.forEach((shield, index) => {
        ctx.fillStyle = "blue";
        ctx.fillRect(shield.x, shield.y, shield.size, shield.size);

        if (player.x < shield.x + shield.size &&
            player.x + player.size > shield.x &&
            player.y < shield.y + shield.size &&
            player.y + player.size > shield.y) {
            player.shield = true;
            shields.splice(index, 1);
        }
    });

    // Двигаем мобов и рисуем их
    mobs.forEach((mob, index) => {
        mob.x += mob.speedX;
        mob.y += mob.speedY;

        if (mob.x < 0 || mob.x + mob.size > canvas.width) mob.speedX *= -1;
        if (mob.y < 0 || mob.y + mob.size > canvas.height) mob.speedY *= -1;

        ctx.fillStyle = "red";
        ctx.fillRect(mob.x, mob.y, mob.size, mob.size);

        // Проверка столкновения с мобом
        if (player.x < mob.x + mob.size &&
            player.x + player.size > mob.x &&
            player.y < mob.y + mob.size &&
            player.y + player.size > mob.y) {
            
            if (player.shield) {
                player.shield = false;
            } else {
                lives--;
                if (lives <= 0) {
                    gameOver();
                    return;
                }
            }
            mobs.splice(index, 1);
        }
    });

    // Если все бонусы собраны
    if (bonuses.length === 0) {
        if (level === MAX_LEVEL) {
            winGame();
            return;
        }
        level++;
        generateBonuses();
        generateMobs();
        generateShields();
    }

    drawLives();
    drawLevel();
    requestAnimationFrame(gameLoop);
}

// Рисуем жизни
function drawLives() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Жизни: " + lives, 10, 20);
}

// Рисуем уровень
function drawLevel() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Уровень: " + level, canvas.width - 120, 20);
}

// Двигаем игрока (добавлено касание)
function movePlayer() {
    if (keys["ArrowUp"] || (touchY !== null && touchY < player.y)) player.y -= player.speed;
    if (keys["ArrowDown"] || (touchY !== null && touchY > player.y)) player.y += player.speed;
    if (keys["ArrowLeft"] || (touchX !== null && touchX < player.x)) player.x -= player.speed;
    if (keys["ArrowRight"] || (touchX !== null && touchX > player.x)) player.x += player.speed;
}

// Функции касания
canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
});

canvas.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
});

canvas.addEventListener("touchend", () => {
    touchX = null;
    touchY = null;
});

function gameOver() {
    isGameOver = true;
    gameOverMenu.classList.remove("hidden");
    canvas.classList.add("hidden");
}

// Победа!
function winGame() {
    isGameOver = true;
    winMenu.classList.remove("hidden");
    canvas.classList.add("hidden");
}

// Обработчики клавиш
document.addEventListener("keydown", (event) => keys[event.key] = true);
document.addEventListener("keyup", (event) => keys[event.key] = false);
