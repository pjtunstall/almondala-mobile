let prev = 0;
const keys = {};
export function handleKeys(timestamp, state) {
    // The reason for using this key-handling mechanism--an asynchronous loop and `keys` object, rather than simply handling keypresses individually as each one occurs--is so that we can detect key chords (multiple simultaneous keypresses). It also allows us to throttle draw requests in one place. An object is used rather than a set because we don't just want to know if a key is currently down (in which case it's value will be `true`), but also whether it's been pressed and released since the previous iteration (in which case it will be `false`).
    requestAnimationFrame((timestamp) => handleKeys(timestamp, state));
    if (timestamp - prev < 16) {
        return;
    }
    prev = timestamp;
    if (Object.keys(keys).length === 0) {
        return;
    }
    Object.keys(keys).forEach((key) => {
        switch (key) {
            case "ArrowLeft":
                state.panLeft();
                break;
            case "ArrowRight":
                state.panRight();
                break;
            case "ArrowUp":
                state.panUp();
                break;
            case "ArrowDown":
                state.panDown();
                break;
            case "x":
                state.zoomIn();
                break;
            case "z":
                state.zoomOut();
                break;
            case " ":
            case "Escape":
                state.requestReset();
                if (keys[key] === false) {
                    delete keys[key];
                }
                return;
            default:
                return;
        }
        if (keys[key] === false) {
            delete keys[key];
        }
    });
    state.render();
}
export function handleKeydown(key) {
    switch (key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
        case "x":
        case "z":
        case " ":
        case "Escape":
            keys[key] = true;
    }
}
export function handleKeyup(key) {
    switch (key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
        case "x":
        case "z":
        case " ":
        case "Escape":
            keys[key] = false;
    }
}
//# sourceMappingURL=key-handlers.js.map