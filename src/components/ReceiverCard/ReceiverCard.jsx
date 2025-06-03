// src/components/ReceiverCard/ReceiverCard.jsx
import React, { useState, useEffect } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"; // Or choose another icon

export default function ReceiverCard({
  receiver,
  imageSrc,
  placeholderImage,
  currentQuantity,
  onUpdateQuantity,
}) {
  // Destructure ProductURL from receiver; it might be undefined if not in metadata
  const { "Product Number": productNumber, Name: name, ProductURL } = receiver;

  const [inputValue, setInputValue] = useState(currentQuantity.toString());

  useEffect(() => {
    setInputValue(currentQuantity.toString());
  }, [currentQuantity]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputBlur = () => {
    let newQuantity = parseInt(inputValue, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      newQuantity = 0;
    }
    if (newQuantity !== currentQuantity) {
      onUpdateQuantity(productNumber, newQuantity);
    }
  };

  const handleDecrement = () => {
    onUpdateQuantity(productNumber, Math.max(0, currentQuantity - 1));
  };

  const handleIncrement = () => {
    onUpdateQuantity(productNumber, currentQuantity + 1);
  };

  // Determine the link: use ProductURL if present, otherwise fallback (e.g., to a search link or no link)
  let receiverLinkHref = ProductURL; // Directly use the URL from metadata
  const teltecSearchBaseUrl = "https://www.teletec.no/";

  // Fallback if ProductURL is not provided in metadata
  if (!receiverLinkHref && name) {
    // You can choose to have no link, or a search link as a fallback:
    // receiverLinkHref = null; // Option: No link if specific URL isn't provided
    receiverLinkHref = null; // Option: Search link
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col p-3 text-center max-w-[240px] w-full">
      {receiverLinkHref ? (
        <a
          href={receiverLinkHref}
          target="_blank"
          rel="noopener noreferrer"
          title={`Se ${name || "produkt"} på teltec.no`}
        >
          <img
            src={imageSrc || placeholderImage}
            alt={name || "Svarapparat"}
            className="w-36 h-28 sm:w-36 sm:h-28 object-contain mx-auto mb-3 hover:opacity-90 transition-opacity"
          />
        </a>
      ) : (
        <img
          src={imageSrc || placeholderImage}
          alt={name || "Svarapparat"}
          className="w-36 h-28 sm:w-36 sm:h-28 object-contain mx-auto mb-3"
        />
      )}

      <h3 className="text-sm sm:text-md font-semibold text-gray-700 mb-2 min-h-[30px] sm:min-h-[36px] flex-grow flex items-center justify-center">
        {name || "Ukjent Svarapparat"}
      </h3>

      <div className="flex justify-center items-center gap-x-1.5 sm:gap-x-2 mt-auto">
        <button
          onClick={handleDecrement}
          aria-label={`Decrease quantity of ${name}`}
          className="p-1 text-sm sm:text-md font-bold text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-400 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
        >
          -
        </button>
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
