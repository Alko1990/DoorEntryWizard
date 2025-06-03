// src/components/ModuleGrid/ModuleGrid.jsx
import React from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import "./ModuleGrid.css"; // Import styles

// Added onModuleClick to props
function ModuleGrid({ modules = [], onModuleClick }) {
  const renderModule = (module, index) => {
    const moduleName = module.name || `Unnamed Module ${index}`;
    const moduleProductNumber =
      module.productNumber || module["Product Number"] || index;
    const moduleAltText = module.altText || module.Name || "Module Image";
    const moduleImageSrc = module.imageForGrid || "placeholder.jpg";
    const hoverText = module.altText || module.Name || "Module details";

    const [{ isDragging }, drag] = useDrag(() => ({
      type: "MODULE",
      item: {
        id: moduleProductNumber, // This is the Product Number
        name: moduleName, // This is the Name
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    // NEW: onClick handler for the image
    const handleClick = () => {
      if (onModuleClick) {
        onModuleClick({
          id: moduleProductNumber, // Pass Product Number as 'id'
          name: moduleName, // Pass Name as 'name'
        });
      }
    };

    return (
      <img
        ref={drag}
        key={module.uniqueKeyForGrid || index}
        src={moduleImageSrc}
        alt={moduleAltText}
        className="module-image"
        // NEW: Added cursor style if clickable, and onClick handler
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: onModuleClick ? "pointer" : "grab",
        }}
        aria-label={moduleName}
        title={hoverText}
        onClick={handleClick} // NEW: Attach the click handler
      />
    );
  };

  return (
    <div className="module-grid">
      {modules.length > 0 ? (
        modules.map((module, index) => renderModule(module, index))
      ) : (
        <p>No modules available for the selected system/type.</p>
      )}
    </div>
  );
}

ModuleGrid.propTypes = {
  modules: PropTypes.arrayOf(
    PropTypes.shape({
      uniqueKeyForGrid: PropTypes.string,
      productNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      imageForGrid: PropTypes.any,
      altText: PropTypes.string,
      Name: PropTypes.string,
      "Product Number": PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      "Alt Text": PropTypes.string,
    })
  ),
  onModuleClick: PropTypes.func, // NEW: PropTypes for the click handler
};

export default ModuleGrid;
