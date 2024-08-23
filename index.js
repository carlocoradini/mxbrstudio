const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const activeUsers = new Map(); // Mapeia conexões WebSocket para nomes de usuários
const activeRooms = new Map(); // Mapeia salas de jogo para arrays de jogadores
const playerData = new Map(); // Mapeia jogadores para seus estados (posição e velocidade)
const clients = new Map(); // Mapeia IDs únicos para WebSocket
const rooms = new Map(); // Formato: { roomName: { players: Map(), gameState: {...} } }

wss.on('connection', function connection(ws) {
    const clientId = generateUniqueId();
    clients.set(clientId, ws);
    console.log(`Cliente conectado: ${clientId}`);

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        console.log(`Recebido de ${clientId}: ${message}`);

        switch (data.type) {
            case 'set_username':
                handleSetUsername(clientId, data.username);
                break;
            case 'set_username_in_game':
                handleSetUsernameInGame(clientId, data.username);
                break;
            case 'get_username':
                sendUsername(clientId);
                break;
            case 'chat_message':
                handleChatMessage(clientId, data.text);
                break;
            case 'invite':
                handleInvite(clientId, data.username);
                break;
            case 'accept_invite':
                handleAcceptInvite(clientId, data.inviteFrom);
                break;
            case 'reject_invite':
                handleRejectInvite(clientId, data.inviteFrom);
                break;
            case 'start_game':
                handleStartGame(clientId, data.roomName);
                break;
            case 'rejoin_game':
                handleRejoinGame(clientId, data.roomName, data.username);
                break;
            case 'update_player_state':
                handleUpdatePlayerState(clientId, data.roomName, data.position, data.speed);
                break;
            case 'game_over':
                handleGameOver(data.roomName, data.username);
                break;
            case 'ready_to_start':
                markPlayerReady(data.roomName, data.username);
                break;
            default:
                console.log('Tipo de mensagem não reconhecido:', data.type);
                break;
        }
    });

    ws.on('close', function close() {
        console.log(`Cliente desconectado: ${clientId}`);
        handlePlayerDisconnect(clientId);
        clients.delete(clientId);
    });
});

function generateUniqueId() {
    return 'client-' + Math.random().toString(36).substr(2, 9);
}

function handleSetUsername(clientId, username) {
    if (!username || username.trim() === '') {
        console.log('Nome de usuário inválido.');
        return sendError(clientId, 'Nome de usuário inválido');
    }

    const ws = clients.get(clientId);
    if (activeUsers.has(ws)) {
        console.log('Usuário já autenticado.');
        return sendError(clientId, 'Usuário já autenticado');
    }

    activeUsers.set(ws, username);
    playerData.set(username, { position: { x: 10, y: 660 }, speed: 0 });
    console.log(`Usuário ${username} autenticado com sucesso`);
    ws.send(JSON.stringify({ type: 'set_client_id', clientId: clientId }));
    sendUserList();
}

function handleSetUsernameInGame(clientId, username) {
    const ws = clients.get(clientId);
    if (activeUsers.has(ws)) {
        activeUsers.set(ws, username);
        playerData.set(username, { position: { x: 10, y: 660 }, speed: 0 });
        console.log(`Usuário ${username} autenticado com sucesso no jogo.`);
        sendUserList();
    }
}

function sendUsername(clientId) {
    const ws = clients.get(clientId);
    const username = activeUsers.get(ws);
    if (username) {
        ws.send(JSON.stringify({ type: 'set_username_in_game', username }));
    }
}

function handleChatMessage(clientId, message) {
    const ws = clients.get(clientId);
    const username = activeUsers.get(ws);
    if (!username) {
        console.log('Usuário não autenticado.');
        return sendError(clientId, 'Usuário não autenticado');
    }
    sendToAllClients({ type: 'chat_message', username, text: message });
}

function handleInvite(clientId, username) {
    const invitedUserWS = Array.from(clients.values()).find(client => activeUsers.get(client) === username);
    if (!invitedUserWS) {
        console.log('Usuário convidado não encontrado ou offline.');
        return sendError(clientId, 'Usuário convidado não encontrado ou offline');
    }
    const inviteFrom = activeUsers.get(clients.get(clientId));
    invitedUserWS.send(JSON.stringify({ type: 'invite', inviteFrom }));
}

function handleRejectInvite(clientId, inviteFrom) {
    const inviteFromWS = Array.from(clients.values()).find(client => activeUsers.get(client) === inviteFrom);
    if (!inviteFromWS) {
        console.log('Usuário que enviou o convite não encontrado.');
        return sendError(clientId, 'Usuário que enviou o convite não encontrado');
    }
    const inviteTo = activeUsers.get(clients.get(clientId));
    inviteFromWS.send(JSON.stringify({ type: 'invite_rejected', inviteTo }));
}

function handleAcceptInvite(clientId, inviteFrom) {
    const inviteFromWS = Array.from(clients.values()).find(client => activeUsers.get(client) === inviteFrom);
    if (!inviteFromWS) {
        console.log('Usuário que enviou o convite não encontrado.');
        return sendError(clientId, 'Usuário que enviou o convite não encontrado');
    }
    const inviteTo = activeUsers.get(clients.get(clientId));
    const roomName = `${inviteFrom}-${inviteTo}`;

    createRoom(roomName, [inviteFrom, inviteTo]);
    console.log(`Sala ${roomName} criada com sucesso com os jogadores: ${inviteFrom} e ${inviteTo}`);

    const players = [
        { username: inviteFrom, clientId: getClientIdByUsername(inviteFrom) },
        { username: inviteTo, clientId: getClientIdByUsername(inviteTo) }
    ];

    [inviteFromWS, clients.get(clientId)].forEach(playerWS => {
        playerWS.send(JSON.stringify({
            type: 'start_game',
            roomName: roomName,
            players: players
        }));
    });
}


function createRoom(roomName, playerUsernames) {
    const room = {
        name: roomName,
        players: new Map(),
        gameState: { started: false, readyPlayers: new Set() },
        disconnectedPlayers: new Set(),
        lastActivityTime: Date.now(),
        inactive: false
    };

    playerUsernames.forEach(username => {
        const clientId = getClientIdByUsername(username);
        if (clientId) {
            room.players.set(clientId, {
                username: username,
                position: { x: 10, y: 660 },
                speed: 0
            });
        }
    });

    rooms.set(roomName, room);
    activeRooms.set(roomName, playerUsernames);
    return room;
}
// Add this function to periodically clean up inactive rooms
function cleanupInactiveRooms() {
    const now = Date.now();
    for (const [roomName, room] of rooms.entries()) {
        if (room.inactive && now - room.lastActivityTime > 5 * 60 * 1000) { // 5 minutes
            console.log(`Removing inactive room: ${roomName}`);
            rooms.delete(roomName);
            activeRooms.delete(roomName);
        }
    }
} setInterval(cleanupInactiveRooms, 60 * 1000);



function getClientIdByUsername(username) {
    for (const [clientId, client] of clients.entries()) {
        if (activeUsers.get(client) === username) {
            return clientId;
        }
    }
    return null;
}

function handleStartGame(clientId, roomName) {
    const room = rooms.get(roomName);
    if (!room) {
        console.log('Sala não encontrada ou jogo já iniciado.');
        return sendError(clientId, 'Sala não encontrada ou jogo já iniciado');
    }
    room.gameState.started = true;
    broadcastToRoom(roomName, { type: 'game_started' });
    broadcastRoomState(roomName);
}

function handleRejoinGame(clientId, roomName, username) {
    let room = rooms.get(roomName);
    if (!room) {
        console.log(`Room ${roomName} not found. Creating new room.`);
        room = createRoom(roomName, [username]);
    }

    const ws = clients.get(clientId);
    activeUsers.set(ws, username);

    if (room.disconnectedPlayers && room.disconnectedPlayers.has(username)) {
        room.disconnectedPlayers.delete(username);
    }

    room.players.set(clientId, {
        username: username,
        position: { x: 10, y: 660 },
        speed: 0
    });

    room.inactive = false;
    room.lastActivityTime = Date.now();

    ws.send(JSON.stringify({ type: 'game_state', players: Array.from(room.players.values()) }));
    broadcastRoomState(roomName);
}


function handleUpdatePlayerState(clientId, roomName, position, speed) {
    const room = rooms.get(roomName);
    if (!room) return;

    const player = room.players.get(clientId);
    if (!player) return;

    player.position = position;
    player.speed = speed;

    broadcastRoomState(roomName);

    if (position.x > 1100) { 
        handleGameOver(roomName, player.username);
    }
}

function handleGameOver(roomName, winnerUsername) {
    const room = rooms.get(roomName);
    if (!room) return;

    room.gameState.started = false;
    room.gameState.winner = winnerUsername;

    broadcastToRoom(roomName, {
        type: 'game_over',
        winner: winnerUsername
    });

    setTimeout(() => {
        rooms.delete(roomName);
        activeRooms.delete(roomName);
    }, 10000); 
}

function markPlayerReady(roomName, username) {
    const room = rooms.get(roomName);
    if (!room) return;

    room.gameState.readyPlayers.add(username);

    if (room.gameState.readyPlayers.size === room.players.size) {
        handleStartGame(null, roomName);
    }
}

function handlePlayerDisconnect(clientId) {
    const ws = clients.get(clientId);
    const username = activeUsers.get(ws);

    removeUser(ws);
    sendUserList();

    for (const [roomName, room] of rooms.entries()) {
        if (room.players.has(clientId)) {
            room.players.delete(clientId);
            room.disconnectedPlayers = room.disconnectedPlayers || new Set();
            room.disconnectedPlayers.add(username);
            room.lastActivityTime = Date.now();
            if (room.players.size === 0) {
                room.inactive = true;
            } else {
                broadcastRoomState(roomName);
            }
            break;
        }
    }
}

function removeUser(ws) {
    if (activeUsers.has(ws)) {
        const username = activeUsers.get(ws);
        activeUsers.delete(ws);
        playerData.delete(username);
        console.log(`Usuário ${username} desconectado`);
    }
}

function sendUserList() {
    const users = Array.from(activeUsers.values()).map(username => ({ username }));
    sendToAllClients({ type: 'user_list', users });
}

function sendToAllClients(message) {
    for (const client of clients.values()) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
}

function broadcastRoomState(roomName) {
    const room = rooms.get(roomName);
    if (!room) return;

    const gameState = {
        players: Array.from(room.players.values()),
        started: room.gameState.started
    };

    broadcastToRoom(roomName, {
        type: 'room_state',
        gameState: gameState
    });
}

function broadcastToRoom(roomName, message) {
    const room = rooms.get(roomName);
    if (!room) return;

    for (const clientId of room.players.keys()) {
        const client = clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
}

function sendError(clientId, error) {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'error', message: error }));
    }
}

console.log('Servidor WebSocket iniciado na porta 8080.');