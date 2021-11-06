import queue
import sys
import threading

import sounddevice as sd
import soundfile as sf
import numpy as np


def int_or_str(text):
    """Helper function for argument parsing."""
    try:
        return int(text)
    except ValueError:
        return text

filename = 'bohemian-rhapsody-intro.wav'
blocksize = 2048
buffersize = 20

q = queue.Queue(maxsize=buffersize)
event = threading.Event()

def callback(outdata, frames, time, status):
    assert frames == blocksize
    if status.output_underflow:
        print('Output underflow: increase blocksize?', file=sys.stderr)
        raise sd.CallbackAbort
    assert not status
    try:
        data = q.get_nowait()
    except queue.Empty as e:
        print('Buffer is empty: increase buffersize?', file=sys.stderr)
        raise sd.CallbackAbort from e
    if len(data) < len(outdata):
        outdata[:len(data)] = data
        outdata[len(data):].fill(0)
        raise sd.CallbackStop
    else:
        outdata[:] = data

    volume_norm = np.linalg.norm(outdata)*10
    print ("|" * int(volume_norm))

with sf.SoundFile(filename) as f:
    for _ in range(buffersize):
        data = f.read(blocksize)
        if not len(data):
            break
        q.put_nowait(data)  # Pre-fill queue
    stream = sd.OutputStream(
        samplerate=f.samplerate, blocksize=blocksize,
        channels=f.channels,
        callback=callback, finished_callback=event.set)
    with stream:
        timeout = blocksize * buffersize / f.samplerate
        while len(data):
            data = f.read(blocksize)
            q.put(data, timeout=timeout)
        event.wait()  # Wait until playback is finished
