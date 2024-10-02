const robot = require('robotjs');

/**
 * Generates a random interval in milliseconds between given min and max minutes.
 * @param {number} minMinutes - The minimum value in minutes.
 * @param {number} maxMinutes - The maximum value in minutes.
 * @returns {number} The random interval in milliseconds.
 */
function getRandomInterval(minMinutes, maxMinutes) {
    const minMs = minMinutes * 60 * 1000;
    const maxMs = maxMinutes * 60 * 1000;
    return Math.random() * (maxMs - minMs) + minMs;
}

/**
 * Generates a random mouse movement offset between -10 and 10 pixels.
 * @returns {number} The random offset for mouse movement.
 */
function getRandomOffset() {
    return Math.floor(Math.random() * 20) - 10;
}

/**
 * Gets the current time formatted as HH:MM:SS.sss.
 * @returns {string} The current time as a string.
 */
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString() + '.' + now.getMilliseconds();
}

/**
 * Converts milliseconds to seconds with 3 decimal places.
 * @param {number} milliseconds - The time in milliseconds.
 * @returns {string} The time in seconds, formatted to 3 decimal places.
 */
function msToSeconds(milliseconds) {
    return (milliseconds / 1000).toFixed(3);
}

let checkInterval = getRandomInterval(1, 2);
let moveInterval = getRandomInterval(2, 4);

let offsetX = getRandomOffset();
let offsetY = getRandomOffset();

let lastMousePos = robot.getMousePos();
let lastActiveTime = Date.now();

function moveMouse() {
    const mousePos = robot.getMousePos();
    const newX = mousePos.x + offsetX;
    const newY = mousePos.y + offsetY;

    robot.moveMouse(newX, newY);
    console.log(`[${getCurrentTime()}] Mouse moved to: (${newX}, ${newY}). Time passed since last move: ${msToSeconds(Date.now() - lastActiveTime)} seconds. Press "Ctrl + C" to stop the script.`);

    offsetX = getRandomOffset();
    offsetY = getRandomOffset();
}

function checkMouseActivity() {
    const currentMousePos = robot.getMousePos();
    const currentTime = Date.now();

    if (currentMousePos.x !== lastMousePos.x || currentMousePos.y !== lastMousePos.y) {
        const timePassed = currentTime - lastActiveTime;
        lastActiveTime = currentTime;
        lastMousePos = currentMousePos;
        console.log(`[${getCurrentTime()}] Mouse movement detected. Timer reset. Time passed since last check: ${msToSeconds(timePassed)} seconds. Press "Ctrl + C" to stop the script.`);
    }

    if (currentTime - lastActiveTime >= moveInterval) {
        const timePassed = currentTime - lastActiveTime;
        console.log(`[${getCurrentTime()}] Mouse inactive for ${msToSeconds(timePassed)} seconds. Performing action... Press "Ctrl + C" to stop the script.`);
        moveMouse();
        lastActiveTime = currentTime;

        checkInterval = getRandomInterval(1, 2);
        moveInterval = getRandomInterval(2, 4);
    }
}

setInterval(checkMouseActivity, checkInterval);

process.on('SIGINT', () => {
    console.log(`[${getCurrentTime()}] Script stopped. Run "npm start" to start script again.`);
    process.exit();
});
