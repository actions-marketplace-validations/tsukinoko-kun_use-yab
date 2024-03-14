#!/usr/bin/env node
import { executeAsync } from "@Frank-Mayer/use-yab";

await executeAsync(...process.argv.slice(2));
