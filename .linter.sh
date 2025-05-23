#!/bin/bash
cd /home/kavia/workspace/code-generation/immersive3d-showcase-14368-14367/immersive3d_showcase
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

