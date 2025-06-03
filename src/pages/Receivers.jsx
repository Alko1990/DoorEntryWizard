// src/pages/Receivers.jsx
import React, { useContext, useMemo, useState, useEffect } from "react"; // Added useState, useEffect
import { useNavigate } from "react-router-dom";
import { EntryManagerContext } from "../utils/EntryManager.jsx";
import metadata from "../data/Cleaned_metadata_new.json"; // Assuming this is used for receiver details if needed
import { IMAGE_MAP } from "../data/imageMap.js";
import ReceiverCard from "../components/ReceiverCard/ReceiverCard.jsx";
import InstructionModal from "../components/InstructionModal/InstructionModal.jsx"; // IMPORT MODAL
import { InformationCircleIcon } from "@heroicons/react/24/outline"; // IMPORT ICON

const PLACEHOLDER_RECEIVER_IMAGE = "/placeholder_receiver.png";

export default function Receivers() {
  const {
    systemTechnology,
    panelType,
    selectedReceivers,
    updateSelectedReceivers,
    // We might need 'panels.length' if we want to be super explicit in modal text,
    // but the core logic is in PowerSupplyCalc. For the modal, we explain the outcome.
  } = useContext(EntryManagerContext);

  const navigate = useNavigate();

  // --- START: Modal State and Logic ---
  const [showReceiverInstructions, setShowReceiverInstructions] =
    useState(false);
  const receiverInstructionsKey = "seenReceiverPageInstructions_v1"; // Unique key

  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem(receiverInstructionsKey);
    if (!hasSeenInstructions) {
      setShowReceiverInstructions(true);
      localStorage.setItem(receiverInstructionsKey, "true");
    }
  }, []);
  // --- END: Modal State and Logic ---

  const availableReceiversToDisplay = useMemo(() => {
    // ... (your existing logic for availableReceiversToDisplay)
    if (!systemTechnology) return [];
    if (systemTechnology === "4G") return [];

    let compatibleReceivers = [];
    const systemData = metadata[systemTechnology];
    if (!systemData) return [];

    const videoReceivers = systemData.Video?.Receivers || [];
    const audioReceivers = systemData.Audio?.Receivers || [];

    if (panelType === "Video") {
      compatibleReceivers = [...videoReceivers, ...audioReceivers];
    } else if (panelType === "Audio") {
      compatibleReceivers = [...audioReceivers];
    }

    const uniqueProductNumbers = new Set();
    return compatibleReceivers.filter((rec) => {
      if (rec && !uniqueProductNumbers.has(rec["Product Number"])) {
        uniqueProductNumbers.add(rec["Product Number"]);
        return true;
      }
      return false;
    });
  }, [systemTechnology, panelType]);

  const getSelectedQuantity = (productNumber) => {
    /* ... (your existing logic) ... */
    const found = selectedReceivers.find(
      (r) => r["Product Number"] === productNumber
    );
    return found ? found.quantity : 0;
  };

  if (!systemTechnology) {
    // ... (your existing fallback UI if systemTechnology not selected) ...
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Valg av Mottakere
          </h1>
          <p className="text-gray-600 mb-6">
            Vennligst velg systemteknologi på Hjem-siden først.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Gå til Hjem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl relative">
        {" "}
        {/* Added relative for help button */}
        {/* Help Button to re-open modal */}
        <button
          onClick={() => setShowReceiverInstructions(true)}
          title="Vis instruksjoner om strømforsyning"
          className="absolute top-4 right-4 text-blue-600 hover:text-blue-700 p-1 z-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800 sm:text-4xl">
            Steg 4: Velg Svarapparat
          </h1>
          <p className="mt-3 text-md text-gray-600">
            System: <span className="font-semibold">{systemTechnology}</span> -
            Type: <span className="font-semibold">{panelType}</span>
          </p>
        </div>
        {availableReceiversToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 justify-items-center">
            {availableReceiversToDisplay.map((receiver) => {
              // ... (your existing ReceiverCard mapping) ...
              const currentQuantity = getSelectedQuantity(
                receiver["Product Number"]
              );
              const imageSrc =
                IMAGE_MAP[receiver.Image] || PLACEHOLDER_RECEIVER_IMAGE;
              return (
                <ReceiverCard
                  key={receiver["Product Number"]}
                  receiver={receiver}
                  imageSrc={imageSrc}
                  placeholderImage={PLACEHOLDER_RECEIVER_IMAGE}
                  currentQuantity={currentQuantity}
                  onUpdateQuantity={updateSelectedReceivers}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500 py-10">
            {systemTechnology === "4G"
              ? "Ingen mottakere brukes vanligvis med 4G-systemet."
              : "Ingen kompatible mottakere tilgjengelig for valgt system/type."}
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-300">
          {/* ... (your navigation buttons) ... */}
          <button
            onClick={() => navigate("/configure")}
            className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Tilbake til Panelkonfigurasjon
          </button>
          <button
            onClick={() => navigate("/summary")}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Neste: Se Sammendrag
          </button>
        </div>
        <InstructionModal
          isOpen={showReceiverInstructions}
          onClose={() => setShowReceiverInstructions(false)}
          title="Informasjon om Strømforsyning for Svarapparater"
        >
          <p>
            Valg av svarapparater og antall paneler kan påvirke hvilke
            strømforsyninger som automatisk legges til i din bestillingsliste.
            Her er en oversikt for X1-systemet:
          </p>

          <h4 className="font-semibold mt-3">
            Basis Strømforsyning (X1 System):
          </h4>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong>Ved 1 dørpanel:</strong> Systemet inkluderer vanligvis en{" "}
              <code className="text-xs bg-gray-200 p-0.5 rounded">
                VAS/100.30
              </code>{" "}
              strømforsyning.
            </li>
            <li>
              <strong>Ved 2 dørpaneler:</strong> Systemet inkluderer en{" "}
              <code className="text-xs bg-gray-200 p-0.5 rounded">VA/01</code>{" "}
              og en{" "}
              <code className="text-xs bg-gray-200 p-0.5 rounded">
                VAS/100.30
              </code>{" "}
              strømforsyning.
            </li>
            <li>
              <strong>Ved 3 dørpaneler:</strong> Systemet inkluderer en{" "}
              <code className="text-xs bg-gray-200 p-0.5 rounded">VA/01</code>{" "}
              og to{" "}
              <code className="text-xs bg-gray-200 p-0.5 rounded">
                VAS/100.30
              </code>{" "}
              strømforsyninger.
            </li>
          </ul>

          <h4 className="font-semibold mt-3">
            Ekstra Strømforsyning (
            <code className="text-xs bg-gray-200 p-0.5 rounded">VAS/101</code>)
            for Svarapparater (X1 System):
          </h4>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong>For PLX V WIFI svarapparater:</strong>
              <ul className="list-['-_'] list-inside ml-5">
                <li>
                  Hvis systemet ikke har en{" "}
                  <code className="text-xs bg-gray-200 p-0.5 rounded">
                    VA/01
                  </code>{" "}
                  (typisk ved 1 dørpanel), legges det til én{" "}
                  <code className="text-xs bg-gray-200 p-0.5 rounded">
                    VAS/101
                  </code>{" "}
                  per PLX V WIFI-enhet.
                </li>
                <li>
                  Hvis systemet har en{" "}
                  <code className="text-xs bg-gray-200 p-0.5 rounded">
                    VA/01
                  </code>{" "}
                  (ved 2+ dørpaneler), og du har flere enn 14 PLX V
                  WIFI-enheter, legges det til én ekstra{" "}
                  <code className="text-xs bg-gray-200 p-0.5 rounded">
                    VAS/101
                  </code>
                  .
                </li>
              </ul>
            </li>
            <li>
              <strong>For XTS 7 X1 Wifi svarapparater:</strong> Legges til én{" "}
              <code className="text-xs bg-gray-200 p-0.5 rounded">VAS/101</code>{" "}
              per XTS 7 X1 Wifi-enhet.
            </li>
          </ul>
          <p className="mt-3">
            For <strong>IP-systemer</strong>, vil behovet for en POE-switch
            kalkuleres basert på antall paneler og svarapparater.{" "}
            <strong>4G-systemer</strong> trenger vanligvis en{" "}
            <code className="text-xs bg-gray-200 p-0.5 rounded">
              VAS/100.30
            </code>{" "}
            per aktive dørpanel og bruker ikke disse typene svarapparater.
          </p>
          <p className="mt-2 text-xs italic">
            Den endelige listen over nødvendige strømforsyninger vil vises i
            sammendraget.
          </p>
        </InstructionModal>
      </div>
    </div>
  );
}
