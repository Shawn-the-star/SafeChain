import * as Camera from "expo-camera";
import { takePhoto } from "./cameraService";
import { addPhotoEvidence } from "./evidenceService";

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
const uploadPhotoToDB = async (uri) => {
  try {
    const sessionId = await AsyncStorage.getItem("SOS_SESSION_ID");
    if (!sessionId) {
      console.log("[PhotoEvidence] No session ID found, cannot upload");
      return;
    }

    // 1. Upload to Firebase Storage
    const fileRef = storageRef(storage, `sessions/${sessionId}/photos/${Date.now()}.jpg`);

    const response = await fetch(uri);
    const blob = await response.blob();

    await uploadBytes(fileRef, blob);
    const downloadURL = await getDownloadURL(fileRef);

    // 2. Create DB entry
    const dbRef = push(ref(db, `sessions/${sessionId}/evidence/photos`));

    await set(dbRef, {
      url: downloadURL,
      type: "photo",
      time: Date.now()
    });

    console.log("[PhotoEvidence] Uploaded to DB:", downloadURL);

  } catch (err) {
    console.log("[PhotoEvidence] Upload error:", err);
  }
};
