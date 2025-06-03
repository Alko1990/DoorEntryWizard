// src/utils/EntryManager.jsx
import React, { createContext, useState, useCallback, useEffect } from "react";
import metadata from "../data/Cleaned_metadata_new.json"; // Ensure this path is correct
import { calculatePowerSuppliesLogic } from "./PowerSupplyCalc.js";
import { calculateAccessoryLogic } from "./AccessoryCalc.js";
// validateModuleAddition is currently inline in your provided file.

export const EntryManagerContext = createContext();

const EntryManager = ({ children }) => {
  // --- State Variables ---
  const [systemTechnology, setSystemTechnology] = useState(null);
  const [panelType, setPanelType] = useState(null);
  const [panels, setPanels] = useState([]);
  const [sameConfig, setSameConfig] = useState(false);
  const [errors, setErrors] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedReceivers, setSelectedReceivers] = useState([]);
  const [calculatedPowerSupplies, setCalculatedPowerSupplies] = useState([]);

  // Global/master setting for installation type
  const [installationBoxType, setInstallationBoxType] = useState("recessed");
  // NEW: Global/master setting for Vandal-Proof
  const [isGlobalVandalProof, setIsGlobalVandalProof] = useState(false);

  // --- Error Handling ---
  const handleError = useCallback((msg) => {
    console.error("Error:", msg);
    setErrors((prevErrors) => [...prevErrors, msg]);
    setTimeout(() => setErrors([]), 3000);
  }, []);

  // --- Core Helper Functions ---
  const getSystemMainModules = useCallback(() => {
    if (!systemTechnology || !panelType) return [];
    try {
      if (systemTechnology === "4G") {
        return metadata["4G"]?.Audio?.Modules || [];
      }
      return metadata[systemTechnology]?.[panelType]?.Modules || [];
    } catch (e) {
      handleError(
        `Error accessing main modules for ${systemTechnology} ${panelType}: ${e.message}`
      );
      return [];
    }
  }, [systemTechnology, panelType, handleError]);

  const getSystemAgnosticPanelModules = useCallback(() => {
    return metadata.SystemAgnostic?.PanelModules_General || [];
  }, []);

  const findModuleByDetails = useCallback(
    (moduleDetails) => {
      if (!moduleDetails || !moduleDetails.id || !moduleDetails.name) {
        handleError("Invalid module details for lookup (findModuleByDetails).");
        return null;
      }
      const { id, name } = moduleDetails;
      const mainModulesList = getSystemMainModules();
      const agnosticModulesList = getSystemAgnosticPanelModules();
      const safeMainModules = Array.isArray(mainModulesList)
        ? mainModulesList
        : [];
      const safeAgnosticModules = Array.isArray(agnosticModulesList)
        ? agnosticModulesList
        : [];
      const allPossiblePanelModules = [
        ...safeMainModules,
        ...safeAgnosticModules,
      ];
      const foundModule = allPossiblePanelModules.find(
        (m) => m && m["Product Number"] === id && m.Name === name
      );
      if (!foundModule) {
        console.warn(
          `Module with PN ${id} and Name "${name}" not found by findModuleByDetails.`
        );
      }
      return foundModule || null;
    },
    [getSystemMainModules, getSystemAgnosticPanelModules, handleError]
  );

  const calculatePanelBudget = useCallback((modules) => {
    // Using the budget calculation logic from your uploaded file
    let budget = 0;
    let cost = 0;
    if (!Array.isArray(modules)) return 0; // Should be 12 if empty, handled by initial state
    if (modules.length === 0) return 12;

    modules.forEach((module) => {
      if (module && module["Budget Contribution"]) {
        budget += module["Budget Contribution"];
      }
      if (module && typeof module.Cost === "number") {
        cost += module.Cost;
      }
    });
    // If no main module with contribution, assume a base (e.g. 12) or this calculation is problematic
    // The logic in your validateModuleAddition ensures a main module is present.
    // A panel's budget state is what's decremented. This function recalculates remaining.
    // If only main module, cost is 0 (main module cost usually implicit in not reducing budget beyond its points)
    const mainModule = modules.find(
      (m) =>
        m &&
        m["Is Required in Panel"] === 1 &&
        typeof m["Budget Contribution"] === "number"
    );
    if (mainModule) {
      return (
        (mainModule["Budget Contribution"] || 12) -
        modules
          .filter((m) => m !== mainModule)
          .reduce((acc, curr) => acc + (curr.Cost || 0), 0)
      );
    }
    return 12 - cost; // Fallback if no main module, just subtract costs from default 12
  }, []);

  // --- Panel Management ---
  const selectSystemAndInitialize = useCallback(
    (selectedSystemTech, selectedPanelT) => {
      setSystemTechnology(selectedSystemTech);
      setPanelType(selectedPanelT);
      setPanels([
        {
          id: 1,
          modules: [],
          budget: 12,
          label: `Panel 1`,
          installationType: "recessed", // ADDED
          isVR: false, // ADDED (using isVR as requested)
        },
      ]);
      setSameConfig(false);
      setSelectedAccessories([]);
      setSelectedReceivers([]);
      setCalculatedPowerSupplies([]);
      setInstallationBoxType("recessed");
      setIsGlobalVandalProof(false); // ADDED: Reset global VR
    },
    []
  );

  const addPanel = useCallback(() => {
    if (!systemTechnology || !panelType) {
      handleError("Please select a system and type first.");
      return;
    }
    if (panels.length < 3) {
      const newPanelId =
        panels.length > 0 ? Math.max(...panels.map((p) => p.id)) + 1 : 1; // Start IDs from 1
      let newPanel;
      if (sameConfig && panels.length > 0) {
        const masterPanel = panels[0];
        newPanel = {
          ...masterPanel,
          modules: [...masterPanel.modules],
          id: newPanelId,
          label: masterPanel.label || `Panel ${newPanelId}`,
          // installationType and isVR are copied via ...masterPanel
        };
      } else {
        newPanel = {
          id: newPanelId,
          modules: [],
          budget: 12,
          label: `Panel ${newPanelId}`,
          installationType: installationBoxType, // Default to global installation type
          isVR: isGlobalVandalProof, // Default to global VR status
        };
      }
      setPanels((prevPanels) => [...prevPanels, newPanel]);
    } else {
      handleError("Maximum of 3 panels allowed");
    }
  }, [
    panels,
    systemTechnology,
    panelType,
    handleError,
    sameConfig,
    installationBoxType,
    isGlobalVandalProof,
  ]); // Added dependencies

  const removePanel = useCallback(() => {
    // ... (removePanel logic remains the same as your file)
    if (panels.length > 1) {
      setPanels((prevPanels) => prevPanels.slice(0, -1));
    } else if (panels.length === 1 && !systemTechnology) {
      setPanels([]);
    } else if (panels.length === 1 && systemTechnology) {
      handleError("Minst ett panel er påkrevd når et system er valgt.");
    } else {
      handleError("Ingen paneler å fjerne.");
    }
  }, [panels, systemTechnology, handleError]);

  const updatePanelLabel = useCallback(
    (panelId, newLabel) => {
      // ... (updatePanelLabel logic remains the same as your file)
      setPanels((prevPanels) => {
        let newPanelsState = prevPanels.map((panel) =>
          panel.id === panelId ? { ...panel, label: newLabel } : panel
        );
        if (
          sameConfig &&
          newPanelsState.length > 0 &&
          panelId === newPanelsState[0].id
        ) {
          const masterLabel = newPanelsState[0].label;
          newPanelsState = newPanelsState.map((p, index) =>
            index === 0 ? p : { ...p, label: masterLabel }
          );
        }
        return newPanelsState;
      });
    },
    [sameConfig]
  );

  // --- Module Management ---
  // validateModuleAddition is kept inline as per your uploaded file
  const validateModuleAddition = useCallback(
    (currentModules, moduleToAdd, panelBudget, isReplacingMain = false) => {
      // ... (Your existing long validation logic from the uploaded file) ...
      if (!moduleToAdd) {
        handleError("Modul som skal legges til er ugyldig (validering).");
        return false;
      }
      const isModuleToAddAMainModule =
        moduleToAdd["Is Required in Panel"] === 1 &&
        typeof moduleToAdd["Budget Contribution"] === "number";
      if (currentModules.length === 0) {
        if (!isModuleToAddAMainModule) {
          handleError("Første modul må være en hovedmodul.");
          return false;
        }
        let es = systemTechnology,
          ec = panelType;
        if (es === "4G" && moduleToAdd.Category === "Audio 4G") {
        } else if (moduleToAdd.System !== es || moduleToAdd.Category !== ec) {
          handleError(
            `Modul "${moduleToAdd.Name}" er ikke gyldig hovedmodul for ${es} ${ec}.`
          );
          return false;
        }
      } else {
        const em = currentModules.find(
          (m) =>
            m &&
            m["Is Required in Panel"] === 1 &&
            typeof m["Budget Contribution"] === "number"
        );
        if (!em && !isModuleToAddAMainModule) {
          handleError("Panelet trenger en hovedmodul.");
          return false;
        }
        if (!isReplacingMain && isModuleToAddAMainModule && em) {
          handleError(
            "Panelet har allerede en hovedmodul. Dra for å erstatte."
          );
          return false;
        }
      }
      const cost = moduleToAdd.Cost || 0;
      let effBudget = panelBudget;
      if (currentModules.length === 0 && isModuleToAddAMainModule)
        effBudget = (moduleToAdd["Budget Contribution"] || 12) - cost;
      else if (isReplacingMain && isModuleToAddAMainModule) {
        const othersCost = currentModules
          .filter(
            (m) =>
              !(
                m["Is Required in Panel"] === 1 &&
                typeof m["Budget Contribution"] === "number"
              )
          )
          .reduce((s, m) => s + (m.Cost || 0), 0);
        effBudget = (moduleToAdd["Budget Contribution"] || 12) - othersCost;
        if (effBudget < cost && cost > 0) {
          handleError(
            `Budsjett overskredet for "${moduleToAdd.Name}" etter erstatning.`
          );
          return false;
        }
      } else if (cost > 0 && effBudget < cost) {
        handleError(`Budsjett overskredet for "${moduleToAdd.Name}".`);
        return false;
      }
      let count = currentModules.filter(
        (m) => m && m.Name === moduleToAdd.Name
      ).length;
      if (isReplacingMain && isModuleToAddAMainModule) count = 0;
      if (
        moduleToAdd["Max per Panel"] &&
        count >= moduleToAdd["Max per Panel"]
      ) {
        handleError(`Maksgrense nådd for "${moduleToAdd.Name}".`);
        return false;
      }
      const excl = (moduleToAdd["Exclusive With"] || "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      if (
        excl.some((en) =>
          currentModules.some((m) => {
            if (!m || m.Name !== en) return false;
            if (
              isReplacingMain &&
              isModuleToAddAMainModule &&
              m["Is Required in Panel"] === 1
            )
              return false;
            return true;
          })
        )
      ) {
        handleError(`"${moduleToAdd.Name}" har eksklusivitetskonflikt.`);
        return false;
      }
      const cemc =
        isReplacingMain &&
        currentModules.find((m) => m && m["Is Required in Panel"] === 1)
          ? currentModules.length - 1
          : currentModules.length;
      if (cemc >= 8 && !isReplacingMain) {
        handleError("Maks 8 moduler per panel.");
        return false;
      }
      return true;
    },
    [handleError, systemTechnology, panelType]
  );

  // MODIFIED: updatePanelModules to sync installationType and isVR
  const updatePanelModules = useCallback(
    (panelId, action, draggedItem = null) => {
      setPanels((prevPanels) => {
        let panelIndexToUpdate = prevPanels.findIndex((p) => p.id === panelId);
        const masterPanelIndex = 0;
        let targetIndexForLogic =
          sameConfig && prevPanels.length > 0
            ? masterPanelIndex
            : panelIndexToUpdate;

        if (targetIndexForLogic === -1 && prevPanels.length > 0) {
          // Only if not sameConfig and panel not found
          handleError(`Panel ID ${panelId} ikke funnet.`);
          return prevPanels;
        } else if (prevPanels.length === 0 && action === "add") {
          // Handle adding to an empty panel list
          handleError(
            "Kan ikke legge til modul, ingen paneler eksisterer. Legg til et panel først."
          );
          return prevPanels;
        } else if (targetIndexForLogic === -1 && prevPanels.length === 0) {
          // General catch for no panels
          return prevPanels;
        }

        const panelToProcess = prevPanels[targetIndexForLogic];
        let updatedModulesForPanel = [...panelToProcess.modules];
        let newBudgetForPanel;

        // ... (rest of your module add/remove logic from your uploaded file, which is quite complex)
        if (action === "add" && draggedItem) {
          const moduleToAdd = findModuleByDetails(draggedItem);
          if (!moduleToAdd) {
            handleError(
              `Moduldata for "${draggedItem.name || draggedItem.id}" ikke funnet (oppdatering).`
            );
            return prevPanels;
          }
          const isAddingMainModule =
            moduleToAdd["Is Required in Panel"] === 1 &&
            typeof moduleToAdd["Budget Contribution"] === "number";
          const existingMainModuleIndex = updatedModulesForPanel.findIndex(
            (m) =>
              m &&
              m["Is Required in Panel"] === 1 &&
              typeof m["Budget Contribution"] === "number"
          );
          const existingMainModule =
            existingMainModuleIndex !== -1
              ? updatedModulesForPanel[existingMainModuleIndex]
              : null;
          if (isAddingMainModule && existingMainModule) {
            const modulesWithoutOldMain = updatedModulesForPanel.filter(
              (_, index) => index !== existingMainModuleIndex
            );
            const costOfOtherModules = modulesWithoutOldMain.reduce(
              (sum, mod) => sum + (mod.Cost || 0),
              0
            );
            const budgetForNewMainValidation =
              (moduleToAdd["Budget Contribution"] || 12) - costOfOtherModules;
            if (
              validateModuleAddition(
                modulesWithoutOldMain,
                moduleToAdd,
                budgetForNewMainValidation,
                true
              )
            ) {
              updatedModulesForPanel = [moduleToAdd, ...modulesWithoutOldMain];
            } else {
              return prevPanels;
            }
          } else {
            if (
              validateModuleAddition(
                updatedModulesForPanel,
                moduleToAdd,
                panelToProcess.budget,
                false
              )
            ) {
              updatedModulesForPanel.push(moduleToAdd);
            } else {
              return prevPanels;
            }
          }
        } else if (action === "remove") {
          if (updatedModulesForPanel.length > 0) {
            updatedModulesForPanel.pop();
          }
          // else { handleError("Panelet er allerede tomt."); }
        }

        newBudgetForPanel = calculatePanelBudget(updatedModulesForPanel);

        let newPanelsState = prevPanels.map((p, index) =>
          index === targetIndexForLogic
            ? {
                ...p,
                modules: updatedModulesForPanel,
                budget: newBudgetForPanel,
              }
            : p
        );

        if (sameConfig && newPanelsState.length > 0) {
          const masterPanelConfig = newPanelsState[masterPanelIndex];
          newPanelsState = newPanelsState.map((p, index) => {
            if (index === masterPanelIndex) return p;
            return {
              ...p,
              modules: [...masterPanelConfig.modules],
              budget: masterPanelConfig.budget,
              label: masterPanelConfig.label,
              installationType: masterPanelConfig.installationType, // Sync installationType
              isVR: masterPanelConfig.isVR, // NEW: Sync isVR
            };
          });
        }
        return newPanelsState;
      });
    },
    [
      findModuleByDetails,
      validateModuleAddition,
      handleError,
      calculatePanelBudget,
      systemTechnology,
      panelType,
      sameConfig,
    ]
  );

  // MODIFIED: toggleSameConfig to sync installationType and isVR
  const toggleSameConfig = useCallback(() => {
    setSameConfig((prevSameConfig) => {
      const nextSameConfig = !prevSameConfig;
      if (nextSameConfig && panels.length > 0) {
        const masterPanel = panels[0];
        setPanels((prevPanelsInToggle) =>
          prevPanelsInToggle.map((p, index) => {
            if (index === 0) return p;
            return {
              ...p,
              modules: [...masterPanel.modules],
              budget: masterPanel.budget,
              label: masterPanel.label,
              installationType: masterPanel.installationType, // Sync installationType
              isVR: masterPanel.isVR, // NEW: Sync isVR
            };
          })
        );
        setInstallationBoxType(masterPanel.installationType); // Sync global installation type
        setIsGlobalVandalProof(masterPanel.isVR); // NEW: Sync global VR status
      }
      return nextSameConfig;
    });
  }, [panels, setInstallationBoxType, setIsGlobalVandalProof]); // Added dependencies

  // --- Receiver Management ---
  const updateSelectedReceivers = useCallback(
    (receiverProductNumber, quantity) => {
      // ... (updateSelectedReceivers logic remains the same as your file) ...
      setSelectedReceivers((prev) => {
        const existingIndex = prev.findIndex(
          (r) => String(r["Product Number"]) === String(receiverProductNumber)
        );
        let receiverData = null;
        try {
          let combinedReceivers = [];
          if (systemTechnology && metadata[systemTechnology]) {
            if (systemTechnology === "4G") {
              /* No receivers for 4G */
            } else if (panelType) {
              const typeReceivers =
                metadata[systemTechnology][panelType]?.Receivers || [];
              const audioReceiversForVideoSystem =
                panelType === "Video" &&
                metadata[systemTechnology].Audio?.Receivers
                  ? metadata[systemTechnology].Audio.Receivers
                  : [];
              combinedReceivers = [
                ...typeReceivers,
                ...audioReceiversForVideoSystem,
              ];
            } else {
              const videoReceivers =
                metadata[systemTechnology].Video?.Receivers || [];
              const audioReceivers =
                metadata[systemTechnology].Audio?.Receivers || [];
              combinedReceivers = [...videoReceivers, ...audioReceivers];
            }
          }

          const uniqueCombinedReceivers = Array.from(
            new Set(
              combinedReceivers
                .filter((r) => r && r["Product Number"] != null)
                .map((r) => r["Product Number"])
            )
          )
            .map((pn) =>
              combinedReceivers.find((r) => r && r["Product Number"] === pn)
            )
            .filter((r) => r);

          receiverData = uniqueCombinedReceivers.find(
            (r) =>
              r && String(r["Product Number"]) === String(receiverProductNumber)
          );
        } catch (e) {
          handleError("Feil ved henting av mottakerdata: " + e.message);
          return prev;
        }

        if (!receiverData && quantity > 0 && systemTechnology !== "4G") {
          handleError(
            `Mottakerdata ikke funnet for PN: ${receiverProductNumber}`
          );
          return prev;
        }

        let updatedReceivers = [...prev];
        if (quantity <= 0) {
          if (existingIndex > -1) {
            updatedReceivers.splice(existingIndex, 1);
          }
        } else {
          if (existingIndex > -1) {
            updatedReceivers[existingIndex] = {
              ...updatedReceivers[existingIndex],
              quantity,
            };
          } else if (receiverData) {
            updatedReceivers.push({ ...receiverData, quantity });
          }
        }
        return updatedReceivers;
      });
    },
    [systemTechnology, panelType, handleError]
  );

  // --- Functions for Per-Panel Settings ---
  const updatePanelSingleInstallationType = useCallback(
    (panelId, newType) => {
      setPanels((prevPanels) => {
        let panelWasUpdated = false;
        const panelToUpdateIndex = prevPanels.findIndex(
          (p) => p.id === panelId
        );
        if (panelToUpdateIndex === -1) return prevPanels;

        let newPanelsState = prevPanels.map((p, index) => {
          if (index === panelToUpdateIndex) {
            if (p.installationType !== newType) {
              panelWasUpdated = true;
              return { ...p, installationType: newType };
            }
          }
          return p;
        });

        if (panelWasUpdated && sameConfig && newPanelsState.length > 0) {
          const actualMasterType = newPanelsState[0].installationType;
          setInstallationBoxType(actualMasterType);
          newPanelsState = newPanelsState.map((p) => ({
            ...p,
            installationType: actualMasterType,
          }));
        }
        return newPanelsState;
      });
    },
    [sameConfig, setInstallationBoxType]
  );

  const updateGlobalInstallationType = useCallback(
    (newType) => {
      setInstallationBoxType(newType);
      if (sameConfig && panels.length > 0) {
        setPanels((prevPanels) =>
          prevPanels.map((p) => ({ ...p, installationType: newType }))
        );
      }
    },
    [panels, sameConfig, setInstallationBoxType]
  );

  // NEW: Function to update a single panel's Vandal-Proof status
  const updatePanelVandalProof = useCallback(
    (panelId, newIsVRStatus) => {
      setPanels((prevPanels) => {
        let panelWasUpdated = false;
        const panelToUpdateIndex = prevPanels.findIndex(
          (p) => p.id === panelId
        );
        if (panelToUpdateIndex === -1) return prevPanels;

        let newPanelsState = prevPanels.map((p, index) => {
          if (index === panelToUpdateIndex) {
            if (p.isVR !== newIsVRStatus) {
              panelWasUpdated = true;
              return { ...p, isVR: newIsVRStatus };
            }
          }
          return p;
        });

        if (panelWasUpdated && sameConfig && newPanelsState.length > 0) {
          const actualMasterVRStatus = newPanelsState[0].isVR;
          setIsGlobalVandalProof(actualMasterVRStatus);
          newPanelsState = newPanelsState.map((p) => ({
            ...p,
            isVR: actualMasterVRStatus,
          }));
        }
        return newPanelsState;
      });
    },
    [sameConfig, setIsGlobalVandalProof]
  );

  // NEW: Function to update the global Vandal-Proof status
  const updateGlobalVandalProof = useCallback(
    (newIsVRStatus) => {
      setIsGlobalVandalProof(newIsVRStatus);
      if (sameConfig && panels.length > 0) {
        setPanels((prevPanels) =>
          prevPanels.map((p) => ({ ...p, isVR: newIsVRStatus }))
        );
      }
    },
    [panels, sameConfig, setIsGlobalVandalProof]
  );

  // --- Accessory Calculation ---
  useEffect(() => {
    // Guard condition using panels.length and ensuring installationBoxType has a value (for master/default)
    if (panels.length === 0) {
      // Removed !installationBoxType here as panels now hold their own types
      setSelectedAccessories([]);
      return;
    }
    const accessoryConfig = {
      panels,
      installationBoxType, // Global type still passed for context (e.g. if sameConfig is true, this is master type)
      systemTechnology,
      panelType,
      selectedReceivers,
      isGlobalVandalProof, // NEW: Pass global VR status for accessory calculation context
      handleError,
    };
    const newAccessories = calculateAccessoryLogic(accessoryConfig); // This function needs to be aware of panel.isVR
    setSelectedAccessories(newAccessories);
  }, [
    panels,
    installationBoxType,
    systemTechnology,
    panelType,
    selectedReceivers,
    handleError,
    isGlobalVandalProof,
  ]); // Added isGlobalVandalProof

  // --- Power Supply Calculation ---
  useEffect(() => {
    if (!systemTechnology || panels.length === 0) {
      setCalculatedPowerSupplies([]);
      return;
    }
    const powerSupplyConfig = {
      panels, // Panels now include isVR and installationType, though power calc might not use them directly
      systemTechnology,
      panelType,
      selectedReceivers,
      handleError,
    };
    const newPowerSupplies = calculatePowerSuppliesLogic(powerSupplyConfig);
    setCalculatedPowerSupplies(newPowerSupplies);
  }, [panels, systemTechnology, panelType, selectedReceivers, handleError]);

  // --- JSON Generation ---
  const generateConfigurationJson = useCallback(() => {
    const products = [];
    panels.forEach((panel) => {
      (panel.modules || []).forEach((module) => {
        if (module && module["Product Number"] != null) {
          let frontPlatePN = module["Front Plate"];
          let frontPlateNameSuffix = "";
          // NEW: Choose VR front plate if panel isVR and VrfrontPlate exists
          if (panel.isVR && module.VrfrontPlate) {
            frontPlatePN = module.VrfrontPlate;
            frontPlateNameSuffix = " (VR)";
          }

          products.push({
            productNumber: module["Product Number"],
            name: module.Name,
            quantity: 1,
          });
          if (frontPlatePN) {
            const frontPlateName = `${module.Name} Frontplate${frontPlateNameSuffix} (for ${panel.label || `Panel ${panel.id}`})`;
            products.push({
              productNumber: frontPlatePN,
              name: frontPlateName,
              quantity: 1,
            });
          }
        }
      });
    });
    (selectedAccessories || []).forEach((acc) => {
      if (
        acc &&
        acc["Product Number"] != null &&
        typeof acc.quantity === "number" &&
        acc.quantity > 0
      ) {
        products.push({
          productNumber: acc["Product Number"],
          name: acc.Name,
          quantity: acc.quantity,
        });
      }
    });
    (selectedReceivers || []).forEach((rec) => {
      if (
        rec &&
        rec["Product Number"] != null &&
        typeof rec.quantity === "number" &&
        rec.quantity > 0
      ) {
        products.push({
          productNumber: rec["Product Number"],
          name: rec.Name,
          quantity: rec.quantity,
        });
      }
    });
    (calculatedPowerSupplies || []).forEach((ps) => {
      if (
        ps &&
        ps["Product Number"] != null &&
        typeof ps.quantity === "number" &&
        ps.quantity > 0
      ) {
        products.push({
          productNumber: ps["Product Number"],
          name: ps.Name,
          quantity: ps.quantity,
        });
      }
    });

    const consolidated = products.reduce((acc, item) => {
      if (item.productNumber === undefined || item.productNumber === null)
        return acc;
      const key =
        item.productNumber === "POE_SWITCH_TBD" ||
        (item.name && item.name.includes("Frontplate (for"))
          ? `${item.productNumber}-${item.name}`
          : String(item.productNumber);

      const existingIndex = acc.findIndex((p) => {
        const pKey =
          p.productNumber === "POE_SWITCH_TBD" ||
          (p.name && p.name.includes("Frontplate (for"))
            ? `${p.productNumber}-${p.name}`
            : String(p.productNumber);
        return pKey === key;
      });

      if (existingIndex > -1) {
        acc[existingIndex].quantity += item.quantity;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    return {
      systemTechnology,
      panelType,
      installationBoxTypeGlobal: installationBoxType,
      isGlobalVandalProof, // NEW: Include global VR status
      numberOfPanels: panels.length,
      isSameConfiguration: sameConfig,
      panelsConfig: panels.map((p) => ({
        id: p.id,
        label: p.label || `Panel ${p.id}`,
        modules: (p.modules || []).map((m) => m?.Name || "Ukjent Modul"),
        budget: p.budget,
        installationType: p.installationType,
        isVR: p.isVR, // NEW: Include per-panel VR status
      })),
      finalProductList: consolidated,
    };
  }, [
    panels,
    selectedAccessories,
    selectedReceivers,
    calculatedPowerSupplies,
    systemTechnology,
    panelType,
    installationBoxType,
    sameConfig,
    isGlobalVandalProof,
  ]); // Added isGlobalVandalProof

  // --- Context Provider Value ---
  const contextValue = {
    systemTechnology,
    panelType,
    selectSystemAndInitialize,
    panels,
    addPanel,
    removePanel,
    updatePanelModules,
    calculatePanelBudget,
    validateModuleAddition, // Your inline version
    sameConfig,
    toggleSameConfig,
    errors,
    handleError,
    selectedAccessories,
    // setSelectedAccessories, // Managed internally
    selectedReceivers,
    updateSelectedReceivers,
    calculatedPowerSupplies,
    // setCalculatedPowerSupplies, // Managed internally
    installationBoxType,
    setInstallationBoxType: updateGlobalInstallationType,
    updatePanelSingleInstallationType,
    isGlobalVandalProof, // NEW: Expose global VR state
    updateGlobalVandalProof, // NEW: Expose function to update global VR
    updatePanelVandalProof, // NEW: Expose function to update per-panel VR
    generateConfigurationJson,
    getSystemMainModules,
    getSystemAgnosticPanelModules,
    updatePanelLabel,
  };

  return (
    <EntryManagerContext.Provider value={contextValue}>
      {children}
    </EntryManagerContext.Provider>
  );
};

export default EntryManager;
