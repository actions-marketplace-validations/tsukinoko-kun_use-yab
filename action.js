import * as core from "@actions/core";
import { dirname } from "node:path";
import { cancelDeferred } from "./defer.js";
import { getLatestReleaseAsync, installTempAsync } from "./install.js";

let version = core.getInput("version");
if (!version) {
    version = await getLatestReleaseAsync();
}
core.info(`Installing yab version ${version}`);

const binaryPath = await installTempAsync(version);
core.addPath(dirname(binaryPath));

cancelDeferred();
