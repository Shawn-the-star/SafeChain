import * as Camera from "expo-camera";
import { takePhoto } from "./cameraService";
import { addPhotoEvidence } from "./evidenceService";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, storage } from "./firebase";
import { ref, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

let interval = null;

const PHOTO_INTERVAL = 15000;

/* ============================================================
   START PHOTO EVIDENCE
============================================================ */
export const startPhotoEvidence = async (cameraRef) => {
  try {
    console.log("[PhotoEvidence] Starting");

    if (interval) return;

    interval = setInterval(async () => {
      const uri = await takePhoto();

      if (uri) {

        await addPhotoEvidence(uri);

        await uploadPhotoToDB(uri);
      }

      console.log("[PhotoEvidence] Photo captured:", uri);

    }, PHOTO_INTERVAL);

  } catch (error) {
    console.log("Photo evidence error:", error);
  }
};


/* ============================================================
   STOP
============================================================ */
export const stopPhotoEvidence = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  console.log("[PhotoEvidence] Stopped");
};


/* ============================================================
   NEW: Upload Photo to Firebase
============================================================ */
export const uploadPhotoToDB = async (uri) => {
  try {
    const sessionId = await AsyncStorage.getItem("SOS_SESSION_ID");
    if (!sessionId) return console.log("No session ID");

    // Convert to base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    const dbRef = push(ref(db, `sessions/${sessionId}/evidence/photos`));

    await set(dbRef, {
      data: base64,
      type: "photo",
      time: Date.now()
    });

    console.log("Photo saved to DB");

  } catch (err) {
    console.log("Photo upload error:", err);
  }
};

