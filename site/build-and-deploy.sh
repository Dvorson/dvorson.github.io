#!/bin/bash

# Build the Astro site
echo "Building Astro site..."
npm run build

# Copy the built files to the docs directory
echo "Copying files to docs directory for GitHub Pages..."
cp -R dist/* ../docs/

echo "Build and deploy preparation complete!"
echo "The site is ready to be pushed to GitHub for Pages deployment."