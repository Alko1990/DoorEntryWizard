// src/components/ReceiverCard/ReceiverCard.jsx
import React, { useState, useEffect } from "react"; // Added useState and useEffect

export default function ReceiverCard({
  receiver,
  imageSrc,
  placeholderImage,
  currentQuantity,
  onUpdateQuantity,
}) {
  const { "Product Number": productNumber, Name: name, ProductURL } = receiver;

  // State to manage the input field's value locally
  const [inputValue, setInputValue] = useState(currentQuantity.toString());

  // Update local state if currentQuantity prop changes from parent
  useEffect(() => {
    setInputValue(currentQuantity.toString());
  }, [currentQuantity]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    let newQuantity = parseInt(inputValue, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      newQuantity = 0; // Default to 0 if input is invalid or negative
    }
    // Only call onUpdateQuantity if the value has actually changed
    if (newQuantity !== currentQuantity) {
      onUpdateQuantity(productNumber, newQuantity);
    }
    // It's often good practice to reset the inputValue to what was committed,
    // or to the original currentQuantity if the input was invalid.
    // For simplicity here, we'll let useEffect handle resyncing if newQuantity matches currentQuantity after update,
    // or if it was an invalid entry that resulted in newQuantity being 0 (and if currentQuantity was already 0).
    // If newQuantity is different and valid, onUpdateQuantity will trigger a prop change, and useEffect will update inputValue.
  };

  const handleDecrement = () => {
    onUpdateQuantity(productNumber, Math.max(0, currentQuantity - 1));
  };

  const handleIncrement = () => {
    onUpdateQuantity(productNumber, currentQuantity + 1);
  };

  return (
    // Card container - Reduced padding from p-4 to p-2 or p-3 for compactness
    <div className="bg-sky-100 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col p-2 text-center max-w-[240px] w-full">
      {" "}
      {/* MODIFIED: p-4 to p-3 */}
      {/* Receiver Image - Reduced size and margin */}
      <img
        src={imageSrc || placeholderImage}
        alt={name}
        className="w-36 h-28 sm:w-36 sm:h-28 object-contain mx-auto mb-3" // MODIFIED: w-28 h-28 to w-20 h-20 (or sm:w-24 sm:h-24), mb-3 to mb-2
      />
      {/* Receiver Name - Reduced text size and margin, adjusted min-height */}
      <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 min-h-[30px] sm:min-h-[36px] flex-grow flex items-center justify-center">
        {" "}
        {/* MODIFIED: text-md to text-sm/sm:text-md, mb-3 to mb-2, min-h adjusted */}
        {name}
      </h3>
      {/* Quantity Controls - Adjusted spacing, button/input sizes */}
      <div className="flex justify-center items-center gap-x-1.5 sm:gap-x-2 mt-auto">
        {" "}
        {/* MODIFIED: gap-x-3 to gap-x-1.5 or sm:gap-x-2 */}
        <button
          onClick={handleDecrement}
          aria-label={`Decrease quantity of ${name}`}
          // MODIFIED: Reduced padding, text size, and overall size (w-7 h-7 or sm:w-8 sm:h-8)
          className="p-1 text-sm sm:text-md font-bold text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-400 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
        >
          -
        </button>
        {/* REPLACED span with input */}
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-10 sm:w-12 text-center text-sm sm:text-md font-medium text-gray-700 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          aria-label={`Quantity for ${name}`}
        />
        <button
          onClick={handleIncrement}
          aria-label={`Increase quantity of ${name}`}
          className="p-1 text-sm sm:text-md font-bold text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-400 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}
