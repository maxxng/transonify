import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class BaseNN(nn.Module):
    '''
    This is a base CNN model with changing number of convolution layer
    '''

    def __init__(self, pitch_class=12, pitch_octave=4):
        super(BaseNN, self).__init__()
        self.pitch_octave = pitch_octave
        self.pitch_class = pitch_class

        self.conv1 = nn.Conv2d(1, 256, kernel_size=(3, 3), padding=(1, 1))
        self.conv1b = nn.Conv2d(256, 256, kernel_size=(3, 3), padding=(1, 1))
        self.conv2 = nn.Conv2d(256, 256, kernel_size=(3, 3), padding=(1, 1))
        self.conv3 = nn.Conv2d(256, 128, kernel_size=(3, 3), padding=(1, 1))
        self.conv4 = nn.Conv2d(128, 128, kernel_size=(3, 3), padding=(1, 1))
        self.conv5 = nn.Conv2d(128, 1, kernel_size=(3, 3), padding=(1, 1))
        self.fc1   = nn.Linear(84, 256)
        self.fc2a   = nn.Linear(256, 256)
        self.fc2b   = nn.Linear(256, 256)
        self.fc3   = nn.Linear(256, 64)
        self.fc4   = nn.Linear(64, 2+pitch_class+pitch_octave+2)

        self.debug = False

    def forward(self, x):
        if self.debug: print('in',x.shape)

        out = F.relu(self.conv1(x))
        out = F.relu(self.conv1b(out))
        if self.debug: print('1',out.shape)

        out = F.max_pool2d(out, 2)
        if self.debug: print('2',out.shape)

        out = F.relu(self.conv2(out))
        if self.debug: print('3',out.shape)

        # out = F.max_pool2d(out, 2)
        # if self.debug: print('4',out.shape)

        out = F.relu(self.conv3(out))
        if self.debug: print('4b',out.shape)
        # out = F.max_pool2d(out, 2)
        # if self.debug: print('4c',out.shape)
        out = F.relu(self.conv4(out))
        if self.debug: print('4d',out.shape)
        out = F.max_pool2d(out, 2)
        if self.debug: print('4e',out.shape)
        out = F.relu(self.conv5(out))
        if self.debug: print('4f',out.shape)

        if self.debug: print('5',out.shape)
        out = out.view(out.size(0), -1)
        if self.debug: print('6',out.shape)
        out = F.relu(self.fc1(out))
        if self.debug: print('7',out.shape)
        out = F.relu(self.fc2a(out))
        if self.debug: print('8',out.shape)
        out = F.relu(self.fc3(out))
        if self.debug: print('9',out.shape)
        h = self.fc4(out)
        if self.debug: print('out',h.shape)

        onset_logits = h[:, 0]
        offset_logits = h[:, 1]

        pitch_out = h[:, 2:]

        pitch_octave_logits = pitch_out[:, 0:self.pitch_octave+1]
        pitch_class_logits = pitch_out[:, self.pitch_octave+1:]


        return onset_logits, offset_logits, pitch_octave_logits, pitch_class_logits