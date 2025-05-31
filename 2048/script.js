document.addEventListener('DOMContentLoaded', () => {
    // 游戏主类
    class Game2048 {
        constructor() {
            this.gridSize = 4; // 4x4网格
            this.cells = [];
            this.score = 0;
            this.gameOver = false;
            this.gameWon = false;
            this.moved = false;
            
            this.gridContainer = document.querySelector('.grid-container');
            this.tileContainer = document.querySelector('.tile-container');
            this.scoreElement = document.getElementById('score');
            this.messageContainer = document.querySelector('.game-message');
            this.messageText = this.messageContainer.querySelector('p');
            
            this.setupEventListeners();
            this.initGame();
        }
        
        // 初始化游戏
        initGame() {
            this.cells = Array.from({ length: this.gridSize }, () => 
                Array.from({ length: this.gridSize }, () => null)
            );
            
            this.score = 0;
            this.updateScore();
            this.gameOver = false;
            this.gameWon = false;
            
            this.tileContainer.innerHTML = '';
            this.messageContainer.classList.remove('game-over', 'game-won');
            
            // 初始添加两个方块
            this.addRandomTile();
            this.addRandomTile();
        }
        
        // 添加随机方块
        addRandomTile() {
            const emptyCells = [];
            
            // 找出所有空单元格
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (!this.cells[row][col]) {
                        emptyCells.push({ row, col });
                    }
                }
            }
            
            // 如果没有空单元格，返回
            if (emptyCells.length === 0) return;
            
            // 随机选择一个空单元格
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            
            // 90%概率生成2，10%概率生成4
            const value = Math.random() < 0.9 ? 2 : 4;
            
            // 在选定的单元格创建新方块
            this.cells[randomCell.row][randomCell.col] = value;
            this.addTile(randomCell.row, randomCell.col, value, true);
        }
        
        // 添加方块到DOM
        addTile(row, col, value, isNew = false, isMerged = false) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${value}`;
            if (isNew) tile.classList.add('tile-new');
            if (isMerged) tile.classList.add('tile-merged');
            
            tile.textContent = value;
            tile.dataset.row = row;
            tile.dataset.col = col;
            
            // 设置方块位置
            tile.style.top = `${row * 25 + row * 15 / 3}%`;
            tile.style.left = `${col * 25 + col * 15 / 3}%`;
            
            this.tileContainer.appendChild(tile);
        }
        
        // 更新分数
        updateScore() {
            this.scoreElement.textContent = this.score;
        }
        
        // 移动方块
        moveTiles(direction) {
            this.moved = false;
            
            // 根据移动方向决定遍历顺序
            const traversals = this.buildTraversals(direction);
            
            // 遍历所有单元格
            traversals.row.forEach(row => {
                traversals.col.forEach(col => {
                    const cell = { row, col };
                    const tile = this.cells[row][col];
                    
                    if (tile) {
                        const positions = this.findFarthestPosition(cell, direction);
                        const next = this.getNextTile(positions.farthest, direction);
                        
                        // 移动逻辑
                        if (next && next.value === tile && !next.merged) {
                            // 合并相同值的方块
                            const mergedValue = tile * 2;
                            this.cells[next.row][next.col] = mergedValue;
                            this.cells[row][col] = null;
                            
                            // 标记为已合并，防止一次移动中多次合并
                            next.merged = true;
                            
                            // 更新分数
                            this.score += mergedValue;
                            this.updateScore();
                            
                            // 检查是否达到2048
                            if (mergedValue === 2048 && !this.gameWon) {
                                this.gameWon = true;
                                this.showMessage('你赢了!', 'game-won');
                            }
                            
                            this.moved = true;
                        } else if (positions.farthest.row !== row || positions.farthest.col !== col) {
                            // 移动到最远位置
                            this.cells[positions.farthest.row][positions.farthest.col] = tile;
                            this.cells[row][col] = null;
                            this.moved = true;
                        }
                    }
                });
            });
            
            // 如果有移动，更新界面并添加新方块
            if (this.moved) {
                // 清除所有方块
                this.tileContainer.innerHTML = '';
                
                // 重新渲染所有方块
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        const value = this.cells[row][col];
                        if (value) {
                            this.addTile(row, col, value);
                        }
                    }
                }
                
                // 清除合并标记
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        if (this.cells[row][col]) {
                            delete this.cells[row][col].merged;
                        }
                    }
                }
                
                // 添加新方块
                setTimeout(() => {
                    this.addRandomTile();
                    
                    // 检查游戏是否结束
                    if (!this.movesAvailable() && !this.gameOver) {
                        this.gameOver = true;
                        this.showMessage('游戏结束!', 'game-over');
                    }
                }, 150);
            }
        }
        
        // 构建遍历顺序
        buildTraversals(direction) {
            const traversals = {
                row: Array.from({ length: this.gridSize }, (_, i) => i),
                col: Array.from({ length: this.gridSize }, (_, i) => i)
            };
            
            // 根据方向调整遍历顺序
            if (direction === 'right') traversals.col = traversals.col.reverse();
            if (direction === 'down') traversals.row = traversals.row.reverse();
            
            return traversals;
        }
        
        // 找到给定方向上的最远位置
        findFarthestPosition(cell, direction) {
            let previous;
            let current = cell;
            
            // 沿着给定方向移动直到碰到边界或其他方块
            do {
                previous = current;
                current = this.getNextPosition(current, direction);
            } while (current && !this.cells[current.row][current.col]);
            
            return {
                farthest: previous,
                next: current
            };
        }
        
        // 获取下一个位置
        getNextPosition(cell, direction) {
            const vector = this.getVector(direction);
            const row = cell.row + vector.row;
            const col = cell.col + vector.col;
            
            // 检查是否超出边界
            if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
                return null;
            }
            
            return { row, col };
        }
        
        // 获取下一个方块
        getNextTile(cell, direction) {
            const next = this.getNextPosition(cell, direction);
            if (!next) return null;
            
            const value = this.cells[next.row][next.col];
            if (!value) return null;
            
            return {
                row: next.row,
                col: next.col,
                value: value
            };
        }
        
        // 获取方向向量
        getVector(direction) {
            const vectors = {
                'up': { row: -1, col: 0 },
                'right': { row: 0, col: 1 },
                'down': { row: 1, col: 0 },
                'left': { row: 0, col: -1 }
            };
            
            return vectors[direction];
        }
        
        // 检查是否还有可用移动
        movesAvailable() {
            // 检查是否有空单元格
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (!this.cells[row][col]) {
                        return true;
                    }
                }
            }
            
            // 检查是否有可合并的方块
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    const directions = ['up', 'right', 'down', 'left'];
                    
                    for (const direction of directions) {
                        const next = this.getNextTile({ row, col }, direction);
                        
                        if (next && next.value === this.cells[row][col]) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        }
        
        // 显示游戏消息
        showMessage(text, className) {
            this.messageText.textContent = text;
            this.messageContainer.classList.add(className);
        }
        
        // 设置事件监听器
        setupEventListeners() {
            // 键盘控制
            document.addEventListener('keydown', (event) => {
                if (this.gameOver || this.gameWon) return;
                
                // 阻止方向键滚动页面
                if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 
                     'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(event.key)) {
                    event.preventDefault();
                }
                
                let direction;
                
                switch (event.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        direction = 'up';
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        direction = 'right';
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        direction = 'down';
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        direction = 'left';
                        break;
                    default:
                        return;
                }
                
                this.moveTiles(direction);
            });
            
            // 触摸控制
            let touchStartX, touchStartY;
            let touchEndX, touchEndY;
            
            document.addEventListener('touchstart', (event) => {
                if (this.gameOver || this.gameWon) return;
                
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            });
            
            document.addEventListener('touchend', (event) => {
                if (this.gameOver || this.gameWon) return;
                
                touchEndX = event.changedTouches[0].clientX;
                touchEndY = event.changedTouches[0].clientY;
                
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                // 需要一定的最小滑动距离
                const minDistance = 30;
                
                if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) {
                    return; // 滑动距离太小，忽略
                }
                
                let direction;
                
                // 判断滑动方向
                if (Math.abs(dx) > Math.abs(dy)) {
                    // 水平滑动
                    direction = dx > 0 ? 'right' : 'left';
                } else {
                    // 垂直滑动
                    direction = dy > 0 ? 'down' : 'up';
                }
                
                this.moveTiles(direction);
            });
            
            // 新游戏按钮
            document.getElementById('new-game').addEventListener('click', () => {
                this.initGame();
            });
            
            // 重试按钮
            document.getElementById('retry').addEventListener('click', () => {
                this.initGame();
            });
        }
    }
    
    // 创建并启动游戏
    const game = new Game2048();
});