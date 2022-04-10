import { useEffect, useRef, useState } from "react";

import "./midi.css";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";

const initCollapseState = {
  pianoroll: false,
  staff: false,
  lyrics: false,
};

const lyricsModels = {
  GOOGLE_STT: {
    id: "google_stt",
    label: "Google Speech-to-Text",
    url: "http://127.0.0.1:5000/lyrics",
  },
  WAV2VEC2_XSLR: {
    id: "w2v2_xslr",
    label: "XLSR-Wav2Vec2",
    url: "http://127.0.0.1:5000/lyrics_xslr",
  },
  WAV2VEC2_BASE: {
    id: "w2v2_base",
    label: "Base Wav2Vec2",
    url: "http://127.0.0.1:5000/lyrics_base",
  },
};

const melodyModels = {
  CNN: {
    id: "cnn",
    label: "CNN Model",
    url: "http://127.0.0.1:5000/melody",
  },
};

const initConfig = {
  lyrics: "GOOGLE_STT",
  melody: "CNN",
};

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [midiSrc, setMidiSrc] = useState(null);
  const [lyrics, setLyrics] = useState(null);
  const [collapseState, setCollapseState] = useState(initCollapseState);
  const [config, setConfig] = useState(initConfig);

  const player = useRef(null);
  const pianoRollVisualizer = useRef(null);
  const staffVisualizer = useRef(null);

  useEffect(() => {
    if (player.current) {
      player.current.soundFont = "";
      player.current.addVisualizer(pianoRollVisualizer.current);
      player.current.addVisualizer(staffVisualizer.current);
    }
    if (pianoRollVisualizer.current) {
      pianoRollVisualizer.current.config = {
        noteHeight: 15,
        pixelsPerTimeStep: 100,
        minPitch: 40,
      };
    }
    if (staffVisualizer.current) {
      staffVisualizer.current.config = {
        noteHeight: 8,
        pixelsPerTimeStep: 200,
        minPitch: 70,
      };
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files[0].type === "audio/wav") {
      setSelectedFile(e.target.files[0]);
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  };

  const handleLyricsChange = (e) => {
    setConfig({ ...config, lyrics: e.target.value });
  };

  const handleMelodyChange = (e) => {
    setConfig({ ...config, melody: e.target.value });
  };

  const handleSubmit = () => {
    setCanSubmit(false);
    setIsFetching(true);
    const formData = new FormData();

    formData.append("file", selectedFile);

    Promise.all([
      fetch(melodyModels[config.melody].url, {
        method: "POST",
        mode: "cors",
        body: formData,
      }),
      fetch(lyricsModels[config.lyrics].url, {
        method: "POST",
        mode: "cors",
        body: formData,
      }),
    ])
      .then(([melodyResponse, lyricsResponse]) =>
        Promise.all([melodyResponse.blob(), lyricsResponse.json()])
      )
      .then(([melodyObject, lyricsObject]) => {
        const urlCreator = window.URL || window.webkitURL;
        setMidiSrc(urlCreator.createObjectURL(melodyObject));
        setLyrics(lyricsObject["lyrics"]);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setCanSubmit(true);
        setIsFetching(false);
      });
  };

  const navbar = (
    <Navbar variant="dark" style={{ backgroundColor: "#013870" }}>
      <Navbar.Brand style={{ color: "#ffffff", marginLeft: "1em" }}>
        Transonify
      </Navbar.Brand>
    </Navbar>
  );

  const intro = (
    <h5 style={{ fontSize: "1.5em", color: "#013870", marginTop: "1.5em" }}>
      Automatic lyrics and melody transcription in a flash.
    </h5>
  );

  const form = (
    <div
      style={{
        padding: "1em",
        borderRadius: "5px",
        width: "30%",
        textAlign: "center",
        border: "2px solid #013870",
        margin: "2em auto 2em",
      }}
    >
      <Form>
        <Form.Group as={Row} style={{ marginBottom: "1em" }}>
          <Col sm="12">
            <Form.Control
              type="file"
              accept=".wav"
              onChange={(e) => handleFileChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Form.Label
            column
            sm="3"
            style={{ textAlign: "left", color: "#013870" }}
          >
            Lyrics Model
          </Form.Label>
          <Col sm="9">
            <Form.Select onChange={(e) => handleLyricsChange(e)}>
              {Object.keys(lyricsModels).map((model) => (
                <option key={lyricsModels[model].id} value={model}>
                  {lyricsModels[model].label}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Form.Label
            column
            sm="3"
            style={{ textAlign: "left", color: "#013870" }}
          >
            Melody Model
          </Form.Label>
          <Col sm="9">
            <Form.Select onChange={(e) => handleMelodyChange(e)}>
              {Object.keys(melodyModels).map((model) => (
                <option key={melodyModels[model].id} value={model}>
                  {melodyModels[model].label}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        <Button
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{
            marginTop: "1em",
            color: "#ffffff",
            backgroundColor: "#013870",
          }}
        >
          Transonify!
        </Button>
      </Form>
    </div>
  );

  const downArrow = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-caret-down-fill"
      viewBox="0 0 16 16"
    >
      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
    </svg>
  );

  const upArrow = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-caret-up-fill"
      viewBox="0 0 16 16"
    >
      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
    </svg>
  );

  const midi = (
    <div>
      <midi-player
        src={midiSrc}
        style={{
          alignSelf: "center",
          width: "100%",
        }}
        ref={player}
      />
      <br />
      <br />
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "1em",
          borderRadius: "5px",
          textAlign: "left",
          color: "#013870",
        }}
      >
        <span
          onClick={() =>
            setCollapseState({
              ...collapseState,
              pianoroll: !collapseState.pianoroll,
            })
          }
        >
          {"Piano Roll "}
          {collapseState.pianoroll ? upArrow : downArrow}
        </span>
        <Collapse in={collapseState.pianoroll}>
          <div>
            <midi-visualizer
              src={midiSrc}
              ref={pianoRollVisualizer}
            ></midi-visualizer>
          </div>
        </Collapse>
      </div>
      <br />
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "1em",
          borderRadius: "5px",
          textAlign: "left",
          color: "#013870",
        }}
      >
        <span
          onClick={() =>
            setCollapseState({
              ...collapseState,
              staff: !collapseState.staff,
            })
          }
        >
          {"Score "}
          {collapseState.staff ? upArrow : downArrow}
        </span>
        <Collapse in={collapseState.staff}>
          <div>
            <midi-visualizer
              src={midiSrc}
              type="staff"
              ref={staffVisualizer}
            ></midi-visualizer>
          </div>
        </Collapse>
      </div>
    </div>
  );

  const lyricsBox = (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "1em",
        borderRadius: "5px",
        textAlign: "left",
        color: "#013870",
      }}
    >
      <span
        onClick={() =>
          setCollapseState({
            ...collapseState,
            lyrics: !collapseState.lyrics,
          })
        }
      >
        {"Lyrics "}
        {collapseState.lyrics ? upArrow : downArrow}
      </span>
      <Collapse in={collapseState.lyrics}>
        <div>
          <br />
          <p>{lyrics}</p>
        </div>
      </Collapse>
    </div>
  );

  const spinner = (
    <Spinner animation="border" role="status" style={{ alignSelf: "center" }}>
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );

  return (
    <div>
      {navbar}
      {intro}
      {form}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* <img
          src="/note_a.svg"
          width="50em"
          alt="note_a"
          style={{ marginLeft: "5em", marginRight: "5em" }}
        /> */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "80%",
          }}
        >
          {isFetching ? spinner : midiSrc && midi}
          <br />
          {!isFetching && lyrics && lyricsBox}
          <br />
        </div>
        {/* <img
          src="/note_b.svg"
          width="50em"
          alt="note_b"
          style={{ marginLeft: "3em", marginRight: "3em" }}
        /> */}
      </div>
    </div>
  );
}

export default Home;
