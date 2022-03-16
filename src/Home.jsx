import { useEffect, useRef, useState } from "react";

import "./midi.css";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Spinner from "react-bootstrap/Spinner";

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [midiSrc, setMidiSrc] = useState(null);

  const player = useRef(null);
  const pianoRollVisualizer = useRef(null);
  const staffVisualizer = useRef(null);

  useEffect(() => {
    if (player.current) {
      player.current.soundFont = "";
      player.current.addVisualizer(pianoRollVisualizer.current);
      player.current.addVisualizer(staffVisualizer.current);
    }
  });

  const handleChange = (e) => {
    if (e.target.files[0].type === "audio/wav") {
      setSelectedFile(e.target.files[0]);
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  };

  const handleSubmit = () => {
    setCanSubmit(false);
    setIsFetching(true);
    const formData = new FormData();

    formData.append("file", selectedFile);

    fetch("http://127.0.0.1:5000/", {
      method: "POST",
      mode: "cors",
      body: formData,
    })
      .then((response) => response.blob())
      .then((result) => {
        console.log("Success:", result);
        const urlCreator = window.URL || window.webkitURL;
        setMidiSrc(urlCreator.createObjectURL(result));
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
      <Container>
        <Navbar.Brand style={{ color: "#eaf6de" }}>Transonify</Navbar.Brand>
      </Container>
    </Navbar>
  );

  const intro = (
    <div
      style={{
        margin: "1em",
      }}
    >
      <h1 style={{ fontSize: "4em", fontFamily: "Paytone One" }}>
        Transcribe your songs with Transonify.
      </h1>
      <h5 style={{ fontSize: "2em" }}>
        Automatic lyrics and melody transcription in a flash.
      </h5>
    </div>
  );

  const form = (
    <div
      style={{
        margin: "1em",
      }}
    >
      <input
        type="file"
        accept=".wav"
        onChange={(e) => handleChange(e)}
        style={{ margin: "1em" }}
      />
      <Button
        size="lg"
        disabled={!canSubmit}
        onClick={handleSubmit}
        style={{ margin: "1em", color: "#eaf6de", backgroundColor: "#013870" }}
      >
        Transonify!
      </Button>
    </div>
  );

  const midi = (
    <div
      style={{
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        width: "50%",
      }}
    >
      <midi-player src={midiSrc} style={{ alignSelf: "center" }} ref={player} />
      <br />
      <div
        style={{
          backgroundColor: "#eaf6de",
          padding: "1em",
          borderRadius: "5px",
        }}
      >
        <midi-visualizer
          src={midiSrc}
          type="staff"
          ref={staffVisualizer}
        ></midi-visualizer>
        <midi-visualizer
          src="/trans.mid"
          ref={pianoRollVisualizer}
        ></midi-visualizer>
      </div>
    </div>
  );

  const spinner = (
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );

  return (
    <div>
      {navbar} {intro} {form}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src="/note_a.svg"
          width="220em"
          alt="note_a"
          style={{ marginLeft: "5em", marginRight: "5em" }}
        />
        {isFetching ? spinner : midiSrc && midi}
        <img
          src="/note_b.svg"
          width="300em"
          alt="note_b"
          style={{ marginLeft: "3em", marginRight: "3em" }}
        />
      </div>
    </div>
  );
}

export default Home;
