// src/components/InstructionModal/InstructionModal.jsx
import React from "react";

export default function InstructionModal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Clicking backdrop closes modal
    >
      {/* Modal Panel */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg flex flex-col max-h-[calc(100vh-5rem)]" // Max height for the whole modal, e.g., viewport height minus 5rem (for top/bottom spacing from screen edge)
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it via backdrop click
      >
        {/* Modal Header (Fixed) */}
        <div className="p-5 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Lukk instruksjoner"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable Content Area) */}
        <div className="p-5 sm:p-6 text-sm text-gray-700 space-y-3 prose max-w-none overflow-y-auto flex-grow">
          {/* `prose` class from Tailwind Typography can be helpful. Remove if not using. */}
          {/* `max-w-none` is to ensure prose doesn't overly restrict width within the modal. */}
          {children}
        </div>

        {/* Modal Footer (Fixed) */}
        <div className="p-5 sm:p-6 border-t border-gray-200 text-right flex-shrink-0 flex justify-center">
          <button
            onClick={onClose}
            className="block mx-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Jeg forstår
          </button>
        </div>
      </div>
    </div>
  );
}
