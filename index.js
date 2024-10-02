const robot = require('robotjs');
const readline = require('readline');

/**
 * Constants for mouse movement.
 */
const MIN_MOUSE_MOVE_OFFSET = 50;     // Minimum pixels to move the mouse significantly
const MAX_MOUSE_MOVE_OFFSET = 100;    // Maximum pixels to move the mouse
const CHECK_INTERVAL = 1 * 60 * 1000; // Check mouse activity every 1 minute (60 seconds)

/**
 * Generates a random mouse movement offset with a significant value.
 * @returns {number} The random offset for mouse movement.
 */
function getRandomOffset() {
    return Math.floor(Math.random() * (MAX_MOUSE_MOVE_OFFSET - MIN_MOUSE_MOVE_OFFSET + 1)) + MIN_MOUSE_MOVE_OFFSET;
}

/**
 * Gets the current time formatted as HH:MM:SS.
 * @returns {string} The current time as a string.
 */
function getCurrentTime() {
    return new Date().toLocaleTimeString();
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
    return minutes > 0
        ? `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`
        : `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

let lastMousePos = robot.getMousePos();
let lastActiveTime = Date.now();

/**
 * Moves the mouse cursor significantly.
 */
function moveMouse() {
    const mousePos = robot.getMousePos();
    const newX = mousePos.x + (Math.random() < 0.5 ? -1 : 1) * getRandomOffset();
    const newY = mousePos.y + (Math.random() < 0.5 ? -1 : 1) * getRandomOffset();

    robot.moveMouse(newX, newY);
    console.log(`[${getCurrentTime()}] Mouse moved to: (${newX}, ${newY}). Time passed since last move: ${formatTime(Date.now() - lastActiveTime)}.`);

    lastActiveTime = Date.now(); // Reset the activity timer after moving the mouse
}

/**
 * Checks mouse activity and moves the cursor if no activity is detected within the maximum time limit.
 * @param {number} maxInactiveTime - The maximum inactive time (in milliseconds).
 */
function checkMouseActivity(maxInactiveTime) {
    const currentMousePos = robot.getMousePos();
    const currentTime = Date.now();

    // If mouse moved, reset last active time
    if (currentMousePos.x !== lastMousePos.x || currentMousePos.y !== lastMousePos.y) {
        lastActiveTime = currentTime;
        lastMousePos = currentMousePos;
        console.log(`[${getCurrentTime()}] Mouse movement detected. Timer reset.`);
    }

    // If the time since the last activity exceeds the time limit, move the mouse
    if (currentTime - lastActiveTime >= maxInactiveTime) {
        console.log(`[${getCurrentTime()}] Mouse inactive for ${formatTime(currentTime - lastActiveTime)}. Performing action...`);
        moveMouse();
    } else {
        const timeLeft = maxInactiveTime - (currentTime - lastActiveTime);
        const randomMoveInterval = Math.random() * timeLeft;
        setTimeout(moveMouse, randomMoveInterval);
    }
}

/**
 * Reads the max time in minutes from the terminal, validates input, and starts the script.
 */
function startScript() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the maximum time in minutes (minimum 2 minutes): ', (input) => {
        const maxMinutes = parseInt(input, 10);

        // Validate the input
        if (isNaN(maxMinutes) || maxMinutes < 2) {
            console.log('Invalid input. Please enter a number greater than or equal to 2.');
            rl.close();
            return;
        }

        // Subtract 1 minute for checking activity
        const maxInactiveTime = (maxMinutes - 1) * 60 * 1000;

        console.log(`Max inactive time set to ${maxMinutes - 1} minutes. Checking every 1 minute.`);

        // Start checking mouse activity every 1 minute
        setInterval(() => checkMouseActivity(maxInactiveTime), CHECK_INTERVAL);

        rl.close();
    });
}

startScript();

// Handle program termination (Ctrl + C)
process.on('SIGINT', () => {
    console.log(`[${getCurrentTime()}] Script stopped.`);
    process.exit();
});
