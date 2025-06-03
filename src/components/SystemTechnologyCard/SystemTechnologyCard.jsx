// src/components/SystemTechnologyCard/SystemTechnologyCard.jsx
import React from "react";

export default function SystemTechnologyCard({
  id,
  name,
  description,
  logoPlaceholder,
  isSelected,
  onSelect,
}) {
  // Base classes applied to all cards for structure, padding, initial shadow, transitions, and cursor
  const baseCardClasses =
    "rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center text-center h-full";

  // Classes for the normal (unselected) state
  // Includes default border and background
  const normalStateClasses = "border border-gray-300 bg-white";

  // Classes for the selected state - provides a more prominent visual distinction
  // Includes a thicker colored border, a background tint, a stronger shadow, and a slight scale effect
  const selectedStateClasses =
    "border-2 border-blue-500 bg-blue-100 shadow-xl transform scale-105"; // Adjusted to bg-blue-100 for a slightly stronger tint

  return (
    <div
      className={`${baseCardClasses} ${isSelected ? selectedStateClasses : normalStateClasses}`}
      onClick={() => onSelect(id)}
      aria-pressed={isSelected} // Good for accessibility, indicates the button-like component is pressed
      role="button" // Indicates the div is acting as a button
      tabIndex={0} // Makes the div focusable, allowing keyboard interaction
      onKeyPress={(e) => {
        // Adds keyboard accessibility: allows selection with Enter or Space bar
        if (e.key === "Enter" || e.key === " ") {
          onSelect(id);
        }
      }}
    >
      {/* Logo Placeholder */}
      <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl">
        {logoPlaceholder}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
      <p className="text-sm text-gray-600 flex-grow">{description}</p>
      {/* The "Selected" text div that was previously here:
          {isSelected && (
            <div className="mt-4 text-xs text-blue-600 font-semibold">Selected</div>
          )}
          is now removed, as the visual styling of the card itself indicates selection.
      */}
    </div>
  );
}
