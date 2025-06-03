// src/utils/PowerSupplyCalc.js
import metadata from "../data/Cleaned_metadata_new.json";

// Helper function to find power supply metadata (remains the same)
const findPowerSupplyMeta = (
  productNamePart,
  system = null,
  productNumber = null
) => {
  let foundPS = null;
  const searchName = productNamePart ? productNamePart.toLowerCase() : null;

  const searchList = (list) => {
    if (!list || !Array.isArray(list)) return null;
    return list.find((ps) => {
      const pnMatch = productNumber
        ? ps["Product Number"] === productNumber
        : true;
      const nameMatch =
        searchName && ps.Name
          ? ps.Name.toLowerCase().includes(searchName)
          : true;
      if (productNumber && searchName) return pnMatch && nameMatch;
      if (productNumber) return pnMatch;
      if (searchName) return nameMatch;
      return false;
    });
  };

  if (system && metadata[system] && metadata[system].PowerSupplies) {
    foundPS = searchList(metadata[system].PowerSupplies);
  }
  if (
    !foundPS &&
    metadata.SystemAgnostic &&
    metadata.SystemAgnostic.PowerSupplies
  ) {
    foundPS = searchList(metadata.SystemAgnostic.PowerSupplies);
  }
  return foundPS;
};

export const calculatePowerSuppliesLogic = (config) => {
  const { panels, systemTechnology, selectedReceivers, handleError } = config;

  const newPowerSupplies = [];

  const addPowerSupplyToList = (psItem, quantity = 1) => {
    // ... (remains the same: adds or updates quantity)
    if (!psItem) {
      console.warn("PowerSupplyCalc: Attempted to add null psItem to list");
      return;
    }
    const existing = newPowerSupplies.find(
      (p) => p["Product Number"] === psItem["Product Number"]
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      newPowerSupplies.push({ ...psItem, quantity });
    }
  };

  const anyPanelHasModules = panels.some(
    (panel) => panel.modules && panel.modules.length > 0
  );

  switch (systemTechnology) {
    case "X1": {
      let isVa01AddedToThisConfig = false; // Default to VA/01 not being part of the config

      // --- Logic for Panel-Dependent Power Supplies (VAS/100.30 and VA/01) ---
      // These are only added if panels exist AND at least one panel has modules.
      if (panels.length > 0 && anyPanelHasModules) {
        const vas10030ProductNumber = 116637;
        const va01ProductNumber = 116754;
        const vas10030Info = findPowerSupplyMeta(
          null,
          "SystemAgnostic",
          vas10030ProductNumber
        );
        const va01Info = findPowerSupplyMeta(null, "X1", va01ProductNumber);

        if (panels.length === 1) {
          if (vas10030Info) {
            addPowerSupplyToList(vas10030Info, 1);
            console.log(
              "PowerSupplyCalc: Added 1 VAS/100.30 (1 active panel)."
            );
          } else {
            if (handleError)
              handleError("Power Supply Calc: VAS/100.30 metadata not found.");
          }
        } else if (panels.length === 2) {
          if (va01Info) {
            addPowerSupplyToList(va01Info, 1);
            isVa01AddedToThisConfig = true;
            console.log("PowerSupplyCalc: Added 1 VA/01 (2 active panels).");
          } else {
            if (handleError)
              handleError(
                "Power Supply Calc: VA/01 metadata not found for X1."
              );
          }
          if (vas10030Info) {
            addPowerSupplyToList(vas10030Info, 1);
            console.log(
              "PowerSupplyCalc: Added 1 VAS/100.30 (2 active panels)."
            );
          } else {
            if (handleError)
              handleError("Power Supply Calc: VAS/100.30 metadata not found.");
          }
        } else if (panels.length >= 3) {
          // Covers 3 panels (max in UI)
          if (va01Info) {
            addPowerSupplyToList(va01Info, 1);
            isVa01AddedToThisConfig = true;
            console.log("PowerSupplyCalc: Added 1 VA/01 (3+ active panels).");
          } else {
            if (handleError)
              handleError(
                "Power Supply Calc: VA/01 metadata not found for X1."
              );
          }
          if (vas10030Info) {
            addPowerSupplyToList(vas10030Info, 2);
            console.log(
              "PowerSupplyCalc: Added 2 VAS/100.30 (3+ active panels)."
            );
          } else {
            if (handleError)
              handleError("Power Supply Calc: VAS/100.30 metadata not found.");
          }
        }
      } else {
        // If no panels, or panels are empty, VA/01 is definitely not considered "present" by panel rules.
        isVa01AddedToThisConfig = false; // Explicitly ensure it's false
        console.log(
          "PowerSupplyCalc: No active panels (or no panels at all) for VA/01 or VAS/100.30 consideration for X1."
        );
      }

      // --- Conditional VAS/101 (Receiver-dependent PSU for X1) ---
      // This logic runs if X1 receivers are selected, using the isVa01AddedToThisConfig determined above.
      if (selectedReceivers.length > 0) {
        const vas101ProductNumber = 116776;
        const vas101InfoForReceivers = findPowerSupplyMeta(
          null,
          "SystemAgnostic",
          vas101ProductNumber
        );

        if (!vas101InfoForReceivers) {
          if (handleError)
            handleError(
              "Power Supply Calc: VAS/101 metadata not found for receiver logic."
            );
        } else {
          let vas101QuantityForPlx = 0;
          const plxVWifiProductNumber = 120247;
          const plxVWifiReceivers = selectedReceivers.find(
            (r) => r["Product Number"] === plxVWifiProductNumber
          );
          const numberOfPlxVWifi = plxVWifiReceivers
            ? plxVWifiReceivers.quantity
            : 0;

          if (numberOfPlxVWifi > 0) {
            if (!isVa01AddedToThisConfig) {
              vas101QuantityForPlx = numberOfPlxVWifi;
              console.log(
                `PowerSupplyCalc: PLX V WIFI requires ${vas101QuantityForPlx} VAS/101 (VA/01 not present/active).`
              );
            } else {
              if (numberOfPlxVWifi > 14) {
                vas101QuantityForPlx = 1;
                console.log(
                  `PowerSupplyCalc: PLX V WIFI requires 1 VAS/101 (>14 units with VA/01 present/active). Count: ${numberOfPlxVWifi}`
                );
              }
            }
          }

          let vas101QuantityForXts = 0;
          const xts7X1ProductNumbers = [117751, 118585];
          selectedReceivers.forEach((receiver) => {
            if (
              xts7X1ProductNumbers.includes(receiver["Product Number"]) &&
              receiver.quantity > 0
            ) {
              vas101QuantityForXts += receiver.quantity;
            }
          });

          if (vas101QuantityForXts > 0) {
            console.log(
              `PowerSupplyCalc: XTS 7 X1 Wifi requires ${vas101QuantityForXts} VAS/101.`
            );
          }

          const totalVas101Needed = vas101QuantityForPlx + vas101QuantityForXts;

          if (totalVas101Needed > 0) {
            addPowerSupplyToList(vas101InfoForReceivers, totalVas101Needed);
            console.log(
              `PowerSupplyCalc: Total VAS/101 to add/update for receivers: ${totalVas101Needed}.`
            );
          }
        }
      }
      break;
    }
    case "4G": {
      // For 4G, power supply VAS/100.30 is only needed if there are panels with modules.
      // 4G systems don't have separate receivers needing their own PSUs in this context.
      const vas10030 = findPowerSupplyMeta(null, "SystemAgnostic", 116637);
      if (vas10030) {
        let vas10030Count = 0;
        panels.forEach((panel) => {
          if (panel.modules && panel.modules.length > 0) {
            vas10030Count++; // Add one VAS/100.30 for each panel that has modules
          }
        });
        if (vas10030Count > 0) {
          addPowerSupplyToList(vas10030, vas10030Count);
          console.log(
            `PowerSupplyCalc: Added ${vas10030Count} VAS/100.30 for 4G system (per active panel).`
          );
        } else {
          console.log(
            "PowerSupplyCalc: No active panels for 4G system, skipping VAS/100.30."
          );
        }
      } else {
        if (handleError)
          handleError(
            "Power Supply Calc: VAS/100.30 metadata not found for 4G."
          );
      }
      break;
      // --- END OF MODIFIED 4G LOGIC ---
    }
    case "IP": {
      // POE Switch for IP system depends on total IP devices (panels + receivers).
      // Panels count as IP devices even if they have no modules yet.
      let ipDeviceCount = panels.length; // Each panel itself is an IP device
      selectedReceivers.forEach((receiver) => {
        // Each receiver is an IP device
        ipDeviceCount += receiver.quantity;
      });

      if (ipDeviceCount > 0) {
        newPowerSupplies.push({
          "Product Number": "POE_SWITCH_TBD",
          Name: `Du trenger en POE switch med minst ${ipDeviceCount} PoE-porter`,
          quantity: 1,
          System: "IP",
          Category: "Powersupply",
        });
      }
      break;
    }
    default:
      if (handleError && systemTechnology)
        handleError(
          `Power Supply Calc: Unknown system technology: ${systemTechnology}`
        );
  }
  return newPowerSupplies;
};
