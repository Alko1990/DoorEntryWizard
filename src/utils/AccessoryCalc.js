// src/utils/AccessoryCalc.js
import metadata from "../data/Cleaned_metadata_new.json";

// getAccessoryByNameAndCapacity is used for standard lookup for frames and boxes
const getAccessoryByNameAndCapacity = (
  nameIncludes, // Expecting Norwegian search term, e.g., "ramme" or "boks"
  capacity,
  accessoryList,
  type = null // For installation_type of boxes (e.g., "recessed", "wall-mounted")
) => {
  if (!accessoryList || !Array.isArray(accessoryList)) {
    // console.warn("AccessoryCalc: getAccessoryByNameAndCapacity called with invalid accessoryList.");
    return null;
  }
  return accessoryList.find(
    (acc) =>
      acc && // Ensure acc object exists
      acc.Name &&
      acc.Name.toLowerCase().includes(nameIncludes.toLowerCase()) &&
      acc.module_capacity === capacity &&
      // For boxes, type must match; for frames, type is null and this part is true
      (type ? acc.installation_type === type : true)
  );
};

export const calculateAccessoryLogic = (config) => {
  const {
    panels,
    systemTechnology,
    panelType,
    selectedReceivers,
    handleError,
  } = config;

  const newAccessoriesList = [];

  const addAccessoryToList = (accItem, quantity = 1) => {
    if (!accItem || typeof accItem["Product Number"] === "undefined") {
      // Added check for Product Number
      console.warn(
        "AccessoryCalc: Attempted to add invalid accItem (missing Product Number):",
        accItem
      );
      return;
    }
    // VR versions will have a different Product Number (from standardFrame.Vr)
    // or a modified Name. The key for uniqueness should primarily be Product Number.
    // If VR items are just standard items with a modified name but same PN, this might need adjustment.
    // Assuming standardFrame.Vr provides a unique PN for VR frames.
    const existing = newAccessoriesList.find(
      (a) => a["Product Number"] === accItem["Product Number"]
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      newAccessoriesList.push({ ...accItem, quantity });
    }
  };

  const allMetaSystemAgnosticAccessories =
    metadata.SystemAgnostic?.Accessories || [];

  // --- Calculate Frames and Boxes for each panel ---
  panels.forEach((panel) => {
    const moduleCount = panel.modules.length;
    if (moduleCount === 0) return; // Skip panels with no modules

    // Determine the capacities of frames/boxes needed for the current module count
    const capacitiesToUse = [];
    if (moduleCount > 0 && moduleCount <= 4) {
      capacitiesToUse.push(moduleCount);
    } else if (moduleCount === 5) {
      capacitiesToUse.push(2, 3); // Common split, or (1,4) as you had. Changed to 2,3 as an example. Adjust if needed.
    } else if (moduleCount === 6) {
      capacitiesToUse.push(3, 3);
    } else if (moduleCount === 7) {
      capacitiesToUse.push(3, 4);
    } else if (moduleCount === 8) {
      capacitiesToUse.push(4, 4);
    } else if (moduleCount > 8) {
      // Handle counts greater than 8 by using multiple 4-module accessories
      if (handleError) {
        // Log error for unsupported count but try to provide a solution
        handleError(
          `Accessory Calculation: Module count ${moduleCount} for panel ${panel.id} exceeds 8. Using multiple 4-module accessories.`
        );
      }
      let remainingCapacity = moduleCount;
      while (remainingCapacity > 0) {
        if (remainingCapacity >= 4) {
          capacitiesToUse.push(4);
          remainingCapacity -= 4;
        } else if (remainingCapacity > 0) {
          capacitiesToUse.push(remainingCapacity);
          remainingCapacity = 0;
        }
      }
    }
    // Note: If moduleCount is 0, capacitiesToUse remains empty, and the loop below is skipped.

    capacitiesToUse.forEach((capacity) => {
      if (capacity === 0) return; // Should not happen if moduleCount > 0

      // --- Frame Selection (Standard and VR) ---
      // Using Norwegian "ramme" to search, as per previous discussion
      const standardFrame = getAccessoryByNameAndCapacity(
        "ramme", // Search term for frame in Norwegian
        capacity,
        allMetaSystemAgnosticAccessories
      );

      if (standardFrame) {
        if (panel.isVR && standardFrame.Vr) {
          // Check if panel isVR and standard frame has a Vr Product Number
          const vrFrameProductNumber = standardFrame.Vr;
          // Try to find a more specific VR frame entry if it exists, otherwise augment standard frame name
          let vrFrameMeta = allMetaSystemAgnosticAccessories.find(
            (acc) => acc["Product Number"] === vrFrameProductNumber
          );

          if (vrFrameMeta) {
            // If a dedicated VR frame entry is found by PN, use its details
            addAccessoryToList(vrFrameMeta);
          } else {
            // If no dedicated VR frame entry, create one based on the standard frame
            const vrFrameObject = {
              ...standardFrame,
              "Product Number": vrFrameProductNumber,
              Name: `${standardFrame.Name} (VR)`, // Modify the name to indicate VR
            };
            addAccessoryToList(vrFrameObject);
          }
        } else {
          addAccessoryToList(standardFrame);
        }
      } else {
        if (handleError)
          handleError(
            `Accessory Calc: Standard ramme for ${capacity} moduler ikke funnet for panel ${panel.id}.`
          );
      }

      // --- Box Selection (Uses panel.installationType) ---
      // Using Norwegian "boks" to search
      const box = getAccessoryByNameAndCapacity(
        "boks", // Search term for box in Norwegian
        capacity,
        allMetaSystemAgnosticAccessories,
        panel.installationType // e.g., "recessed" or "wall-mounted"
      );

      if (box) {
        addAccessoryToList(box);
      } else {
        if (handleError) {
          const installationTypeDisplay = panel.installationType
            ? panel.installationType
            : "ukjent type";
          handleError(
            `Accessory Calc: ${installationTypeDisplay} boks for ${capacity} moduler ikke funnet for panel ${panel.id}.`
          );
        }
      }
    });
  });

  // --- Calculate XDV/304 Video Splitter ---
  const totalReceiverCount = selectedReceivers.reduce((sum, receiver) => {
    const quantity =
      typeof receiver.quantity === "number" ? receiver.quantity : 0;
    return sum + quantity;
  }, 0);

  if (
    systemTechnology === "X1" &&
    panelType === "Video" && // Make sure panelType is correctly passed and available
    totalReceiverCount > 2
  ) {
    // Using a more specific lookup for XDV/304 if its name is exact or using its PN
    const xdv304Meta = metadata.X1?.Accessories?.find(
      (acc) => acc["Product Number"] === 116648 // PN for XDV/304
    );
    if (xdv304Meta) {
      // Example: 1 XDV/304 supports up to 4 outputs.
      // If one output goes to the next XDV/304 (daisy-chaining), then 1 XDV/304 adds 3 usable outputs.
      // This logic can be complex depending on exact wiring rules.
      // Simplified: Add one XDV/304 if condition met, or based on a simple division.
      // The existing Math.ceil(totalReceiverCount / 20) seems like a placeholder or specific rule.
      // Let's assume it's 1 XDV/304 needed if totalReceiverCount > 2 for now,
      // unless the /20 rule is specific and correct.
      // For simplicity, if any XDV/304 is needed, add one. If more needed, quantity should be calculated.
      // Your existing Math.ceil(totalReceiverCount / 20) might be specific. Keeping it.
      const quantityNeeded = Math.ceil(totalReceiverCount / 20);
      if (quantityNeeded > 0) {
        // Ensure quantity is positive
        addAccessoryToList(xdv304Meta, quantityNeeded);
      }
    } else {
      if (handleError)
        handleError("Accessory Calc: XDV/304 metadata not found.");
    }
  }

  return newAccessoriesList;
};
