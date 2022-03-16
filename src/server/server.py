import os
import torch
from flask import Flask, request, send_from_directory
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename

from predict import AST_Model
from inference import make_prediction

UPLOAD_FOLDER = './data/'
ALLOWED_EXTENSIONS = {'wav'}

app = Flask(__name__)
cors = CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CORS_HEADERS'] = 'Content-Type'

song_path = os.path.join(app.config['UPLOAD_FOLDER'], "Mixture.wav")
midi_path = os.path.join(app.config['UPLOAD_FOLDER'], "trans.mid")
model_path = os.path.join(app.config['UPLOAD_FOLDER'], "model")

onset_thres = 0.4
offset_thres = 0.5

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = AST_Model(device, model_path)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['POST'])
@cross_origin()
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return
        file = request.files['file']
        if file.filename == '':
            return
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            f = open(song_path, "wb")
            file.save(f)

            make_prediction(song_path, midi_path, model, onset_thres, offset_thres)

            response = send_from_directory(app.config['UPLOAD_FOLDER'], "trans.mid", as_attachment=True)
            return response

if __name__ == '__main__':
    app.run()