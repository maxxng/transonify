import os
import torch
from flask import Flask, request, send_from_directory
from flask_cors import CORS, cross_origin

from predict import AST_Model
from inference import make_prediction as cnn_transcribe
from voice2midi import query as v2m_transcribe
from google_stt import transcribe as stt_transcribe
from xlsr_api import query as xlsr_transcribe
from base_api import query as base_transcribe
from vocal_remover.inference_vr import query as separate_voice

UPLOAD_FOLDER = './server/data/'
ALLOWED_EXTENSIONS = {'wav'}

app = Flask(__name__, static_folder='../build', static_url_path='/')
cors = CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CORS_HEADERS'] = 'Content-Type'

song_path = os.path.join(app.config['UPLOAD_FOLDER'], "Mixture.wav")
mono_path = os.path.join(app.config['UPLOAD_FOLDER'], "Mixture_Vocals.wav")
midi_path = os.path.join(app.config['UPLOAD_FOLDER'], "trans.mid")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    '''
    Serve homepage from build folder
    '''
    return app.send_static_file('index.html')
    
@app.route('/save', methods=['POST'])
@cross_origin()
def save():
    '''
   Save the audio file locally for transcription
    '''
    if request.method == 'POST':
        if 'file' not in request.files:
            return
        file = request.files['file']
        f = open(song_path, "wb")
        file.save(f)
        return "Success"

@app.route('/separate', methods=['POST'])
@cross_origin()
def separate():
    '''
    Perform polyphonic separation on saved audio file
    '''
    separate_voice(song_path)
    os.remove(song_path)
    os.rename(mono_path, song_path)
    return "Success"

@app.route('/melody', methods=['POST'])
@cross_origin()
def transcribe_melody():
    '''
    Use CNN model for melody transcription
    '''
    model_path = os.path.join(app.config['UPLOAD_FOLDER'], "model_4")
    onset_thres = 0.4
    offset_thres = 0.5
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = AST_Model(device, model_path)
    cnn_transcribe(song_path, midi_path, model, onset_thres, offset_thres)
    response = send_from_directory("./data/", "trans.mid", as_attachment=True)
    return response

@app.route('/melody_v2m', methods=['POST'])
@cross_origin()
def transcribe_melody_v2m():
    '''
    Use pYin model for melody transcription
    '''
    v2m_transcribe(song_path, midi_path)
    response = send_from_directory("./data/", "trans.mid", as_attachment=True)
    return response

@app.route('/lyrics', methods=['POST'])
@cross_origin()
def transcribe_lyrics():
    '''
    Use Google Speech-to-Text model for lyrics transcription
    '''
    transcript = stt_transcribe(song_path)
    return {'lyrics': transcript}

@app.route('/lyrics_xlsr', methods=['POST'])
@cross_origin()
def transcribe_lyrics_xlsr():
    '''
    Use XLSR-Wav2Vec2 model for lyrics transcription
    '''
    _, transcript = xlsr_transcribe(song_path)
    return {'lyrics': transcript}

@app.route('/lyrics_base', methods=['POST'])
@cross_origin()
def transcribe_lyrics_base():
    '''
    Use Wav2Vec2 Base model for lyrics transcription
    '''
    _, transcript = base_transcribe(song_path)
    return {'lyrics': transcript}

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=os.environ.get("PORT", 5000))