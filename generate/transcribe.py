from flask import Flask, jsonify, request
import whisper_timestamped as whisper

import json
import os
import logging
import subprocess
from datetime import datetime
import threading

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/ping', methods=['GET'])
def ping():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    res = []
    try:
        data = request.json
        audios = data.get('audios')
        logger.info(f"Received request with audios: {audios}")

        if not audios:
            raise ValueError("The 'audios' is not provided in the request.")

        # Load model once outside the loop
        logger.debug("Loading model")
        model = whisper.load_model("tiny", device="cpu")

        for audio_path in audios:
            try:
                # Check if file exists
                if not os.path.exists(audio_path):
                    logger.error(f"File not found: {audio_path}")
                    res.append(({"error": f"File not found: {audio_path}"}, audio_path))
                    continue

                # Log file size and path
                file_size = os.path.getsize(audio_path)
                logger.info(f"Processing file: {audio_path} (size: {file_size} bytes)")

                # Load and transcribe the audio
                logger.debug("Loading audio file")
                audio = whisper.load_audio(audio_path)
                
                logger.debug(f"Audio loaded, shape: {audio.shape if hasattr(audio, 'shape') else 'unknown'}")
                
                logger.debug("Starting transcription")
                transcribed = whisper.transcribe(model, audio, language="en")
                logger.info(f"Transcription result: {transcribed}")
                
                logger.info(f"Successfully transcribed: {audio_path}")
                res.append((transcribed, audio_path))
                
            except Exception as e:
                logger.error(f"Error processing {audio_path}: {str(e)}", exc_info=True)
                res.append(({"error": str(e)}, audio_path))
                continue

        return jsonify(res)
    except Exception as e:
        logger.error(f"Global error in transcription: {str(e)}", exc_info=True)

@app.route('/generate-video', methods=['POST'])
def generate_video():
    try:
        data = request.json
        logger.info(f"Received video generation request: {data}")

        required_fields = ['videoTopic', 'agentA', 'agentB', 'music', 'background']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f"Missing required field: {field}"}), 400

        # Execute the Node.js script with the provided parameters
        # Create a temporary JS file to run the generation
        temp_js = """
import { generateVideo } from './localBuild.mjs';

const params = {
    videoTopic: process.env.VIDEO_TOPIC,
    agentA: process.env.AGENT_A,
    agentB: process.env.AGENT_B,
    music: process.env.MUSIC,
    background: process.env.BACKGROUND,
    aiGeneratedImages: process.env.AI_GENERATED_IMAGES === 'true',
    fps: parseInt(process.env.FPS || '20'),
    duration: parseInt(process.env.DURATION || '1'),
    cleanSrt: process.env.CLEAN_SRT === 'true',
    local: true
};

generateVideo(params)
    .then(() => console.log('Video generation completed'))
    .catch(error => {
        console.error('Error generating video:', error);
        process.exit(1);
    });
"""
        with open('temp_generate.mjs', 'w') as f:
            f.write(temp_js)

        # Prepare environment variables
        env = os.environ.copy()
        env.update({
            'VIDEO_TOPIC': data['videoTopic'],
            'AGENT_A': data['agentA'],
            'AGENT_B': data['agentB'],
            'MUSIC': data['music'],
            'BACKGROUND': data['background'],
            'AI_GENERATED_IMAGES': str(data.get('aiGeneratedImages', True)).lower(),
            'FPS': str(data.get('fps', 20)),
            'DURATION': str(data.get('duration', 1)),
            'CLEAN_SRT': str(data.get('cleanSrt', True)).lower()
        })

        # Execute the Node.js script and capture output in real-time
        process = subprocess.Popen(
            ['node', 'temp_generate.mjs'],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

        # Create thread to read and log stdout
        def log_output(pipe, prefix):
            for line in pipe:
                logger.info(f"{prefix}: {line.strip()}")

        # Start threads to handle stdout and stderr
        stdout_thread = threading.Thread(target=log_output, args=(process.stdout, "Node.js stdout"))
        stderr_thread = threading.Thread(target=log_output, args=(process.stderr, "Node.js stderr"))
        stdout_thread.daemon = True
        stderr_thread.daemon = True
        stdout_thread.start()
        stderr_thread.start()

        # Return immediately with a job ID (in this case, just using timestamp)
        job_id = datetime.now().strftime('%Y%m%d%H%M%S')
        return jsonify({
            'status': 'processing',
            'job_id': job_id,
            'message': 'Video generation started. The process will continue in the background.'
        })

    except Exception as e:
        logger.error(f"Error in generate_video: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)