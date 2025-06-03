import React, { useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ModuleGrid from "./components/ModuleGrid/ModuleGrid.jsx"; // Importing the grid of available modules
import EntryPanel from "./components/EntryPanel/EntryPanel.jsx"; // Importing EntryPanel component
import { EntryManagerContext } from "./utils/EntryManager"; // Importing EntryManagerContext for state management
import MODULES from "./data/modules.js"; // Importing module data
import "./index.css"; // Importing styles

function App() {
  const context = useContext(EntryManagerContext);

  if (!context) {
    console.error(
      "EntryManagerContext is undefined. Ensure it is properly set up."
    );
    return <h1>Error: Context is not initialized. Please check the setup.</h1>;
  }

  const {
    panels,
    sameConfig,
    addPanel,
    removePanel,
    toggleSameConfig,
    updatePanelModules,
  } = context;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        {/* Left Section: Displays the grid of available modules */}
        <div className="left-section">
          <h2>Modules</h2>
          <ModuleGrid modules={MODULES} />
        </div>

        {/* Right Section: Displays the entry panels and controls */}
        <div className="right-section">
          <h2>Entry Panels</h2>
          <p className="panel-counter">
            {sameConfig
              ? `Identical Panels: ${panels.length}/3`
              : `Unique Panels: ${panels.length}/3`}
          </p>

          <EntryPanel
            panels={panels}
            updatePanelModules={updatePanelModules} // Pass update function correctly
            sameConfig={sameConfig}
            toggleSameConfig={toggleSameConfig}
            modifyPanels={(action) =>
              action === "add" ? addPanel() : removePanel()
            }
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
