# Automatic Lyrics Transctipion

The following folder contains the code files for fine tuning a pre-trained ASR model for singing data.

The training has been done on Kaggle using a GPU. 

1. fine-tuning-wav2vec2-base.ipynb - contains the code for fine tuning the Wav2Vec2 model. The data N20EM was used for this purpose which was uploaded to Kaggle and is stored as a private dataset.

3. fine-tuning-wav2vec2-xlsr.ipyb - contains the code for fine tuning the Wav2Vec2 XLSR model. The data N20EM was used for this purpose which was uploaded to Kaggle and is stored as a private dataset.

## Credits

This codebase includes code adapted from: 

-https://huggingface.co/blog/fine-tune-wav2vec2-english
