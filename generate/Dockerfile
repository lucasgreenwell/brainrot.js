# Use a smaller base image than full "python:3.9"
FROM python:3.9-alpine AS base

# Suppress interactive prompts in Debian/apt
ENV DEBIAN_FRONTEND=noninteractive

# 1) Install dependencies in ONE layer, then remove apt cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ffmpeg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# 2) Install Node.js (again in a single RUN), remove apt cache
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get update \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

# 3) Upgrade pip
RUN pip install --upgrade pip

# 4) Set workdir
WORKDIR /app/brainrot

# 5) Copy in your Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6) Copy setup.py and the whisper_timestamped module
COPY setup.py .
COPY whisper_timestamped whisper_timestamped
RUN pip install --no-cache-dir ".[dev]"

# 7) Install specific Torch CPU wheels
RUN pip install --no-cache-dir \
    torch==1.13.1+cpu \
    torchaudio==0.13.1+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html

# 8) Install gunicorn for serving
RUN pip install --no-cache-dir gunicorn

# 9) Copy the rest of your app
COPY . .

# 10) Install Node.js dependencies if needed
RUN npm install pm2 -g && npm install

# Expose your port
EXPOSE 5000

# Final entrypoint & command
ENTRYPOINT ["gunicorn"]
CMD ["-w", "1", "-b", "0.0.0.0:5000", "--access-logfile", "access.log", "--error-logfile", "error.log", "--chdir", "/app/brainrot", "transcribe:app", "--timeout", "120"]
