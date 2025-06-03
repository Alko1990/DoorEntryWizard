// src/pages/Home.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EntryManagerContext } from "../utils/EntryManager.jsx";
import SystemTechnologyCard from "../components/SystemTechnologyCard/SystemTechnologyCard.jsx";
import InstructionModal from "../components/InstructionModal/InstructionModal.jsx";
import { InformationCircleIcon } from "@heroicons/react/24/outline"; // Using this icon

const systemTechnologiesData = [
  {
    id: "X1",
    name: "Bus (X1)",
    description: "2-tråds bus basert system, rimelig og enkel installasjon.",
    logoPlaceholder: "X1",
  },
  {
    id: "IP",
    name: "IP360 (IP)",
    description: "IP basert porttelefon, enkel kabling, avanserte funksjoner.",
    logoPlaceholder: "IP",
  },
  {
    id: "4G",
    name: "4G",
    description:
      "En enkel budsjettvennlig løsning, porttelefon som ringer deg på telefonnummer, ingen app.",
    logoPlaceholder: "4G",
  },
];

export default function Home() {
  const { selectSystemAndInitialize } = useContext(EntryManagerContext);
  const navigate = useNavigate();

  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [showHomeInstructions, setShowHomeInstructions] = useState(false);
  const homeInstructionsKey = "seenAppHomeInstructions_v1"; // Use a versioned key

  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem(homeInstructionsKey);
    if (!hasSeenInstructions) {
      setShowHomeInstructions(true);
      localStorage.setItem(homeInstructionsKey, "true");
    }
  }, []);

  const handleTechnologySelect = (technologyId) => {
    setSelectedTechnology(technologyId);
    if (technologyId === "4G") {
      setSelectedType("Audio");
    } else {
      setSelectedType(null);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleConfirmSelection = () => {
    if (selectedTechnology && selectedType) {
      selectSystemAndInitialize(selectedTechnology, selectedType);
      navigate("/configure");
    }
  };

  const availableTypes = {
    X1: ["Video", "Audio"],
    IP: ["Video", "Audio"],
    "4G": ["Audio"],
  };

  const baseButtonClass =
    "px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const activeButtonClass = `${baseButtonClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
  const inactiveButtonClass = `${baseButtonClass} bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-start items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-xl relative">
        <button
          onClick={() => setShowHomeInstructions(true)}
          title="Vis instruksjoner"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-blue-600 hover:text-blue-700 p-1 z-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          {/* Using Heroicon here */}
          <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Velkommen til Teletecs porttelefon kalkulator
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            La oss bygge et porttelefon system! Dette er en WIP, siden er ikke
            ferdig og kan vise feil.
          </p>
        </div>
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Steg 1: Velg systemteknologi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {systemTechnologiesData.map((tech) => (
              <div
                key={tech.id}
                className="flex flex-col rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl bg-white"
              >
                <SystemTechnologyCard
                  id={tech.id}
                  name={tech.name}
                  description={tech.description}
                  logoPlaceholder={tech.logoPlaceholder}
                  isSelected={selectedTechnology === tech.id}
                  onSelect={() => handleTechnologySelect(tech.id)}
                />
                {selectedTechnology === tech.id && tech.id !== "4G" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-700 mb-3 text-center">
                      Velg type for {tech.name}:
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {availableTypes[tech.id]?.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTypeSelect(type)}
                          className={
                            selectedType === type
                              ? activeButtonClass
                              : inactiveButtonClass
                          }
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        {selectedTechnology && (
          <div className="my-6 text-sm text-gray-700 bg-indigo-50 p-4 rounded-md shadow-sm text-center">
            {selectedTechnology && (
              <p>
                Valgt teknologi:{" "}
                <span className="font-semibold text-indigo-700">
                  {systemTechnologiesData.find(
                    (t) => t.id === selectedTechnology
                  )?.name || selectedTechnology}
                </span>
              </p>
            )}
            {selectedType && (
              <p className="mt-1">
                Valgt type:{" "}
                <span className="font-semibold text-indigo-700">
                  {selectedType}
                </span>
              </p>
            )}
            {/* This condition was slightly off in the file you provided, simplified it: */}
            {selectedTechnology === "4G" && (
              <p className="mt-1">
                Valgt type:{" "}
                <span className="font-semibold text-indigo-700">
                  Audio (automatisk for 4G)
                </span>
              </p>
            )}
          </div>
        )}
        {selectedTechnology && selectedType && (
          <div className="mt-6 mb-2 border-t border-gray-200 pt-6">
            <button
              onClick={handleConfirmSelection}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start panel konfigurasjon
            </button>
          </div>
        )}
        <InstructionModal
          isOpen={showHomeInstructions}
          onClose={() => setShowHomeInstructions(false)}
          title="Instruksjoner"
        >
          <p>Velkommen til Teletecs porttelefonkalkulator!</p>
          <h4 className="font-semibold mt-3">Slik kommer du i gang:</h4>
          <ol className="list-decimal list-inside ml-4 space-y-1 mt-1">
            <li>
              <strong>Mobilbrukere:</strong>
              Kalkulatoren fungerer best på større skjermer. På mobil anbefales
              det å bruke konfigurasjonen dersom du skal sette opp ett panel
              eller flere paneler med lik oppbygning. Trykk på ønskede moduler
              for å legge dem til.
            </li>
            <li>
              <strong>Velg Systemteknologi:</strong> Klikk på et av kortene (X1,
              IP, eller 4G) for å velge hovedsystemet. Les beskrivelsen på hvert
              kort for en kort oversikt.
            </li>
            <li>
              <strong>Velg Type (for X1 og IP):</strong> Dersom du valgte X1
              eller IP, vil knapper for "Video" og "Audio" dukke opp under det
              valgte kortet. Klikk på ønsket type. For 4G-systemet er "Audio"
              automatisk forhåndsvalgt.
            </li>
            <li>
              <strong>Bekreft Valg:</strong> Når både teknologi og type er
              valgt, vil en knapp "Start panel konfigurasjon" vises nederst.
              Klikk på denne for å gå til neste steg hvor du bygger selve
              panelene.
            </li>
          </ol>
          <p className="mt-3">
            <strong>Kalkulatorens Begrensninger:</strong> Dette verktøyet er
            designet for å hjelpe med enkle konfigurasjoner. For svært komplekse
            eller spesialtilpassede systemer, vennligst ta kontakt med Teletec
            for ytterligere hjelp.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Du kan klikke på {/* Using Heroicon in the text too */}
            <InformationCircleIcon
              className="h-4 w-4 inline-block align-text-bottom text-blue-600"
              aria-hidden="true"
            />
            -ikonet øverst til høyre i denne boksen for å se disse
            instruksjonene igjen når som helst.
          </p>
        </InstructionModal>
      </div>
    </div>
  );
}
