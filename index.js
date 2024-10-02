const robot = require('robotjs');

/**
 * Maximum allowed inactive time before mouse is moved (in milliseconds).
 */
const MAX_INACTIVE_TIME = 5 * 60 * 1000 - 10000;

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
 * Converts milliseconds to a string formatted as X minutes Y seconds.
 * @param {number} milliseconds - The time in milliseconds.
 * @returns {string} The time formatted as minutes and seconds.
 */
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
}

let lastMousePos = robot.getMousePos();
let lastActiveTime = Date.now();

let checkInterval = getRandomInterval(1, 2);
let moveInterval = MAX_INACTIVE_TIME - checkInterval;

let offsetX = getRandomOffset();
let offsetY = getRandomOffset();

/**
 * Adjusts the intervals to ensure the total inactive time does not exceed MAX_INACTIVE_TIME.
 */
function adjustIntervals() {
    checkInterval = getRandomInterval(1, 2);
    moveInterval = MAX_INACTIVE_TIME - checkInterval;
}

/**
 * Moves the mouse cursor to a new random position.
 */
function moveMouse() {
    const mousePos = robot.getMousePos();
    const newX = mousePos.x + offsetX;
    const newY = mousePos.y + offsetY;

    robot.moveMouse(newX, newY);
    console.log(`[${getCurrentTime()}] Mouse moved to: (${newX}, ${newY}). Time passed since last move: ${formatTime(Date.now() - lastActiveTime)}. Press "Ctrl + C" to stop the script.`);

    offsetX = getRandomOffset();
    offsetY = getRandomOffset();
}

/**
 * Checks mouse activity and moves the cursor if no activity is detected within the time limit.
 */
function checkMouseActivity() {
    const currentMousePos = robot.getMousePos();
    const currentTime = Date.now();

    if (currentMousePos.x !== lastMousePos.x || currentMousePos.y !== lastMousePos.y) {
        const timePassed = currentTime - lastActiveTime;
        lastActiveTime = currentTime;
        lastMousePos = currentMousePos;
        console.log(`[${getCurrentTime()}] Mouse movement detected. Timer reset. Time passed since last check: ${formatTime(timePassed)}. Press "Ctrl + C" to stop the script.`);
        adjustIntervals(); // Adjust intervals after detecting movement
    }

    if (currentTime - lastActiveTime >= moveInterval) {
        const timePassed = currentTime - lastActiveTime;
        console.log(`[${getCurrentTime()}] Mouse inactive for ${formatTime(timePassed)}. Performing action... Press "Ctrl + C" to stop the script.`);
        moveMouse();
        lastActiveTime = currentTime;

        adjustIntervals();
    }
}

// Start checking mouse activity
setInterval(checkMouseActivity, checkInterval);

// Listen for program termination (Ctrl + C)
process.on('SIGINT', () => {
    console.log(`[${getCurrentTime()}] Script stopped. Run "npm start" to start script again.`);
    process.exit();
});
