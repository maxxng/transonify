import { useRef, useState } from "react";

import "./midi.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { useEffect } from "react";

function Home() {
  const [file, setFile] = useState(null);
  const player = useRef(null);
  const visualizer = useRef(null);

  useEffect(() => {
    player.current.soundFont = "";
    setInterval(() => console.log(player.current.noteSequence), 10000);
  });

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
        margin: "2em",
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
        margin: "2em",
      }}
    >
      <input
        type="file"
        id="myFile"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ border: "1px solid bold" }}
      />
      <br />
      <Button
        size="lg"
        style={{ margin: "1em", color: "#eaf6de", backgroundColor: "#013870" }}
      >
        Transonify!
      </Button>
    </div>
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
        <div
          style={{
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            width: "50%",
          }}
        >
          <midi-player
            src="/trans.mid"
            visualizer="#myVisualizer"
            style={{ alignSelf: "center" }}
            ref={player}
          />
          <br />
          <midi-visualizer
            src="/trans.mid"
            id="myVisualizer"
            style={{
              backgroundColor: "#eaf6de",
              padding: "2em",
              borderRadius: "5px",
            }}
            ref={visualizer}
          ></midi-visualizer>
        </div>
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
