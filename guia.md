Nuvio Provider Development Guide
This comprehensive guide covers everything you need to know to build, debug, and publish streaming providers for the Nuvio app.

Table of Contents
Introduction
Getting Started
Setup
Architecture
The Provider Template
Development Workflows
Workflow A: Multi-File (Recommended)
Workflow B: Single-File (Legacy/Simple)
The Build System
Bundling Source Providers
Transpiling Async/Await
Watch Mode
API Reference
Testing & Debugging
Publishing
FAQ & Troubleshooting
1. Introduction
A Nuvio Provider is a JavaScript module responsible for finding video streams. When a user taps a movie in the app, the provider receives the media details (TMDB ID, title, etc.) and returns a list of playable URLs.

Providers run locally on the user's device. The Nuvio app uses the Hermes JavaScript engine.

Crucial Limitation: Hermes does not natively support async/await syntax inside dynamically loaded code (plugins). Our Solution: We provide a build script that automatically transpiles your modern async/await code into generator functions that Hermes can execute safely.

Also Important (Runtime Differences): Local Node.js tests can pass even when the provider fails in-app. The Nuvio runtime is React Native + Hermes, so many Node-specific APIs/modules are not available (for example Node built-ins like crypto, and some crypto libraries that assume a Node/browser environment such as node-forge). If your provider uses encryption/decryption or heavy parsing dependencies, always test it in the Nuvio app (Plugin Tester) even if it works locally.

2. Getting Started
Setup
Clone the Repository

Copy
git clone https://github.com/tapframe/nuvio-providers.git
cd nuvio-providers
Install Dependencies This installs the build tools (esbuild) required for transpilation.

Copy
npm install
Architecture
src/: The workspace for modern, multi-file providers.
providers/: The distribution folder. The app reads files from here. Do not edit these files manually if they were built from src/.
build.js: The utility script that builds and transpiles your code.
3. The Provider Template
We have included a starter template in src/_template. To create a new provider:

Copy the template

Copy
cp -r src/_template src/my-new-provider
Rename/Edit files

src/my-new-provider/index.js: The main entry point.
src/my-new-provider/http.js: Helper for network requests.
src/my-new-provider/extractor.js: Your scraping logic.
4. Development Workflows
Workflow A: Multi-File (Recommended)
Best for complex providers. You write modern code in src/, split across multiple files.

Develpop in src/myprovider/. You can use import/export and async/await freely.

Copy
// src/myprovider/index.js
import { getStream } from './extractor.js';

async function getStreams(tmdbId, ...) {
    return await getStream(tmdbId);
}
Build

Copy
node build.js myprovider
This bundles everything into a single file at providers/myprovider.js and transpiles the async code.

Workflow B: Single-File (Legacy/Simple)
If you have a simple script or are porting a provider from another project, you might have a single file in providers/.

Develop in providers/myprovider.js. If you use async/await, it will crash the app unless you process it.

Transpile Run the transpile command to convert the async code in-place:

Copy
node build.js --transpile myprovider.js
This rewrites providers/myprovider.js with Hermes-compatible code.

5. The Build System
The build.js script is your primary tool. It handles two main jobs:

Bundling: Combines multiple files from src/ into one.
Transpiling: Converts ES2017+ async/await into ES2016 Generators.
Bundling Source Providers
Usage: node build.js [provider_names...]

Command	Description
node build.js	Builds ALL providers found in src/.
node build.js vidlink	Builds only the src/vidlink provider.
node build.js vidlink castle	Builds multiple specific providers.
Output: Creates providers/<name>.js.

Transpiling Async/Await (Single Files)
If you have a standalone file in providers/ that uses async/await, you must transpile it.

Usage: node build.js --transpile [filenames...]

Command	Description
node build.js --transpile	Scans providers/ for single files using async and transpiles them all.
node build.js --transpile old-scraper	Transpiles providers/old-scraper.js in-place.
node build.js --transpile file1 file2	Transpiles multiple specific files.
Note: This overwrites the file with the transpiled version. The original source is lost unless you keep a backup or use Git. This is why Workflow A (src folder) is recommended, as it keeps your source code separate from the build artifact.

Watch Mode
Automatically rebuilds source providers when you modify files in src/.

Copy
npm run build:watch
Minification
By default, builds keep code readable for debugging. You can enable minification to reduce file size.

Usage: node build.js --minify [provider_names...]

Command	Description
node build.js --minify	Builds ALL providers with minification.
node build.js --minify vidlink	Builds only vidlink provider, minified.
node build.js --minify vidlink castle	Builds multiple providers, all minified.
Advantages of Minification
Smaller File Size: ~50% reduction for providers with heavy dependencies (e.g., using node-forge, cheerio).
Example: A 1.0 MB unminified bundle becomes ~473 KB when minified.
Faster Load Time: Smaller files load quicker in the Nuvio app and over network transfers.
Reduced Storage: Less disk space consumed on user devices.
Production Ready: Recommended for final releases.
Disadvantages of Minification
Hard to Debug: Variable and function names are mangled (e.g., getStreams() → u()), making it difficult to troubleshoot errors from crash reports or logs.
Longer Build Time: Minification adds a slight overhead to the build process.
Stack Traces Unreadable: Error messages won't map back to original function names.
Recommendation
Development: Use unminified builds (node build.js) for easier debugging.
Testing: Test both minified and unminified versions before publishing.
Production/Release: Use minified builds (node build.js --minify) for deployment to users.
6. API Reference
Your provider must export a getStreams function.

Copy
/*
 * @param {string} tmdbId - The TMDB ID (e.g., "550")
 * @param {string} mediaType - "movie" or "tv"
 * @param {number} season - Season number (1-based), null for movies
 * @param {number} episode - Episode number (1-based), null for movies
 * @returns {Promise<Array>} - List of streams
 */
async function getStreams(tmdbId, mediaType, season, episode) { ... }
Stream Object
Copy
{
  "name": "MyProvider",            // Short identifier
  "title": "1080p Stream",         // Display name
  "url": "https://server.com/...", // Playable URL
  "quality": "1080p",              // 4K, 1080p, 720p, CAM
  "headers": {                     // (Optional)
    "User-Agent": "Key for playback",
    "Referer": "..."
  }
}
7. Testing & Debugging
While local Node.js scripts are useful for initial logic verification, providers must be tested within the Nuvio application to ensure compatibility with the Hermes engine and the app's runtime environment.

7.1. Local Logic Verification (Node.js)
Create a temporary test script (e.g., test.js) to verify your provider's scraping logic on your computer.

Copy
const { getStreams } = require('./providers/myprovider.js');

async function run() {
    console.log("Fetching streams...");
    try {
        const streams = await getStreams('550', 'movie'); // Fight Club
        console.log(streams);
    } catch (e) {
        console.error(e);
    }
}
run();
Run it using:

Copy
node test.js
7.2. In-App Testing (Plugin Tester)
The Plugin Tester is a dedicated developer tool within the Nuvio app that allows you to load, run, and debug providers directly on your device interactively.

Prerequisites
Get the App: You need the debug version of Nuvio.

Download: Get the latest debug.apk from the Releases tab on GitHub.
Build: Or run npx expo run:android / npx expo run:ios locally.
Note: Production versions do not include the Plugin Tester.

Ensure your computer and mobile device are on the same Wi-Fi network.

Start the local development server in this repository:

Copy
npm start
This serves your providers/ directory and manifest.json over HTTP (e.g., http://192.168.1.X:3000).

Accessing the Plugin Tester
Open the Nuvio application.
Navigate to Settings.
Scroll down to the Developer Section and select Plugin Tester.
Testing Individual Providers
The "Individual Plugin" tab is designed for rapid iteration on a single provider script.

[!IMPORTANT] Code Requirements: You must use the compiled/bundled file (found in providers/) or a standalone single-file provider. The app cannot execute source files that use import to load other local files (e.g., from src/). If you are using the multi-file workflow, you must build your provider first (node build.js myprovider) and test the generated output file.

Load Source:
From URL: Enter the direct URL to your compiled provider file hosted by your local server (e.g., http://192.168.1.5:3000/providers/myprovider.js) and tap Load.
Direct Input: Alternatively, paste your compiled provider code directly into the code editor.
Parameters: Set the test parameters (TMDB ID, Media Type, Season, Episode).
Run Test: Tap the Run Test button.
View Results:
Logs: Check the "Logs" tab for console.log output and errors.
Results: View the list of discovered streams in the "Results" tab.
Playback: Tap the Play button on any stream result to verify that the URL is playable in the native player (KSPlayer on iOS, AndroidVideoPlayer on Android).
Testing Repositories
The "Repo Tester" tab allows you to validate an entire plugin repository manifest.

Enter your local manifest URL (e.g., http://192.168.1.5:3000/manifest.json).
Tap Fetch Manifest to load the list of available providers.
Tap Test All to run a connectivity test on all enabled providers in the manifest, or test specific providers individually.
[!NOTE] The Plugin Tester behaves exactly like the production app environment (Hermes), so if a provider works here, it will work for users.

8. Publishing
Build your provider: Ensure providers/myprovider.js is up to date.
Copy
node build.js myprovider
Update Manifest: Add your provider entry to manifest.json.
Commit & Push:
Copy
git add .
git commit -m "Add new provider"
git push
Users can then use your raw GitHub repository URL to load the plugins in Nuvio.

9. FAQ & Troubleshooting
Error: SyntaxError: async functions are unsupported
Cause: The app running on Hermes cannot execute async function directly in plugins. Fix: You forgot to build/transpile.

If using src/: Run node build.js myprovider.
If using single file: Run node build.js --transpile myprovider.js.
Error: fetch is not defined (in local testing)
Cause: Node.js (before v18) doesn't have native fetch. Fix: Use Node v18+, or our build environment handles this for the app. For local testing, ensure you are on a recent Node version.

The app crashes when loading my provider
Cause: Syntax error or unhandled exception at the root level. Fix: Check your index.js. Ensure you are not doing heavy work (like networking) at the top level. All logic must be inside getStreams.