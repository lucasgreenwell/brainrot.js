# Dockerfile Documentation

## Overview
This Dockerfile sets up a Python and Node.js environment optimized for video generation with FFmpeg support and browser automation capabilities.

## Base Image
- Uses Python 3.9 as the base image
- Installs Node.js 20.x via the NodeSource repository

## System Dependencies
1. Core Dependencies:
   - FFmpeg for video processing
   - Vim for text editing
   - CA certificates for secure connections

2. Browser Automation Dependencies:
   - Various system libraries required for browser automation (libatk, libcairo2, etc.)
   - X11 related libraries
   - Font libraries

## Python Setup
1. Upgrades pip
2. Installs requirements from requirements.txt
3. Installs local package in development mode
4. Installs CPU-only versions of PyTorch and TorchAudio
5. Installs Gunicorn for WSGI server capabilities

## Node.js Setup
1. Installs PM2 globally for process management
2. Installs project dependencies via npm

## Application Configuration
- Sets working directory to `/app/brainrot`
- Copies application files into container
- Uses Gunicorn as the entrypoint
- Default configuration:
  - 1 worker
  - Binds to 0.0.0.0:5000
  - Runs in daemon mode
  - 120 second timeout
  - Access and error logging enabled 