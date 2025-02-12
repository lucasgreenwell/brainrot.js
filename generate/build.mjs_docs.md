# build.mjs Documentation

## Overview
This module provides the production video generation functionality for the brainrot.js application, implementing a polling-based queue system for processing video generation requests.

## Core Functions

### cleanupResources()
- **Purpose**: Cleans up temporary files and directories after video generation
- **Operations**: Similar to localBuild.mjs cleanup but in a production context

### mainFn(params)
- **Purpose**: Main video generation function for production environment
- **Parameters**:
  - Standard video generation parameters (topic, agents, etc.)
  - Additional production parameters:
    - `videoId`: Unique identifier for the video
    - `userId`: User identifier
    - `credits`: Credit cost for video generation
- **Process**:
  1. Updates process ID in database
  2. Runs transcription
  3. Deploys assets to S3
  4. Renders video using Remotion Lambda
  5. Updates video status in database
  6. Handles error cases and credit refunds

### pollPendingVideos()
- **Purpose**: Continuously polls database for new video generation requests
- **Process**:
  1. Queries for pending videos with no assigned process
  2. Processes one video at a time
  3. Handles errors and updates status
  4. Implements sleep between polls

### sleep(ms)
- **Purpose**: Utility function for implementing delays
- **Parameters**: 
  - `ms`: Milliseconds to sleep

## Production Features
1. Database Integration:
   - Tracks video status
   - Manages user credits
   - Handles process assignment

2. AWS Integration:
   - S3 for asset storage
   - Remotion Lambda for rendering

3. Error Handling:
   - Credit refund system
   - Status updates
   - Resource cleanup 