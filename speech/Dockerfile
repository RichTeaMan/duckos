FROM python:3-buster

WORKDIR /app

RUN python -m pip install --upgrade pip
RUN pip3 install sounddevice soundfile numpy

COPY . .

ENTRYPOINT python3 speech.py
