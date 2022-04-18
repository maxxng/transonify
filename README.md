# Transonify

Transonify is a web application built with React and Flask for automatic lyrics and melody transcription.

The React code is available at `/src` and the Flask code is available at `/server` (entry point is `server/server.py`).

For more information regarding the project refer to `report.pdf`.

## Running Docker Image

The entire application is available as a Docker image. After installing Docker (https://docs.docker.com/get-docker/), run:

    docker run -dp 5000:5000 justintzuriel/transonify

Open http://localhost:5000/ to access the application.

## Running Locally

Python version 3.8.12 is recommended.

If libsndfile1 and ffmpeg are not installed, install them first:

    apt-get update -y
    apt-get install -y --no-install-recommends build-essential gcc libsndfile1
    apt-get install -y ffmpeg

In the project directory, run:

    pip3 install -r requirements.txt

Then, start the Flask application with:

    python3 server/server.py

Open http://localhost:5000/ to access the application.

## Things to Note

The lyrics transcription models "XLSR-Wav2Vec2" and "Wav2Vec2 Base" are hosted on Hugging Face and need to be instantiated the first time they are called in a while. Thus, the application will place an error message instead of the lyrics transcription result in the "Lyrics" container if these models have not been instantiated yet. When this occurs, click the "Transonify" button again after a few seconds for the application to reattempt the transcription.

## Application Overview

### Frontend

The React frontend was bootstrapped using create-react-app. The whole homepage is contained inside the src/Home.jsx file as a functional component. The application allows users to upload a .wav file of their choice from their file system. The application also allows the selection of the models for both lyrics transcription and melody transcription. There is also a switch for whether the user wants to do polyphonic separation, which would be useful for transcribing polyphonic audio more accurately.

States are used to keep track of the current selected model and whether polyphonic separation is to be performed. When the user clicks on the "Transonify" button, the audio file gets sent to the backend for transcription. During this process, the web application displays a loading animation. After all the backend processes are done, the loading animation is replaced with the transcription results from the backend.

The results are divided into several collapsible containers. The lyrics transcription results are returned in a single "Lyrics" container, while the melody transcription results are returned as two representations in the "Piano Roll" and "Score" containers. There is also an audio player that can control the playback of the melody transcription results. The containers can be collapsed so that users can choose to only see the results they are interested in.

To visualize the melody transcription results a web component https://github.com/cifkao/html-midi-player is used. The web component consists of a midi player and multiple midi visualizers. For Transonify, the "piano roll" and "staff" visualizations are used for the piano roll and score representations respectively. This is done so users without a music background can still understand the results using the piano roll while allowing those with a music background to make use of the provided music score. Some of the styles of the web component can be customized using additional CSS, which is how the animations for the active notes in the piano roll representation is done.

### Backend

The Flask backend consists of several endpoints. These endpoints are listed in the server/server.py file, which is also the entry point for the Flask application. The "/" endpoint serves the homepage of the web application. The "/save" endpoint saves the audio sent from the frontend. The "/separate" endpoint separates the audio into vocal and instrumental tracks, and the vocal track is taken for further processing. This endpoint is called if the user switches on polyphonic separation.

There are three models that can be chosen for the lyrics transcription: Google Speech-to-Text, XLSR-Wav2Vec2, and Wav2Vec2 Base. The endpoints for these models are "/lyrics", "/lyrics_xlsr", and "/lyrics_base" respectively. There are two models that can be chosen for the melody transcription: CNN and pYIN. The endpoints are "/melody" and "/melody_v2m" respectively. If called, the endpoints for the models take the saved audio file and perform either lyrics or melody transcription. For lyrics transcription, the predicted lyrics string is returned, whereas for melody transcription, a midi file is returned.
