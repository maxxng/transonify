import os
from google.cloud import speech
import subprocess
    
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'key.json'
os.environ['GRPC_POLL_STRATEGY'] = 'poll'
speech_client = speech.SpeechClient()

def transcribe(song_path):
    # Transcribe local media file 
    # File size : < 10 mbps, length < 1 minute
    # .wav file

    # Load files
    input_file = song_path
    converted_file = 'data/mono.wav'

    if os.path.exists(converted_file):
        os.remove(converted_file)

    # Convert file to contain 1 channel using ffmpeg, as that is the input expected
    subprocess.call(['ffmpeg', '-i', input_file, '-ac', '1', converted_file],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

    with open(converted_file, 'rb') as f1:
        byte_data_wav = f1.read()

    audio_wav = speech.RecognitionAudio(content=byte_data_wav)

    config_wav = speech.RecognitionConfig(
        sample_rate_hertz=44100,
        language_code="en-US",
        audio_channel_count=1,
    )

    # Transcribing the RecognitionAudio objects
    response_standard_wav = speech_client.recognize(
        config = config_wav,
        audio = audio_wav
    )

    transcript, confidence = result(response_standard_wav)

    return transcript, confidence

def result(response):
    for result in response.results:
        best_alternative = result.alternatives[0]
        transcript = best_alternative.transcript
        confidence = best_alternative.confidence
        return transcript, confidence

config = dict(language_code="en-US")