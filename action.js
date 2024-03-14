import * as core from "@actions/core";
import { dirname } from "node:path";
import { getLatestReleaseAsync } from "./install.js";
import { cancelDeferred } from "./defer.js";

let version = core.getInput("version");
if (!version) {
    version = await getLatestReleaseAsync();
}
core.info(`Installing yab version ${version}`);

const binaryPath = await installTempAsync(version);
core.addPath(dirname(binaryPath));

cancelDeferred();
