import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addAudioEvidence } from "./evidenceService";
import * as FileSystem from "expo-file-system/legacy";
import { db, storage } from "./firebase";
import { ref, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

let recording = null;
let interval = null;

const SEGMENT_TIME = 20000;

/* ============================================================
   MAIN START FUNCTION
============================================================ */
export const startAudioEvidence = async () => {
  try {
    if (interval) {
      console.log("Audio evidence already running");
      return;
    }

    console.log("Starting audio evidence...");

    await startSegment();

    interval = setInterval(async () => {
      await startSegment();
    }, SEGMENT_TIME);

  } catch (error) {
    console.log("Audio start error:", error);
  }
};


/* ============================================================
   EACH SEGMENT (20s)
============================================================ */
const startSegment = async () => {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      console.log("[AudioEvidence] Segment saved:", uri);

      const saved = JSON.parse(
        (await AsyncStorage.getItem("audioEvidence")) || "[]"
      );
      await addAudioEvidence(uri);

      await AsyncStorage.setItem(
        "audioEvidence",
        JSON.stringify(saved)
      );

      //upload to Firebase DB + Storage
      await uploadAudioToDB(uri);
    }

    recording = new Audio.Recording();

    await recording.prepareToRecordAsync({
      android: {
        extension: ".m4a",
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 22050,
        numberOfChannels: 1,
        bitRate: 32000
      },
      ios: {
        extension: ".m4a",
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW,
        sampleRate: 22050,
        numberOfChannels: 1,
        bitRate: 32000
      }
    });

    await recording.startAsync();

    console.log("[AudioEvidence] Recording segment started");

  } catch (error) {
    console.log("Segment error:", error);
  }
};


/* ============================================================
   STOP AUDIO SYSTEM
============================================================ */
export const stopAudioEvidence = async () => {
  try {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    if (recording) {
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      console.log("[AudioEvidence] Final segment saved:", uri);

      const saved = JSON.parse(
        (await AsyncStorage.getItem("audioEvidence")) || "[]"
      );

      saved.push(uri);

      await AsyncStorage.setItem(
        "audioEvidence",
        JSON.stringify(saved)
      );
      await uploadAudioToDB(uri);

      recording = null;
    }

    console.log("Audio evidence stopped");

  } catch (error) {
    console.log("Stop error:", error);
  }
};


/* ============================================================
  Upload audio to Firebase
============================================================ */

export const uploadAudioToDB = async (uri) => {
  try {
    const sessionId = await AsyncStorage.getItem("SOS_SESSION_ID");
    if (!sessionId) return;

    // Convert file → base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    // Best browser-compatible MIME for Expo recordings
    const mimeType = "audio/mp4"; // works for AAC inside M4A

    const dbRef = push(ref(db, `sessions/${sessionId}/evidence/audio`));

    await set(dbRef, {
      data: base64,
      type: "audio",
      mime: mimeType,
      time: Date.now()
    });

    console.log("[AudioEvidence] Stored base64 audio in DB");

  } catch (err) {
    console.log("[AudioEvidence] Upload error:", err);
  }
};


