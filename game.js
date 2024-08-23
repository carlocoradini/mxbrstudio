document.addEventListener('DOMContentLoaded', function () {
    const clientId = sessionStorage.getItem('clientId');
    const username = sessionStorage.getItem('username');
    const roomName = sessionStorage.getItem('roomName');

    if (!clientId || !username || !roomName) {
        alert('Informações de jogo não encontradas. Redirecionando para o lobby.');
        window.location.href = 'home.html';
        return;
    }

    const socket = new WebSocket('ws://localhost:8080');
    let gameStarted = false;
    let gameOverHandled = false;

    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');

    const waveImage = new Image();
    waveImage.src = 'waves2.png';

    const boatImage = new Image();
    boatImage.src = 'pixil-frame-0.png';

    const boat = {
        x: 10,
        y: 660,
        width: 60,
        height: 60,
        speed: 0,
        username: username
    };

    let angle = 0;
    const angleSpeed = 0.05;
    const maxAngle = 0.1;

    let button = {
        x: Math.random() * (canvas.width - 200) + 100,
        y: Math.random() * (canvas.height - 200) + 100,
        radius: 25
    };

    const wave = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        horizontalSpeed: 0.24,
        verticalSpeed: 0.5,
        maxHorizontalMovement: 5,
        maxVerticalMovement: 20
    };

    const backgroundMusic = new Audio('background.mp3');
    backgroundMusic.loop = true; 
    backgroundMusic.volume = 0.125; 

    let playerStates = {};

    socket.onopen = () => {
        console.log('Conexão WebSocket estabelecida');
        socket.send(JSON.stringify({
            type: 'rejoin_game',
            roomName: roomName,
            username: username
        }));
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(`Mensagem recebida: ${event.data}`);
        switch (message.type) {
            case 'game_state':
                updateGameState(message.players);
                if (!gameStarted) {
                    startGame();
                    gameStarted = true;
                }
                break;
            case 'update_player_state':
                updatePlayerState(message.username, message.position, message.speed);
                break;
            case 'room_state':
                updateRoomState(message.gameState);
                break;
            case 'game_over':
                handleGameOver(message.username);
                break;
        }
    };

    function updateRoomState(gameState) {
        gameState.players.forEach(player => {
            if (player.username !== boat.username) {
                playerStates[player.username] = {
                    x: player.position.x,
                    y: player.position.y,
                    speed: player.speed,
                    username: player.username
                };
            }
        });
    }

    function updatePlayerState(username, position, speed) {
        console.log(`Atualizando estado do jogador: ${username}, posição: (${position.x}, ${position.y}), velocidade: ${speed}`);
        if (username !== boat.username) {
            playerStates[username] = {
                x: position.x,
                y: position.y,
                speed: speed,
                username: username
            };
        }
    }

    function sendPlayerState() {
        const playerState = {
            type: 'update_player_state',
            username: boat.username,
            position: { x: boat.x, y: boat.y },
            speed: boat.speed,
            roomName: roomName
        };
        socket.send(JSON.stringify(playerState));
    }

    function updateGameState(players) {
        players.forEach(player => {
            if (player.username !== boat.username) {
                playerStates[player.username] = {
                    x: player.position.x,
                    y: player.position.y,
                    speed: player.speed,
                    username: player.username
                };
            }
        });
    }


    function drawPlayers() {

        for (const username in playerStates) {
            if (playerStates.hasOwnProperty(username)) {
                const player = playerStates[username];
                context.save();
                context.translate(player.x + boat.width / 2, player.y + boat.height / 2);
                context.rotate(Math.sin(angle) * maxAngle);
                context.drawImage(boatImage, -boat.width / 2, -boat.height / 2, boat.width, boat.height);
                context.restore();
                context.fillStyle = 'black';
                context.font = '20px Arial';
                context.textAlign = 'center';
                context.fillText(player.username, player.x + boat.width / 2, player.y - 10);
            }
        }

        context.save();
        context.translate(boat.x + boat.width / 2, boat.y + boat.height / 2);
        context.rotate(Math.sin(angle) * maxAngle);
        context.drawImage(boatImage, -boat.width / 2, -boat.height / 2, boat.width, boat.height);
        context.restore();
        context.fillStyle = 'black';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.fillText(boat.username, boat.x + boat.width / 2, boat.y - 10);
    }


    function drawWaves() {
        const scaleFactor = 1; 
        const scaledWidth = wave.width * scaleFactor;
        const scaledHeight = wave.height * scaleFactor;

        wave.x -= wave.horizontalSpeed; 

        if (wave.x <= -scaledWidth) {
            wave.x = 0;
        }

        wave.y += wave.verticalSpeed;

        if (wave.y >= 400 + wave.maxVerticalMovement || wave.y <= 400 - wave.maxVerticalMovement) {
            wave.verticalSpeed *= -1; // Inverte a direção vertical
        }

        // Desenha as ondas em loop contínuo
        for (let i = wave.x; i < canvas.width; i += scaledWidth) {
            context.drawImage(waveImage, i, wave.y, scaledWidth, scaledHeight);
            context.drawImage(waveImage, i + scaledWidth, wave.y, scaledWidth, scaledHeight);
        }
    }

    function drawButton() {
        context.fillStyle = 'green';
        context.beginPath();
        context.arc(button.x, button.y, button.radius, 0, 2 * Math.PI);
        context.fill();
    }

    function isInsideCircle(x, y, circle) {
        const dx = x - circle.x;
        const dy = y - circle.y;
        return Math.sqrt(dx * dx + dy * dy) < circle.radius;
    }

    function moveBoat() {
        boat.x += boat.speed;
        if (boat.x > canvas.width + boat.width * 0.10) {
            socket.send(JSON.stringify({ type: 'game_over', username: boat.username }));
            handleGameOver(boat.username);
            return;
        }
        sendPlayerState();
    }

    function handleGameOver(winnerUsername) {
        if (gameOverHandled) return;
        gameOverHandled = true;

        const message = winnerUsername === boat.username ? 'Você ganhou!' : `${winnerUsername} venceu o jogo!`;
        alert(message);

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    }

    function generateRandomButton() {
        button.x = Math.random() * (canvas.width - 200) + 100;
        button.y = Math.random() * (canvas.height - 200) + 100;
    }

    let lastClickTime = 0;

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (isInsideCircle(mouseX, mouseY, button)) {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastClickTime;

            boat.speed += 200 / timeDiff;
            lastClickTime = currentTime;

            generateRandomButton();
            sendPlayerState();
        }
    });

    function startGame() {
        backgroundMusic.play();
        generateRandomButton();
        drawGame();
        setInterval(sendPlayerState, 50);
    }

    function drawGame() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawWaves();
        drawPlayers();
        drawButton();

        moveBoat();

        angle += angleSpeed;
        requestAnimationFrame(drawGame);
    }


    let imagesLoaded = 0;
    function onImageLoad() {
        imagesLoaded++;
        if (imagesLoaded === 2) {
            wave.width = waveImage.width;
            wave.height = waveImage.height;
            socket.send(JSON.stringify({ type: 'ready_to_start', username: username, roomName: roomName }));
            startGame();
        }
    }

    waveImage.onload = onImageLoad;
    boatImage.onload = onImageLoad;
});