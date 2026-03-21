import * as Linking from "expo-linking";
import { getContacts } from "./contactService";
import { getLastLocation } from "./evidenceService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sendSOSAlert = async () => {
  try {
    console.log("🔥 sendSOSAlert CALLED");


    console.log("[AlertService] Starting WhatsApp alert...");

    const contacts = await getContacts();

    if (!contacts || contacts.length === 0) {
      console.log("[AlertService] No contacts found");
      return;
    }

    const sessionId = await AsyncStorage.getItem("SOS_SESSION_ID");

    const trackingLink = `https://sos-dashboard-two.vercel.app/track/${sessionId}`;

    const dashboardLink = `https://sos-dashboard-two.vercel.app/dashboard/${sessionId}`;
    const message =
      `🚨 EMERGENCY SOS 🚨
I might be in danger.

📍 Track my LIVE location:
${trackingLink}

⏱️ ${new Date().toLocaleString()}

📸 I have also captured audio and photos.
${dashboardLink}
`;


    // 🔁 Loop through contacts
    for (let i = 0; i < contacts.length; i++) {

      const contact = contacts[i];

      if (!contact.phone) continue;

      // Clean number (VERY IMPORTANT)
      let phone = contact.phone.replace(/[^0-9]/g, "");

      // Ensure India country code (adjust if needed)
      if (!phone.startsWith("91")) {
        phone = "91" + phone;
      }

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      console.log("[AlertService] Opening:", phone);

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);

        // ⏳ Prevent crash / overlap
        await delay(5000);
      } else {
        console.log("[AlertService] Cannot open WhatsApp");
      }
    }

    console.log("[AlertService] Done sending alerts");

  } catch (error) {
    console.log("[AlertService] Error:", error);
  }
};
