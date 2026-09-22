import { applyE2eEnv } from "./e2e-env";

// Runs before the test file imports the app modules, whose ConfigModule
// validates process.env at import time.
applyE2eEnv();
