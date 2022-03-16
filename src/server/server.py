import os
from flask import Flask, request, send_from_directory
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'wav'}

app = Flask(__name__)
cors = CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CORS_HEADERS'] = 'Content-Type'

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
            f = open(os.path.join(app.config['UPLOAD_FOLDER'], filename), "wb")
            file.save(f)
            response = send_from_directory(app.config['UPLOAD_FOLDER'], "trans.mid", as_attachment=True)
            return response

if __name__ == '__main__':
    app.run()