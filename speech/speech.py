import queue
import sys
import threading

import requests
import sounddevice as sd
import soundfile as sf
import numpy as np

filename = 'bohemian-rhapsody-intro.wav'
blocksize = 2048
buffersize = 20

q = queue.Queue(maxsize=buffersize)

last_volume = -1

class ServerThread(object):
    """ Server thread class
    Thread to periodically send servo movements.
    """

    def __init__(self):
        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True                            # Daemonize thread
        thread.start()                                  # Start the execution

    def run(self):
        global last_volume
        while True:
            #print(f'Requesting {last_volume}')
            requests.get(f'http://192.168.1.35:5000/servo/17/{last_volume}')

def callback(outdata, frames, time, status):
    global last_volume
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
    # 20 is loud???
    normed = -1
    if int(volume_norm) > 0:
        normed = (20 / int(volume_norm)) - 1
        if normed > 1:
            normed = 1
        if normed < -1:
            normed = -1
    last_volume = normed
    print ("|" * int(volume_norm) + f" {last_volume}")

def main():
    event = threading.Event()

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

if __name__ == '__main__':
    serverThread = ServerThread()
    main()
