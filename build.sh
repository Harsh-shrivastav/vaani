#!/bin/bash
# Vercel build script - injects environment variable into client/env.js

echo "// Auto-generated at build time - DO NOT COMMIT" > client/env.js
echo "window.ENV = {" >> client/env.js
echo "  GEMINI_API_KEY: \"${GEMINI_API_KEY}\"" >> client/env.js
echo "};" >> client/env.js

echo "✅ Environment variables injected into client/env.js"
