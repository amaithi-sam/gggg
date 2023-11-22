import React, { useState, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import './App.css';
import AzureTextSummarization from './Transcription';
import AlertBox from './AlertBox';

import Typography from "@material-ui/core/Typography";
import { makeStyles } from '@material-ui/core/styles';
import WaveformVisualizer from "./WaveformVisualizer";
import { PulseLoader } from "react-spinners";
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import PropagateLoader from "react-spinners/PropagateLoader";
import { BarVisualizer } from 'react-mic-visualizer';

// import TranscribeOutput from "./TranscribeOutput";
const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing(3),
  },
  transcriptionContainer: {
    marginTop: theme.spacing(3),
  },
  errorMessage: {
    color: 'red',
    fontWeight: 'bold',
  },
  transcriptionText: {
    marginTop: theme.spacing(2),
    whiteSpace: 'pre-wrap',
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(3),
  },
}));


function App() {
  const classes = useStyles();

  const [transcription, setTranscription] = useState('');
  const [recentTranscription, setrecentTranscription] = useState('');
  const [latestTranscription, setlatestTranscription] = useState('');
  const [error, setError] = useState('');
  const [recognizer, setRecognizer] = useState(null);
  const [canTranscribe, setcanTranscribe] = useState(false);

  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(false);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(true);

  let [loading, setLoading] = useState(false);

  const [stream, setStream] = useState(MediaStream | null > (null));



  const API = "9eb5d7ece3844a909e2634289ac45f26"
  const API1 = '74a923d95b0a42d585a5d5e5ae6bf708'
  const REGION = 'uksouth'
  const ENDPOINT = 'https://maialanguage.cognitiveservices.azure.com/'

  //   const NotificationContainer = window.ReactNotifications.NotificationContainer;
  // const NotificationManager = window.ReactNotifications.NotificationManager;

  let transcription_array = []

  useEffect(() => {
    return () => {
      if (recognizer) {
        recognizer.close();
      }
    };
  }, [recognizer]);


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setStream(stream);
    });
  }, []);


  // const alertTrigger = (mes, sev) => {
  //   setalertContext({message: mes, severity:sev});
  //   setshowAlert(true);
  //   console.log(showAlert);
  // };




  const startListening = async () => {
    try {
      const speechConfig = sdk.SpeechConfig.fromSubscription(API, REGION);
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

      const conversationTranscriber = new sdk.ConversationTranscriber(speechConfig, audioConfig);

      conversationTranscriber.sessionStarted = (s, e) => {
        console.log('Session started:', e.sessionId);
      };

      conversationTranscriber.sessionStopped = (s, e) => {
        console.log('Session stopped:', e.sessionId);
      };

      conversationTranscriber.canceled = (s, e) => {
        console.log('Canceled event:', e.errorDetails);
        setError(`Error: ${e.errorDetails}`);
        conversationTranscriber.stopTranscribingAsync();
      };

      conversationTranscriber.transcribed = (s, e) => {
        // console.log('Transcribed:', e.result.text);
        console.log("Speaker ID=" + e.result.speakerId + " TRANSCRIBED: Text=" + e.result.text);

        setTranscription((prevTranscription) => prevTranscription + e.result.text);
        // setTranscription(e.result.text);
        let data = {
          speaker: e.result.speakerId,
          text: e.result.text
        }
        // console.log(data.text)
        // data = ``
        // setTranscription((prevData) => [...prevData, data])
        // transcription_array.push(data)
        // console.log(transcription_array)

        // setTranscription((prevData) => [...prevData, e.result.text])

        // let id = 0

        // setTranscription.push({
        //   id: id++,
        //   speaker: e.result.speakerId,
        //   text: e.result.text
        // })
        // setrecentTranscription = transcription[transcription.length - 1]
        // // setrecentTranscription((prevTranscription) => prevTranscription
        // console.log(transcription)
      };

      conversationTranscriber.startTranscribingAsync(
        () => {
          console.log('Continuous transcription started');

          // setalertContext({ message: "Continuous transcription started", severity: 'info' });
          // console.log(showAlert)

          // alertTrigger("Continuous transcription started", 'info')

          // useEffect(() => {
          //   setalertContext({message:"Continuous transcription started", severity:'info'});
          //   setshowAlert(true);

          // }, [setalertContext, setshowAlert]);

          // setshowAlert(true);
          // console.log(showAlert)
          // return <AlertBox message="Continuous transcription started" severity='info' />
          setLoading(!loading)
          setIsStopButtonDisabled(false)
          setIsStartButtonDisabled(true)

          NotificationManager.success('Started transcription', 'Transcription Started', 5000);

        },
        (err) => {
          console.error('Error starting continuous transcription:', err);
          setError(`Error starting continuous transcription: ${err}`);
        }
      );

      setRecognizer(conversationTranscriber);
    } catch (error) {
      console.error('Error initializing speech services:', error);
      setError(`Error initializing speech services: ${error.message}`);
    }
  };

  const stopListening = () => {
    if (recognizer) {
      recognizer.stopTranscribingAsync(
        () => {
          console.log('Continuous transcription stopped');
          NotificationManager.info('Transcription is Stopped');
          NotificationManager.success('Started Summarization', 'Begin Summarization', 5000);
          setcanTranscribe(true)
        },
        (err) => {

          console.error('Error stopping continuous transcription:', err);
          setError(`Error stopping continuous transcription: ${err}`);
        }
      );
    }
  };

  return (
    <div>
      {/* {showAlert && (<AlertBox
                   message= {alertContext.message}
                   severity= {alertContext.severity}
                   timeout={5000}
                   onClose={() => setshowAlert(false)} />) } */}

      <div className={classes.title}>
        <Typography variant="h3">
          Speech Transcripter {" "}
          <span role="img" aria-label="microphone-emoji">
            🎤
          </span>
        </Typography>

        {/* <button onClick={startListening} disabled={isStartButtonDisabled} >
          {isStartButtonDisabled ? 'Button Disabled' : 'Start Listening'}
        </button>

        <button onClick={stopListening} disabled={isStopButtonDisabled} >
          {isStopButtonDisabled ? 'Button Disabled' : 'Stop Listening'}
        </button> */}

        {!isStartButtonDisabled && (
          <button onClick={startListening}>Start Listening</button>
        )}
        {!isStopButtonDisabled && (
          <button onClick={stopListening}>Stop Listening</button>
        )}
        {stream && (
          <div className='visualizer'>
            <BarVisualizer stream={stream} circle={true} />
          </div>
        )}
        <PropagateLoader
          color={"#000000"}
          loading={loading}
          size={15}
        />
      </div>

      <div className={classes.transcriptionContainer}>

        {isStartButtonDisabled && (<h3>Transcription:</h3>)}

        {error && <p className={classes.errorMessage}>Error: {error}</p>}
        <p className={classes.transcriptionText}>{transcription}</p>
        {/* <TranscribeOutput data={transcription} /> */}
        {/* <p>{recentTranscription}</p> */}
        {/* <p>{transcription}</p> */}

        {canTranscribe && (<AzureTextSummarization
          documents={[transcription]}
          apiKey={API1}
          endpoint={ENDPOINT}
          setcanTranscribe={setcanTranscribe}
          setLoading={setLoading}
          setIsStopButtonDisabled={setIsStopButtonDisabled}
          setIsStartButtonDisabled={setIsStartButtonDisabled}
        />)}

        <NotificationContainer />
      </div>
    </div>


  );
};
export default App;
