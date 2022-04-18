import requests
import json
from autocorrect import Speller

def query(filename):
	"""
    Returns the transription results of the Wav2Vec2 Base model.

    Parameters
    ----------
    filename: path to file

    Returns
    -------
    tuple containing original transcription and autocorrected transcription
	
    """
	model_id = "akanksha-b14/songs_transcription_wav2vec_base2"
	api_token = "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" # get yours at hf.co/settings/tokens

	with open(filename, "rb") as f:
		data = f.read()
	headers = {"Authorization": f"Bearer {api_token}"}
	API_URL = f"https://api-inference.huggingface.co/models/{model_id}"
	response = requests.post(API_URL, headers=headers, data=data)
	data = json.loads(response.content.decode("utf-8"))

	if 'text' in data:
		spell = Speller(lang='en')

		correct_data = spell(data['text'])

		print('xslr results:', correct_data)

		return (data['text'], correct_data)
	
	else:
		error_message = '<Wav2Vec2 Base is still loading in Hugging Face, please try again in a few seconds.>'
		return (error_message, error_message)