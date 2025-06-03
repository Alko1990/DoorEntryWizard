// src/data/imageMap.js (or modules.js as it was named in your uploaded content)

// STEP 1: Your existing image imports
import Camera1 from "../assets/Images/EntryPanel/camera_1.jpg";
import Camera0 from "../assets/Images/EntryPanel/camera_0.jpg";
import Camera2 from "../assets/Images/EntryPanel/camera_2.jpg";
import Display from "../assets/Images/EntryPanel/display.jpg";
import Keypad from "../assets/Images/EntryPanel/keypad.png";
import Info from "../assets/Images/EntryPanel/info.jpg";
import RFID from "../assets/Images/EntryPanel/rfid.jpg";
import TwoButtonsImg from "../assets/Images/EntryPanel/2.jpg";
import ThreeButtonsImg from "../assets/Images/EntryPanel/3.jpg";
import FourButtonsImg from "../assets/Images/EntryPanel/4.jpg";
import EightButtonsImg from "../assets/Images/EntryPanel/8.jpg";
import BlindModuleImage from "../assets/Images/EntryPanel/blank.jpg";
import Audio0 from "../assets/Images/EntryPanel/audio_0.jpg";
import Audio1 from "../assets/Images/EntryPanel/audio_1.jpg";
import Audio2 from "../assets/Images/EntryPanel/audio_2.jpg";

// Receiver images
import XTSWH from "../assets/Images/Receivers/XTS7WH.webp";
import XTSBK from "../assets/Images/Receivers/XTS7BK.webp";
import PLXA from "../assets/Images/Receivers/PLXA.webp";
import PLXV from "../assets/Images/Receivers/PLXV.webp";
import AGTV_Img from "../assets/Images/Receivers/AGTV.webp";
import AGTA_Img from "../assets/Images/Receivers/AGTA.webp";
import PECBI_Img from "../assets/Images/Receivers/PECBI.webp";
// TODO: Import images for AGTV, AGTA, PEC if you plan to use them for receivers

// --- NEW: VR Module Image Imports (Placeholders) ---
// Replace these with your actual paths and filenames once you have the VR images.
// Make sure the variable names are unique and descriptive.

// Example for X1 Video VR images
import Camera1VR_Img from "../assets/Images/EntryPanel/VR/Camera_1VR.webp"; // Placeholder path
import Camera0VR_Img from "../assets/Images/EntryPanel/VR/Camera_0VR.webp"; // Placeholder path
import Camera2VR_Img from "../assets/Images/EntryPanel/VR/Camera_2VR.webp"; // Placeholder path

// Example for X1 Audio VR images
import Audio0VR_Img from "../assets/Images/EntryPanel/VR/audio_0VR.webp"; // Placeholder path
import Audio1VR_Img from "../assets/Images/EntryPanel/VR/audio_1VR.webp"; // Placeholder path
import Audio2VR_Img from "../assets/Images/EntryPanel/VR/audio_2VR.webp"; // Placeholder path

// Example for System Agnostic VR images
import DisplayVR_Img from "../assets/Images/EntryPanel/VR/displayVR.webp"; // Placeholder path
import KeypadVR_Img from "../assets/Images/EntryPanel/VR/keypadVR.webp"; // Placeholder path
import RFIDVR_Img from "../assets/Images/EntryPanel/VR/rfidVR.webp"; // Placeholder path
import BlindVR_Img from "../assets/Images/EntryPanel/VR/blankVR.webp"; // Placeholder path
import InfoVR_Img from "../assets/Images/EntryPanel/VR/infoVR.webp"; // Placeholder path
import TwoButtonsVR_Img from "../assets/Images/EntryPanel/VR/2VR.webp"; // Placeholder path
import ThreeButtonsVR_Img from "../assets/Images/EntryPanel/VR/3VR.webp"; // Placeholder path
import FourButtonsVR_Img from "../assets/Images/EntryPanel/VR/4VR.webp"; // Placeholder path
import EightButtonsVR_Img from "../assets/Images/EntryPanel/VR/8VR.webp"; // Placeholder path

// Add a generic placeholder image
import PlaceholderGeneric from "../assets/Images/placeholder_generic.jpg"; // Create this image

// --- End of NEW VR Image Imports ---

// STEP 2: Create and export the IMAGE_MAP
export const IMAGE_MAP = {
  // Video Modules (Standard)
  Camera_1: Camera1,
  Camera_0: Camera0,
  Camera_2: Camera2,

  // Audio Modules (Standard)
  Audio_0: Audio0,
  Audio_1: Audio1,
  Audio_2: Audio2,

  // System Agnostic Panel Modules (Standard)
  Display: Display,
  Keypad: Keypad,
  Info: Info,
  RFID: RFID,
  Blind: BlindModuleImage,
  2: TwoButtonsImg, // Key must be string "2" if metadata Image field is "2"
  3: ThreeButtonsImg,
  4: FourButtonsImg,
  8: EightButtonsImg,

  // --- NEW: VR Module Mappings ---
  // Keys MUST exactly match the "Vrimage" field in your Cleaned_metadata_new.json

  // X1 & IP Video VR (assuming same keys used for IP if metadata matches)
  Camera_1VR: Camera1VR_Img,
  Camera_0VR: Camera0VR_Img,
  Camera_2VR: Camera2VR_Img, // Note: Check your IP Video metadata, it might reuse Camera_0VR or Camera_1VR for "2 Knapp"

  // X1 & IP & 4G Audio VR (assuming same keys if metadata matches)
  Audio_0VR: Audio0VR_Img,
  Audio_1VR: Audio1VR_Img,
  Audio_2VR: Audio2VR_Img, // Note: Check your 4G and IP Audio metadata for exact Vrimage keys

  // System Agnostic VR
  DisplayVR: DisplayVR_Img,
  KeypadVR: KeypadVR_Img, // This key is used by both "Keypad" and "Info" modules for their Vrimage
  RFIDVR: RFIDVR_Img,
  BlindVR: BlindVR_Img,
  InfoVR: InfoVR_Img,
  "2VR": TwoButtonsVR_Img, // Key is "2VR"
  "3VR": ThreeButtonsVR_Img,
  "4VR": FourButtonsVR_Img,
  "8VR": EightButtonsVR_Img,
  // --- End of NEW VR Module Mappings ---

  // Receivers
  XTS7WH: XTSWH,
  XTS7BK: XTSBK,
  PLXV: PLXV,
  PLXA: PLXA,
  XTS5WH: XTSWH, // Assuming XTS5WH uses the same image as XTS7WH (XTSWH)
  XTS5BK: XTSBK, // Assuming XTS5BK uses the same image as XTS7BK (XTSBK)
  AGTV: AGTV_Img,
  AGTA: AGTA_Img,
  PECBI: PECBI_Img,

  // TODO: Add mappings for any other images, e.g., power supplies like "VA01" if desired
  // VA01: VA01_PS_Image, // Example if you import VA01_PS_Image

  // Generic Placeholder
  placeholder: PlaceholderGeneric,
};
