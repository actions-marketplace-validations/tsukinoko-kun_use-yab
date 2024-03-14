import { installTempAsync } from "./install.js";
import { spawn } from "node:child_process";

let yabPath = null;

/**
 * Install yab
 * @param {string} version
 * @returns {Promise<void>}
 * @throws {Error} if installation fails
 */
export async function installAsync(version) {
    yabPath = await installTempAsync(version);
}

export async function getPathAsync() {
    if (!yabPath) {
        yabPath = await installTempAsync();
    }
    return yabPath;
}

/**
 * Execute yab with the given arguments
 * @param {string[]} args
 * @returns {Promise<number>} exit code
 */
export async function executeAsync(...args) {
    const yabPath = await getPathAsync();
    const proc = spawn(yabPath, args, {
        stdio: "inherit",
    });
    const exitCode = await new Promise((resolve) => {
        proc.on("exit", (code) => {
            resolve(code);
        });
    });
    return exitCode;
}
