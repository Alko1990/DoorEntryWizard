// src/pages/PanelSelector.jsx
import React, { useContext, useMemo, useState, useEffect } from "react"; // Ensure useEffect is imported
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router-dom";
import ModuleGrid from "../components/ModuleGrid/ModuleGrid.jsx";
import EntryPanel from "../components/EntryPanel/EntryPanel.jsx";
import { EntryManagerContext } from "../utils/EntryManager.jsx";
import metadata from "../data/Cleaned_metadata_new.json";
import { IMAGE_MAP } from "../data/imageMap.js";
import InstructionModal from "../components/InstructionModal/InstructionModal.jsx";
import { InformationCircleIcon } from "@heroicons/react/24/outline"; // IMPORT THE ICON
// Ensure this path is correct and the GIF file exists!
// If you don't have the GIF yet, you can comment out the import and the <img> tag using it for now.
import dragAndDropDemoGif from "../assets/gifs/drag-and-drop-demo.gif";

export default function PanelSelector() {
  const {
    systemTechnology,
    panelType,
    panels,
    sameConfig,
    addPanel,
    removePanel,
    toggleSameConfig,
    updatePanelModules,
    installationBoxType,
    setInstallationBoxType,
    isGlobalVandalProof,
    updateGlobalVandalProof,
    handleError,
  } = useContext(EntryManagerContext);

  const navigate = useNavigate();

  const [showPanelConfigInstructions, setShowPanelConfigInstructions] =
    useState(false);
  const panelConfigInstructionsKey = "seenPanelConfigInstructions_v1";

  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem(
      panelConfigInstructionsKey
    );
    if (!hasSeenInstructions) {
      setShowPanelConfigInstructions(true);
      localStorage.setItem(panelConfigInstructionsKey, "true");
    }
  }, []);

  const availableModulesForGrid = useMemo(() => {
    // ... (Your existing availableModulesForGrid logic - seems okay from your file) ...
    // Make sure it correctly provides 'productNumber' and 'name' for ModuleGrid items
    if (!systemTechnology || !panelType) return [];
    let mainModulesForSystem = [];
    try {
      if (systemTechnology === "4G") {
        mainModulesForSystem = metadata["4G"]?.Audio?.Modules || [];
      } else {
        mainModulesForSystem =
          metadata[systemTechnology]?.[panelType]?.Modules || [];
      }
    } catch (e) {
      console.error(
        "PanelSelector: Error accessing system specific main modules:",
        e
      );
      mainModulesForSystem = [];
    }
    const agnosticPanelModules =
      metadata.SystemAgnostic?.PanelModules_General || [];
    const combinedModules = [...mainModulesForSystem, ...agnosticPanelModules];

    const processedModules = combinedModules
      .filter(
        (module) =>
          module &&
          (module["Is Required in Panel"] === 1 ||
            typeof module.Cost === "number" ||
            module["Budget Contribution"])
      )
      .map((module, index) => {
        if (
          typeof module["Product Number"] === "undefined" ||
          module["Product Number"] === null
        ) {
          console.warn(
            `PanelSelector (availableModulesForGrid): Module "${module.Name || `Unnamed-idx-${index}`}" is missing "Product Number".`,
            module
          );
        }
        if (typeof module.Name === "undefined" || module.Name === null) {
          console.warn(
            `PanelSelector (availableModulesForGrid): Module with PN "${module["Product Number"] || `UnknownPN-idx-${index}`}" is missing "Name".`,
            module
          );
        }
        const imageStringFromMetadata = module.Image;
        const mappedImageSource =
          IMAGE_MAP[imageStringFromMetadata] || IMAGE_MAP["placeholder"];
        return {
          ...module,
          uniqueKeyForGrid: `${module["Product Number"] || `idx-pn-${index}`}-${module.Name || `idx-n-${index}`}-${index}`,
          imageForGrid: mappedImageSource,
          productNumber: module["Product Number"],
          name: module.Name,
          altText: module["Alt Text"] || module.Name,
        };
      });
    return processedModules;
  }, [systemTechnology, panelType]);

  const handleAddModuleByClick = (moduleItem) => {
    // ... (Your existing handleAddModuleByClick logic with console logs - seems okay for data flow) ...
    // console.log("------------------------------------");
    // console.log("PanelSelector: handleAddModuleByClick TRIGGERED");
    if (
      !moduleItem ||
      typeof moduleItem.id === "undefined" ||
      moduleItem.id === null ||
      typeof moduleItem.name === "undefined" ||
      moduleItem.name === null
    ) {
      console.error(
        "PanelSelector: Received MALFORMED moduleItem:",
        JSON.stringify(moduleItem, null, 2)
      );
      if (handleError)
        handleError(
          "Intern feil: Moduldata er ufullstendig fra modulvalg (ID eller Navn mangler)."
        );
      // console.log("------------------------------------");
      return;
    }
    //console.log(
    //  "PanelSelector: Received VALID moduleItem:",
    //  JSON.stringify(moduleItem, null, 2)
    //);
    //console.log(
    // "PanelSelector: panels available?",
    //!!panels,
    //"Length:",
    //panels?.length
    //);
    //console.log(
    // "PanelSelector: updatePanelModules available?",
    //!!updatePanelModules
    //);

    if (!updatePanelModules || !panels) {
      if (handleError) {
        console.error(
          "PanelSelector: Aborting - updatePanelModules or panels missing."
        );
        handleError("Kan ikke legge til modul: Systemfeil (manglende data).");
      }
      //console.log("------------------------------------");
      return;
    }

    if (panels.length > 0) {
      const targetPanelId = panels[0].id;
      // console.log("PanelSelector: Target Panel ID:", targetPanelId);
      // console.log(
      //   "PanelSelector: Calling updatePanelModules with action 'add' and moduleItem:",
      //   JSON.stringify(moduleItem, null, 2)
      // );
      updatePanelModules(targetPanelId, "add", moduleItem);
    } else {
      if (handleError) {
        console.error("PanelSelector: Aborting - No panels to add to.");
        handleError(
          "Vennligst legg til et panel før du kan legge til moduler ved å klikke."
        );
      }
    }
    //  console.log("------------------------------------");
  };

  const handleGoToReceivers = () => {
    /* ... */
    if (systemTechnology === "4G") {
      alert(
        "4G-systemer ringer direkte til et telefonnummer og bruker ikke separate svarapparater. Du blir nå tatt direkte til sammendraget."
      );
      navigate("/summary");
    } else {
      navigate("/receivers");
    }
  };

  const panelsToDisplayInUI =
    sameConfig && panels && panels.length > 0 ? [panels[0]] : panels || [];

  if (!systemTechnology || !panelType) {
    /* ... (return "System Ikke Valgt") ... */
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            System Ikke Valgt
          </h2>
          <p className="text-gray-600">
            Vennligst gå til Hjem-siden for å velge system og type først.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Gå til Hjem
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 relative">
        <button
          onClick={() => setShowPanelConfigInstructions(true)}
          title="Vis instruksjoner for Panelkonfigurasjon"
          className="fixed top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-30"
        >
          {/* Using Heroicon here */}
          <InformationCircleIcon className="h-7 w-7" aria-hidden="true" />
        </button>

        {/* ... (Rest of your PanelSelector JSX: max-w-7xl, grid, columns, etc.) ... */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="md:sticky md:top-8 bg-white p-6 rounded-lg shadow-lg space-y-4 md:col-span-1 md:self-start overflow-y-auto max-h-[calc(100vh-4rem)] flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 text-center">
                Tilgjengelige Moduler
              </h2>
              <div className="text-center">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start på nytt
                </button>
              </div>
              <div className="border border-gray-200 p-3 rounded-md bg-gray-50 shadow-inner flex-grow">
                <ModuleGrid
                  modules={availableModulesForGrid}
                  onModuleClick={handleAddModuleByClick}
                />
              </div>
              <div className="mt-auto pt-4">
                <button
                  onClick={handleGoToReceivers}
                  className="w-full inline-flex justify-center items-center px-6 py-3 text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Neste: Velg svarapparat
                </button>
              </div>
            </div>
            {/* Right Column */}
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 text-center">
                Konfigurer Paneler
              </h2>
              <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-3 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sameConfigCheckbox"
                    checked={sameConfig}
                    onChange={toggleSameConfig}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="sameConfigCheckbox"
                    className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Lik konfigurasjon på alle paneler
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <button
                    onClick={addPanel}
                    disabled={(panels?.length || 0) >= 3}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    + Legg til Panel
                  </button>
                  {(panels?.length || 0) > (systemTechnology ? 1 : 0) && (
                    <button
                      onClick={removePanel}
                      className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      - Fjern Panel
                    </button>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  Antall paneler: {panels?.length || 0}/3
                </p>
              </div>
              {sameConfig && (
                <div className="flex flex-row flex-wrap justify-start items-center gap-x-3 sm:gap-x-4 gap-y-2 pt-2 pb-1 mb-2">
                  <label
                    htmlFor="globalWallMountedCheckbox"
                    className="flex flex-row items-center space-x-1.5 cursor-pointer p-1 rounded hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      id="globalWallMountedCheckbox"
                      name="globalPanelInstallationTypeWallMounted"
                      checked={installationBoxType === "wall-mounted"}
                      onChange={(e) => {
                        if (setInstallationBoxType) {
                          setInstallationBoxType(
                            e.target.checked ? "wall-mounted" : "recessed"
                          );
                        }
                      }}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-600">
                      Utenpåliggende
                    </span>
                  </label>
                  <label
                    htmlFor="globalVandalProofSwitch"
                    className="flex flex-row items-center space-x-1.5 cursor-pointer p-1 rounded hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      id="globalVandalProofSwitch"
                      checked={isGlobalVandalProof || false}
                      onChange={(e) =>
                        updateGlobalVandalProof &&
                        updateGlobalVandalProof(e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-600">
                      Vandalsikker (VR)
                    </span>
                  </label>
                </div>
              )}
              <EntryPanel
                panels={panelsToDisplayInUI}
                updatePanelModules={updatePanelModules}
              />
            </div>
          </div>
        </div>

        <InstructionModal
          isOpen={showPanelConfigInstructions}
          onClose={() => setShowPanelConfigInstructions(false)}
          title="Panelkonfigurasjon - Instruksjoner"
        >
          <p>
            Velkommen til panelkonfiguratoren! Her bygger du dine fysiske
            paneler ved å legge til moduler.
          </p>
          <h4 className="font-semibold mt-3">Legge til moduler:</h4>
          <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
            <li>
              <strong>Dra og slipp:</strong> Finn ønsket modul i listen
              "Tilgjengelige Moduler" til venstre. Klikk og hold på modulen, dra
              den over til et av panelkortene på høyre side, og slipp den i det
              stiplede området.
            </li>
            <li>
              <strong>Klikk for å legge til:</strong> Alternativt kan du klikke
              direkte på en modul i listen. Den vil da bli lagt til i det første
              panelet (eller det eneste panelet hvis "Lik konfigurasjon" er
              aktiv). Hvis du har flere individuelle paneler, er dra-og-slipp
              anbefalt for å velge hvilket panel modulen skal til.
            </li>
          </ul>
          {/* Conditionally render GIF to prevent errors if it's not found during development */}
          {dragAndDropDemoGif ? (
            <div className="my-4 p-2 border rounded-md bg-gray-100 flex justify-center items-center">
              <img
                src={dragAndDropDemoGif}
                alt="Animasjon av dra-og-slipp"
                className="max-w-xs sm:max-w-sm w-full rounded object-contain" // Adjusted max-width
              />
            </div>
          ) : (
            <p className="my-4 p-2 border rounded-md bg-gray-100 text-center text-gray-500 italic">
              (Animasjon for dra-og-slipp lastes...)
            </p>
          )}
          <h4 className="font-semibold mt-3">Paneladministrasjon:</h4>
          <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
            <li>
              <strong>Antall paneler:</strong> Du kan ha opptil 3 paneler. Bruk
              "+ Legg til Panel" og "- Fjern Panel" knappene.
            </li>
            <li>
              <strong>Lik konfigurasjon:</strong> Kryss av her hvis alle paneler
              skal ha identiske moduler og innstillinger. Da konfigurerer du kun
              det første panelet.
            </li>
            <li>
              <strong>Individuelle innstillinger:</strong> Hvis "Lik
              konfigurasjon" ikke er krysset av, kan hvert panel ha unikt navn,
              moduler, installasjonstype (innfelt/utenpå), og vandalsikker (VR)
              status.
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            Du kan klikke på{" "}
            <InformationCircleIcon
              className="h-4 w-4 inline-block align-text-bottom text-blue-600"
              aria-hidden="true"
            />
            -ikonet nederst til høyre på siden for å se disse instruksjonene
            igjen.
          </p>
        </InstructionModal>
      </div>
    </DndProvider>
  );
}
