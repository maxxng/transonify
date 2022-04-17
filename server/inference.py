from torch.utils.data import DataLoader

import mido
from dataset import OneSong

import warnings
warnings.filterwarnings('ignore')

def notes2mid(notes):
    mid = mido.MidiFile()
    track = mido.MidiTrack()
    mid.tracks.append(track)
    mid.ticks_per_beat = 480
    new_tempo = mido.bpm2tempo(120.0)

    track.append(mido.MetaMessage('set_tempo', tempo=new_tempo))
    track.append(mido.Message('program_change', program=0, time=0))

    cur_total_tick = 0

    for note in notes:
        if note[2] == 0:
            continue
        note[2] = int(round(note[2]))

        ticks_since_previous_onset = int(mido.second2tick(note[0], ticks_per_beat=480, tempo=new_tempo))
        ticks_current_note = int(mido.second2tick(note[1]-0.0001, ticks_per_beat=480, tempo=new_tempo))
        note_on_length = ticks_since_previous_onset - cur_total_tick
        note_off_length = ticks_current_note - note_on_length - cur_total_tick

        track.append(mido.Message('note_on', note=note[2], velocity=100, time=note_on_length))
        track.append(mido.Message('note_off', note=note[2], velocity=100, time=note_off_length))
        cur_total_tick = cur_total_tick + note_on_length + note_off_length

    return mid
    

def convert_to_midi(predicted_result, song_id, output_path):
    to_convert = predicted_result[song_id]
    mid = notes2mid(to_convert)
    mid.save(output_path)

def make_prediction(input_path, output_path, model, onset_thres, offset_thres, song_id='1'):
    results = {}

    test_dataset = OneSong(input_path, song_id)
    test_loader = DataLoader(
            test_dataset,
            batch_size=1,
            pin_memory=False,
            shuffle=False,
            drop_last=False,
        )

    results = model.predict(test_loader, results=results, onset_thres=onset_thres, offset_thres=offset_thres)
    convert_to_midi(results, song_id, output_path)

    return results


    