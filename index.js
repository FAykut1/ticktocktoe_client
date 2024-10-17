const boardSize = 3;
let tileSize = 50;
let board = [];
let turn = "";
let socket;

let state = "";

function setup() {
    socket = new WebSocket("ws://localhost:8765");

    socket.onopen = function (event) {
        console.log(event);
    };

    // Event handler for when a message is received from the server
    socket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        if (message.type === 1) {
            turn = message.data.turn;
            board = message.data.board;
            state = message.data.state;
        } else if (message.type === 3) {
            // update board
            board = message.data.board;
            turn = message.data.turn;
            state = message.data.state;

            if (state === "FINISHED") {
                console.log("finished");
            }
        } else if (message.type === 4) {
            alert("Error: " + message.data.message);
        }
        console.log(message);
    };

    canvas = createCanvas(400, 400);
    console.log(canvas);
    tileSize = width / boardSize;
}

function draw() {
    background(220);

    if (state === "FINISHED") {
        push();
        textAlign(CENTER, CENTER);
        textSize(20);
        fill(0);
        text("Game Over Broi", width / 2, height / 2); 
        pop();
    } else if (state === "INITIALIZED") {
        push();
        textAlign(CENTER, CENTER);
        textSize(20);
        fill(0);
        text("Waiting for player to join", width / 2, height / 2);
        pop();
    } else if (state === "PLAYING") {
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                let x = i * tileSize;
                let y = j * tileSize;
                push();
                if (mouseInsideTheTile(i, j)) {
                    fill("grey");
                } else {
                    fill(255);
                }
    
                rect(x, y, tileSize, tileSize);
    
                if (board[i][j] !== "") {
                    textAlign(CENTER, CENTER);
                    textSize(40);
                    fill(0);
                    text(board[i][j], x + tileSize / 2, y + tileSize / 2);
                }
    
                pop();
            }
        }
    }

}

function createBoard() {
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = "";
        }
    }
}

function mouseInsideTheTile(i, j) {
    let tileX = i * tileSize;
    let tileY = j * tileSize;
    let m = mouseIsInside(tileX, tileY, tileSize, tileSize);
    return m;
}

function mouseIsInside(x, y, width, height) {
    return (
        mouseX >= x &&
        mouseX <= x + width &&
        mouseY >= y &&
        mouseY <= y + height
    );
}

function getTilePosFromCoords(x, y) {
    let i = Math.floor(x / tileSize);
    let j = Math.floor(y / tileSize);
    try {
        board[i][j];
        return [i, j];
    } catch (error) {
        return null;
    }
}

function mouseClicked() {
    let tilePos = getTilePosFromCoords(mouseX, mouseY);

    if (!tilePos) {
        return;
    }

    let [i, j] = tilePos;

    if (mouseInsideTheTile(i, j)) {
        sendMessage(2, {
            pos: [i, j],
        })
    }
}

function sendMessage(_type, data) {
    if (!socket) {
        console.log("socket not connected");
        return;
    }

    socket.send(JSON.stringify({
        type: _type,
        data: data
    }));
}

function joinGame() {
    alert("Do you want to join the game?");
    sendMessage(1, {});
}
