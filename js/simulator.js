const canvas = document.getElementById('sim');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let port = { x: canvas.width / 2, y: canvas.height / 2, w: 80, h: 40 };
let cable = { x: 200, y: canvas.height / 2, r: 20, dragging: false };
let snapped = false;
let ledProgress = 0;

// LCD screen setup
let lcd = { x: canvas.width/2 - 100, y: canvas.height/2 - 50, w: 200, h: 50 };
let lcdText = "Arduino Simulator Booting...";
let lcdIndex = 0;
let lcdTimer = 0;
let lcdSpeed = 5; // frames per character

// Drag events
canvas.addEventListener('mousedown', (e) => {
    let dx = e.clientX - cable.x;
    let dy = e.clientY - cable.y;
    if (Math.sqrt(dx*dx + dy*dy) < cable.r) cable.dragging = true;
});
canvas.addEventListener('mouseup', () => cable.dragging = false);
canvas.addEventListener('mousemove', (e) => {
    if (cable.dragging && !snapped) {
        cable.x = e.clientX;
        cable.y = e.clientY;
    }
});

// Draw functions
function drawPort() {
    ctx.fillStyle = '#555';
    ctx.fillRect(port.x - port.w/2, port.y - port.h/2, port.w, port.h);
}

function drawCable() {
    ctx.beginPath();
    ctx.arc(cable.x, cable.y, cable.r, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
}

function drawLEDStrip() {
    const borderWidth = 10;
    const perimeter = 2 * (canvas.width + canvas.height - 4 * borderWidth);
    const dashLength = 50;

    for (let i = 0; i < perimeter; i += dashLength * 2) {
        let progressPos = (ledProgress + i) % perimeter;
        ctx.strokeStyle = "lime";
        ctx.lineWidth = borderWidth;

        ctx.beginPath();
        if (progressPos < canvas.width - borderWidth * 2) {
            ctx.moveTo(borderWidth + progressPos, borderWidth);
            ctx.lineTo(borderWidth + progressPos + dashLength, borderWidth);
        } else if (progressPos < canvas.width - borderWidth * 2 + canvas.height - borderWidth * 2) {
            let offset = progressPos - (canvas.width - borderWidth * 2);
            ctx.moveTo(canvas.width - borderWidth, borderWidth + offset);
            ctx.lineTo(canvas.width - borderWidth, borderWidth + offset + dashLength);
        } else if (progressPos < 2 * (canvas.width - borderWidth * 2) + canvas.height - borderWidth * 2) {
            let offset = progressPos - (canvas.width - borderWidth * 2 + canvas.height - borderWidth * 2);
            ctx.moveTo(canvas.width - borderWidth - offset, canvas.height - borderWidth);
            ctx.lineTo(canvas.width - borderWidth - offset - dashLength, canvas.height - borderWidth);
        } else {
            let offset = progressPos - (2 * (canvas.width - borderWidth * 2) + canvas.height - borderWidth * 2);
            ctx.moveTo(borderWidth, canvas.height - borderWidth - offset);
            ctx.lineTo(borderWidth, canvas.height - borderWidth - offset - dashLength);
        }
        ctx.stroke();
    }
}

function drawLCD() {
    // LCD background
    ctx.fillStyle = "#003300"; // dark green
    ctx.fillRect(lcd.x, lcd.y, lcd.w, lcd.h);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.strokeRect(lcd.x, lcd.y, lcd.w, lcd.h);

    // Typewriter text
    ctx.fillStyle = "lime";
    ctx.font = "20px monospace";
    let displayText = lcdText.slice(0, lcdIndex);
    ctx.fillText(displayText, lcd.x + 10, lcd.y + 30);

    // Update text index
    lcdTimer++;
    if (lcdTimer % lcdSpeed === 0 && lcdIndex < lcdText.length) {
        lcdIndex++;
    }
}

// Main update loop
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (snapped) {
        drawLEDStrip();
        ledProgress += 5;
        drawLCD();
    }

    drawPort();
    drawCable();

    // Snap logic
    let dx = cable.x - port.x;
    let dy = cable.y - port.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 40 && !snapped) {
        snapped = true;
        cable.x = port.x;
        cable.y = port.y;
    }

    requestAnimationFrame(update);
}

update();
