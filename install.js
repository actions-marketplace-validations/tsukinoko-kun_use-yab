import fetch from "node-fetch";
import tmp from "tmp";
import { extract as tarExtract } from "tar";
import { deferDelete } from "./defer.js";
import { arch, platform } from "node:os";
import { writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { basename, join } from "node:path";

const repoAuthor = "tsukinoko-kun";
const repoName = "yab";
let latestRelease = null;

/**
 * Install a specific version of yab to a temporary directory
 * @param {string} version
 * @returns {Promise<string>} path to the installed yab binary
 * @example install("0.3.0")
 */
export async function installTempAsync(version) {
    if (!version || version === "latest") {
        version = await getLatestReleaseAsync();
    } else if (version.startsWith("v")) {
        // remove the 'v' prefix
        version = version.substring(1);
    }
    const archivePath = await downloadArchiveAsync(version);
    const binaryPath = await extractArchiveAsync(archivePath);
    return binaryPath;
}

async function extractArchiveAsync(archivePath) {
    const extractDir = tmp.dirSync().name;
    deferDelete(extractDir);
    const filename = platform() === "win32" ? "yab.exe" : "yab";
    const tarballReadStream = createReadStream(archivePath);
    const unzipper = createGunzip();
    const tarExtractor = tarExtract({
        cwd: extractDir,
        filter: (_, entry) => basename(entry.path) === filename,
    });

    /** @type {string} */
    const binFile = await new Promise((resolve, reject) => {
        tarballReadStream
            .pipe(unzipper)
            .on("error", (err) => {
                reject(err);
            })
            .pipe(tarExtractor)
            .on("error", (err) => {
                reject(err);
            })
            .on("finish", () => {
                resolve(join(extractDir, filename));
            });
    });

    return binFile;
}

/**
 * Download a specific version of yab
 * @param {string} version
 * @returns {Promise<string>} path to the downloaded yab archive
 */
async function downloadArchiveAsync(version) {
    const filename = getFilename(version);
    const url = `https://github.com/tsukinoko-kun/yab/releases/download/v${version}/${filename}`;
    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`Failed to download yab from ${url}`);
    }

    const tmpFile = tmp.fileSync({ postfix: ".tar.gz" }).name;
    deferDelete(tmpFile);

    const arrBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrBuffer);
    await writeFile(tmpFile, buffer);
    return tmpFile;
}

/**
 * Get the latest release of yab
 * @returns {Promise<string>} version
 */
export async function getLatestReleaseAsync() {
    if (latestRelease) {
        return latestRelease;
    }
    const url = `https://api.github.com/repos/${repoAuthor}/${repoName}/releases/latest`;
    const response = await fetch(url);
    const json = await response.json();
    // remove the 'v' prefix
    latestRelease = json.tag_name.substring(1);
    return latestRelease;
}

/**
 * Get the filename of the download archive
 * @param {string} version
 * @returns {string} filename
 */
function getFilename(version) {
    let filename = `yab_${version}_`;
    switch (platform()) {
        case "win32":
            filename += "windows_";
            break;
        case "linux":
            filename += "linux_";
            break;
        case "darwin":
            filename += "darwin_";
            break;
        default:
            return [null, new Error("Unsupported platform " + platform())];
    }
    switch (arch()) {
        case "x64":
            filename += "amd64";
            break;
        case ("arm", "arm64"):
            filename += "arm64";
            break;
        default:
            return [null, new Error("Unsupported architecture " + arch())];
    }
    filename += ".tar.gz";
    return filename;
}
