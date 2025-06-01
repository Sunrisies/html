// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GAME_SPEED = 100; // 游戏速度（毫秒）

// 游戏变量
let canvas, ctx;
let snake, food;
let direction, nextDirection;
let score;
let gameInterval;
let gameRunning;

// 初始化游戏
function initGame() {
    // 获取Canvas元素和上下文
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 重置游戏状态
    resetGame();
    
    // 设置键盘事件监听
    document.addEventListener('keydown', handleKeyPress);
    
    // 开始游戏循环
    gameRunning = true;
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

// 重置游戏状态
function resetGame() {
    // 初始化蛇
    snake = [
        {x: 5, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 5}
    ];
    
    // 初始方向（右）
    direction = 'right';
    nextDirection = 'right';
    
    // 重置分数
    score = 0;
    updateScore();
    
    // 生成第一个食物
    generateFood();
}

// 游戏主循环
function gameLoop() {
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // 吃到食物，不移除尾部（蛇变长）
        score += 10;
        updateScore();
        generateFood();
    } else {
        // 没吃到食物，移除尾部
        snake.pop();
    }
    
    // 绘制游戏
    drawGame();
}

// 移动蛇
function moveSnake() {
    // 获取蛇头
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新蛇头添加到蛇身前面
    snake.unshift(head);
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= canvas.width / GRID_SIZE || 
        head.y >= canvas.height / GRID_SIZE
    ) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let foodPosition;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        foodPosition = {
            x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
            y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
        };
        
        // 检查食物是否生成在蛇身上
        for (let segment of snake) {
            if (segment.x === foodPosition.x && segment.y === foodPosition.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = foodPosition;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50'; // 蛇身颜色
    for (let segment of snake) {
        ctx.fillRect(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            GRID_SIZE, 
            GRID_SIZE
        );
        
        // 绘制边框
        ctx.strokeStyle = '#388E3C';
        ctx.strokeRect(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            GRID_SIZE, 
            GRID_SIZE
        );
    }
    
    // 绘制蛇头（不同颜色）
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(
        snake[0].x * GRID_SIZE, 
        snake[0].y * GRID_SIZE, 
        GRID_SIZE, 
        GRID_SIZE
    );
    
    // 绘制食物
    ctx.fillStyle = '#FF5722'; // 食物颜色
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 处理键盘按键
function handleKeyPress(event) {
    // 根据按键设置下一个方向
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case ' ': // 空格键重新开始游戏
            if (!gameRunning) {
                resetGame();
                gameRunning = true;
                gameInterval = setInterval(gameLoop, GAME_SPEED);
            }
            break;
    }
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = `分数: ${score}`;
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    
    // 绘制游戏结束文字
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`最终分数: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '20px Arial';
    ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 60);
}

// 当页面加载完成后初始化游戏
window.onload = initGame;