// src/components/EntryPanel/EntryPanel.jsx
import React, { useContext } from "react";
import { useDrop } from "react-dnd";
import "./EntryPanel.css"; // Ensure this is imported
import { IMAGE_MAP } from "../../data/imageMap.js";
import { EntryManagerContext } from "../../utils/EntryManager.jsx";
import PanelFrame from "../PanelFrame/PanelFrame.jsx";

// PanelDropTarget internal component
function PanelDropTarget({ panelId, updatePanelModules, children, gridStyle }) {
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: "MODULE",
    drop: (item) => {
      if (updatePanelModules) {
        updatePanelModules(panelId, "add", item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  });

  let currentDropTargetClasses = "border-gray-300 bg-gray-50"; // Normal state
  if (isOver && canDrop) {
    currentDropTargetClasses =
      "border-blue-400 bg-blue-50 ring-2 ring-blue-300";
  } else if (isOver && !canDrop) {
    currentDropTargetClasses = "border-red-400 bg-red-50";
  }

  return (
    <div
      ref={dropRef}
      className={`panel-grid border rounded-md transition-colors duration-150 ease-in-out ${currentDropTargetClasses}`}
      style={{
        ...gridStyle, // From calculateGridStyle (controls columns, gap, width, margin)
        minHeight: "80px", // Enough for one 80px module + 2px padding/gap from .panel-grid CSS
      }}
    >
      {children}
    </div>
  );
}

export default function EntryPanel({ panels, updatePanelModules }) {
  const {
    updatePanelLabel,
    updatePanelSingleInstallationType,
    updatePanelVandalProof,
    sameConfig,
  } = useContext(EntryManagerContext);

  const renderPanelModules = (modulesInPanel, panelId) => {
    if (!modulesInPanel || modulesInPanel.length === 0) {
      return (
        <div className="panel-cell empty flex flex-col items-center justify-center text-center text-xs p-1">
          Legg til hovedmodul her
        </div>
      );
    }
    return modulesInPanel.map((module, index) => {
      const currentPanel = panels.find((p) => p.id === panelId);
      let imageKey = module?.Image;
      if (currentPanel?.isVR && module?.Vrimage) {
        imageKey = module.Vrimage;
      }
      const moduleImageSrc = imageKey ? IMAGE_MAP[imageKey] : null;

      return (
        <div
          key={
            module?.["Product Number"]
              ? `${module["Product Number"]}-${module.Name}-${index}`
              : `module-${panelId}-${index}`
          }
          // Inline styles for width and height REMOVED. Size comes from .panel-cell in CSS.
          className="panel-cell"
        >
          {moduleImageSrc ? (
            <img
              src={moduleImageSrc}
              alt={module.Name || "Modul"}
              // Img styling (max-width/height) is in EntryPanel.css
            />
          ) : (
            <span className="text-xs text-gray-700 p-1 break-words text-center">
              {module.Name || "Ukjent Modul"}
            </span>
          )}
        </div>
      );
    });
  };

  const calculateGridStyle = (moduleCount) => {
    const moduleCellSize = 80;
    const gapSize = 4;

    let columnCount;
    let gridTemplateColumnsString;

    if (moduleCount === 0) {
      gridTemplateColumnsString = `repeat(1, minmax(${moduleCellSize}px, auto))`;
      columnCount = 1;
    } else if (moduleCount >= 1 && moduleCount <= 4) {
      gridTemplateColumnsString = `repeat(1, ${moduleCellSize}px)`;
      columnCount = 1;
    } else {
      // 5+ modules
      gridTemplateColumnsString = `repeat(2, ${moduleCellSize}px)`;
      columnCount = 2;
    }

    const gridWidth =
      moduleCellSize * columnCount + gapSize * Math.max(0, columnCount - 1);

    return {
      display: "grid",
      gridTemplateColumns: gridTemplateColumnsString,
      gap: `${gapSize}px`,
      justifyContent: "center",
      alignItems: "center",
      width: `${gridWidth}px`,
      margin: "0 auto",
    };
  };

  const handleLabelChange = (panelId, newLabel) => {
    if (updatePanelLabel) updatePanelLabel(panelId, newLabel);
  };

  const handleInstallationTypeChange = (panelId, newType) => {
    if (updatePanelSingleInstallationType)
      updatePanelSingleInstallationType(panelId, newType);
  };

  const handleVandalProofChange = (panelId, newIsVRStatus) => {
    if (updatePanelVandalProof) updatePanelVandalProof(panelId, newIsVRStatus);
  };

  return (
    <div className="entry-panels-overall-container flex flex-row flex-wrap justify-center gap-2 py-2">
      {" "}
      {/* Using gap-2 as per last discussion for spacing between panels */}
      {panels.map((panel) => (
        <div key={panel.id} className="entry-panel">
          <input
            type="text"
            value={panel.label || ""}
            onChange={(e) => handleLabelChange(panel.id, e.target.value)}
            placeholder={`Navn på panel`}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-center font-medium mb-2"
          />

          {!sameConfig && panels.length > 0 && (
            <div className="w-full grid grid-cols-2 gap-x-2 border-t border-gray-200 pt-2 mb-2">
              {/* Installation Type Radios */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 text-center">
                  Installasjon:
                </p>
                <div className="flex justify-around items-center text-xs">
                  <label className="flex items-center space-x-1 cursor-pointer p-1 hover:bg-gray-100 rounded">
                    <input
                      type="radio"
                      name={`panel-${panel.id}-installationType`}
                      value="recessed"
                      checked={panel.installationType === "recessed"}
                      onChange={() =>
                        handleInstallationTypeChange(panel.id, "recessed")
                      }
                      className="focus:ring-blue-400 h-3 w-3 text-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">Innfelt</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer p-1 hover:bg-gray-100 rounded">
                    <input
                      type="radio"
                      name={`panel-${panel.id}-installationType`}
                      value="wall-mounted"
                      checked={panel.installationType === "wall-mounted"}
                      onChange={() =>
                        handleInstallationTypeChange(panel.id, "wall-mounted")
                      }
                      className="focus:ring-blue-400 h-3 w-3 text-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">Utenpå</span>
                  </label>
                </div>
              </div>
              {/* VR Checkbox */}
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-gray-600 text-center mb-1">
                  Sikkerhet:
                </p>
                <label
                  htmlFor={`panel-${panel.id}-vandalProof`}
                  className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-100 rounded text-xs"
                >
                  <input
                    type="checkbox"
                    id={`panel-${panel.id}-vandalProof`}
                    checked={panel.isVR || false}
                    onChange={(e) =>
                      handleVandalProofChange(panel.id, e.target.checked)
                    }
                    className="focus:ring-blue-400 h-4 w-4 text-blue-500 border-gray-300 rounded"
                  />
                  <span className="font-medium text-gray-700">
                    Vandalsikker (VR)
                  </span>
                </label>
              </div>
            </div>
          )}

          <PanelDropTarget
            panelId={panel.id}
            updatePanelModules={updatePanelModules}
            gridStyle={calculateGridStyle(panel.modules.length)}
          >
            {renderPanelModules(panel.modules, panel.id)}
          </PanelDropTarget>

          <div className="panel-controls w-full pt-2">
            <button
              onClick={() =>
                updatePanelModules && updatePanelModules(panel.id, "remove")
              }
              disabled={panel.modules.length === 0}
              className="w-full px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              - Fjern siste modul
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
