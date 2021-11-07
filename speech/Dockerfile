FROM python:3.8-slim-buster

RUN apt-get update && \
    apt-get install -y \
        libffi-dev \
        libc-dev \
        build-essential \
        make \
        curl \
        gcc \
        libportaudio2 \
        libsndfile1-dev

WORKDIR /app

RUN python -m pip install --upgrade pip
RUN pip3 install sounddevice soundfile numpy

COPY . .

RUN curl tomdesktop.internal/bohemian-rhapsody-intro.wav -o bohemian-rhapsody-intro.wav

ENTRYPOINT python3 speech.py
