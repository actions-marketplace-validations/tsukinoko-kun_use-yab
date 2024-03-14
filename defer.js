import fs from "node:fs";

const register = new Array();

export function defer(fn) {
    register.push(fn);
}

export function cancelDeferred() {
    register.length = 0;
}

/**
 * Delete a file or directory.
 * If the path is a directory, it will be removed recursively.
 * @param {string} path
 */
export function deferDelete(path) {
    defer(() => {
        if (fs.existsSync(path)) {
            if (fs.statSync(path).isDirectory()) {
                fs.rmSync(path, { recursive: true });
            } else {
                fs.rmSync(path);
            }
        }
    });
}

async function run() {
    for (const fn of register) {
        await fn();
    }
}

// register the cleanup function
process.on("exit", () => {
    run();
});
