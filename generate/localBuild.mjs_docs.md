# localBuild.mjs Documentation

## Overview
This module provides local video generation functionality for the brainrot.js application, allowing users to generate AI-powered conversation videos with various customization options.

## Constants and Enums
1. Valid Options:
   - `VALID_AGENTS`: List of available AI agents (e.g., BARACK_OBAMA, BEN_SHAPIRO)
   - `VALID_MUSIC`: Available background music options
   - `VALID_BACKGROUNDS`: Available video background options
   - `PROCESS_ID`: Constant set to 0 for local processing

## Core Functions

### cleanupResources()
- **Purpose**: Cleans up temporary files and directories after video generation
- **Operations**:
  - Removes SRT directory
  - Removes voice directory
  - Deletes temporary audio file
  - Deletes temporary context file
  - Creates fresh SRT and voice directories

### validateParams(params)
- **Purpose**: Validates input parameters for video generation
- **Parameters**:
  - `agentA`: First AI agent
  - `agentB`: Second AI agent
  - `music`: Background music selection
  - `background`: Background video selection
- **Returns**: Object with validation result and error message if invalid

### generateVideo(params)
- **Purpose**: Main function to generate a video
- **Parameters**:
  - `videoTopic`: Topic for the conversation
  - `agentA`: First AI agent
  - `agentB`: Second AI agent
  - `music`: Background music selection
  - `background`: Background video selection
  - `aiGeneratedImages`: Toggle for AI image generation (default: true)
  - `fps`: Frames per second (default: 20)
  - `duration`: Video duration in minutes (default: 1)
  - `cleanSrt`: Toggle for SRT cleaning (default: true)
  - `local`: Toggle for local generation (default: true)
- **Process**:
  1. Validates input parameters
  2. Calls transcription function
  3. Builds the video using npm
  4. Cleans up resources after completion 