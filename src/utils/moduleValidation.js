// src/utils/moduleValidation.js

// This function encapsulates the exact validation logic previously in EntryManager.jsx
export const validateModuleAdditionLogic = (config) => {
  const {
    currentModules,
    moduleToAdd,
    panelBudget,
    isReplacingMain = false, // Default provided for safety, though it should always be passed
    systemTechnology, // Passed from EntryManager's state
    panelType, // Passed from EntryManager's state
    handleErrorCallback, // This is the handleError function from EntryManager
  } = config;

  // --- Start of copied logic from your EntryManager.jsx's validateModuleAddition ---
  if (!moduleToAdd) {
    handleErrorCallback("Modul som skal legges til er ugyldig (validering)."); // Use handleErrorCallback
    return false;
  }
  const isModuleToAddAMainModule =
    moduleToAdd["Is Required in Panel"] === 1 &&
    typeof moduleToAdd["Budget Contribution"] === "number";

  if (currentModules.length === 0) {
    if (!isModuleToAddAMainModule) {
      handleErrorCallback("Første modul må være en hovedmodul."); // Use handleErrorCallback
      return false;
    }
    // Use systemTechnology & panelType from config
    let es = systemTechnology;
    let ec = panelType;
    if (es === "4G" && moduleToAdd.Category === "Audio 4G") {
      // This condition seems fine as is
    } else if (moduleToAdd.System !== es || moduleToAdd.Category !== ec) {
      handleErrorCallback(
        // Use handleErrorCallback
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
      handleErrorCallback("Panelet trenger en hovedmodul."); // Use handleErrorCallback
      return false;
    }
    if (!isReplacingMain && isModuleToAddAMainModule && em) {
      handleErrorCallback(
        // Use handleErrorCallback
        "Panelet har allerede en hovedmodul. Dra for å erstatte."
      );
      return false;
    }
  }

  const cost = moduleToAdd.Cost || 0;
  let effBudget = panelBudget;

  if (currentModules.length === 0 && isModuleToAddAMainModule) {
    effBudget = (moduleToAdd["Budget Contribution"] || 12) - cost;
  } else if (isReplacingMain && isModuleToAddAMainModule) {
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
      // This condition 'cost > 0' might be redundant if effBudget < cost already implies cost impact
      handleErrorCallback(
        // Use handleErrorCallback
        `Budsjett overskredet for "${moduleToAdd.Name}" etter erstatning.`
      );
      return false;
    }
  } else if (cost > 0 && effBudget < cost) {
    handleErrorCallback(`Budsjett overskredet for "${moduleToAdd.Name}".`); // Use handleErrorCallback
    return false;
  }

  let count = currentModules.filter(
    (m) => m && m.Name === moduleToAdd.Name
  ).length;
  if (isReplacingMain && isModuleToAddAMainModule) {
    // If replacing main, count for the new module should be 0 initially
    count = 0;
  }

  if (moduleToAdd["Max per Panel"] && count >= moduleToAdd["Max per Panel"]) {
    handleErrorCallback(`Maksgrense nådd for "${moduleToAdd.Name}".`); // Use handleErrorCallback
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
        // If we are replacing a main module, don't consider it for exclusivity against the new main module
        if (
          isReplacingMain &&
          isModuleToAddAMainModule && // new module is main
          m["Is Required in Panel"] === 1 // current iterated module is main
        ) {
          return false;
        }
        return true;
      })
    )
  ) {
    handleErrorCallback(`"${moduleToAdd.Name}" har eksklusivitetskonflikt.`); // Use handleErrorCallback
    return false;
  }

  // Calculate effective module count if replacing main module
  const currentEffectiveModuleCount =
    isReplacingMain &&
    currentModules.find((m) => m && m["Is Required in Panel"] === 1)
      ? currentModules.length - 1
      : currentModules.length;

  if (currentEffectiveModuleCount >= 8 && !isReplacingMain) {
    // Max 8 modules unless replacing
    handleErrorCallback("Maks 8 moduler per panel."); // Use handleErrorCallback
    return false;
  }
  return true;
};
