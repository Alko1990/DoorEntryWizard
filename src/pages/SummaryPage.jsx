// src/pages/SummaryPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EntryManagerContext } from "../utils/EntryManager.jsx";

// --- START: Configuration for "Request a Quote" ---
const QUOTE_RECIPIENT_EMAIL = "almir@teletec.no"; // <<<< REPLACE with your actual sales/quote email address
const QUOTE_SUBJECT = "Forespørsel om tilbud - Porttelefonkonfigurasjon";
// --- END: Configuration ---

export default function SummaryPage() {
  const {
    generateConfigurationJson,
    systemTechnology, // Used in useEffect to redirect if not set
  } = useContext(EntryManagerContext);

  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!systemTechnology) {
      navigate("/");
      return;
    }
    if (generateConfigurationJson) {
      try {
        const data = generateConfigurationJson();
        setSummaryData(data);
        setError("");
      } catch (e) {
        console.error("Error generating summary data:", e);
        setError("Kunne ikke generere sammendrag. Prøv å starte på nytt.");
        setSummaryData(null);
      }
    } else {
      setError("Konfigurasjonsfunksjon er ikke tilgjengelig.");
      setSummaryData(null);
    }
  }, [generateConfigurationJson, systemTechnology, navigate]);

  const handleStartOver = () => {
    navigate("/");
  };

  const generateTableTextForCopy = () => {
    if (
      !summaryData ||
      !summaryData.finalProductList ||
      summaryData.finalProductList.length === 0
    ) {
      return "";
    }
    let text = "Produktnummer\tNavn\tAntall\n"; // Header row
    summaryData.finalProductList.forEach((item) => {
      const productNumber =
        item.productNumber === "POE_SWITCH_TBD"
          ? "Avklares av installatør"
          : String(item.productNumber || "");
      const itemName = String(item.name || "");
      const itemQuantity = Number(item.quantity || 0);
      text += `${productNumber}\t${itemName}\t${itemQuantity}\n`;
    });
    return text;
  };

  const tableTextToCopy = summaryData ? generateTableTextForCopy() : "";

  // generateReadableProductListForEmail function is removed as we revert to tableTextToCopy for email body's product list

  const handleCopyToClipboard = () => {
    if (!tableTextToCopy) {
      alert("Ingenting å kopiere.");
      return;
    }
    navigator.clipboard
      .writeText(tableTextToCopy)
      .then(() => {
        alert("Produktliste kopiert til utklippstavlen!");
      })
      .catch((err) => {
        console.error("Kopiering til utklippstavle feilet:", err);
        const textarea = document.createElement("textarea");
        textarea.value = tableTextToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          const successful = document.execCommand("copy");
          if (successful) {
            alert("Produktliste kopiert til utklippstavlen! (Fallback)");
          } else {
            alert(
              "Kunne ikke kopiere automatisk. Vennligst merk teksten og kopier manuelt (Ctrl+C / Cmd+C)."
            );
          }
        } catch (fallbackErr) {
          console.error(
            "Fallback kopiering til utklippstavle feilet:",
            fallbackErr
          );
          alert("Kunne ikke kopiere. Vennligst prøv manuelt.");
        }
        document.body.removeChild(textarea);
      });
  };

  const handleDownloadSheet = () => {
    if (!tableTextToCopy) {
      alert("Ingen data å laste ned.");
      return;
    }
    const blob = new Blob([tableTextToCopy], {
      type: "text/tab-separated-values;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.setAttribute("download", `produktliste_${timestamp}.tsv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRequestQuote = () => {
    console.log(
      "SummaryPage: handleRequestQuote CALLED (minimal body version)"
    );
    if (!summaryData) {
      console.error(
        "SummaryPage: handleRequestQuote - Early exit: summaryData is missing."
      );
      alert("Kan ikke generere forespørsel: Mangler systeminformasjon.");
      return;
    }

    const systemInfoForEmail = `SYSTEMVALG:
System Teknologi: ${summaryData.systemTechnology || "Ikke valgt"}
Paneltype: ${summaryData.panelType || "Ikke valgt"}
Antall Paneler: ${summaryData.numberOfPanels || 0}
Lik konfigurasjon på alle paneler: ${summaryData.isSameConfiguration ? "Ja" : "Nei"}
`;

    const emailBody = `
Hei Teletec,

Jeg ønsker et tilbud basert på følgende konfigurasjon:

--- KONFIGURASJONSOVERSIKT ---
${systemInfoForEmail}

--- DETALJERT PRODUKTLISTE ---
VENNLIGST LIM INN DEN KOPIERTE PRODUKTLISTEN HER.
(Du kan bruke "Kopier Liste"-knappen på oppsummeringssiden og lime inn (Ctrl+V / Cmd+V) her. Alternativt, last ned .tsv-filen og legg den ved denne e-posten.)

[Lim inn produktlisten her...]

------------------------------------------------------
VENNLIGST FYLL UT DIN KONTAKTINFORMASJON NEDENFOR:

Navn:
E-post:
Telefon:
Bedrift:
Postnummer/By:

Eventuelle kommentarer eller spesielle behov:
[Skriv dine kommentarer her...]


Med vennlig hilsen,

[Ditt Navn]

------------------------------------------------------
Ved å sende denne e-posten, samtykker du til at Teletec AS kan kontakte deg angående denne forespørselen og lagre dine data i henhold til vår personvernerklæring.
`;
    console.log(
      "SummaryPage: Generated emailBody (minimal version). Length:",
      emailBody.trim().length
    );

    const mailtoLink = `mailto:${QUOTE_RECIPIENT_EMAIL}?subject=${encodeURIComponent(QUOTE_SUBJECT)}&body=${encodeURIComponent(emailBody.trim())}`;
    console.log(
      "SummaryPage: Generated mailtoLink (minimal version). Length:",
      mailtoLink.length
    );

    try {
      console.log("SummaryPage: Attempting to set window.location.href...");
      window.location.href = mailtoLink;
      console.log("SummaryPage: window.location.href assignment executed.");
    } catch (e) {
      console.error(
        "SummaryPage: Error during window.location.href assignment:",
        e
      );
      alert("En feil oppstod under forsøk på å åpne e-postklienten.");
    }
  };

  const handleBackNavigation = () => {
    if (summaryData && summaryData.systemTechnology === "4G") {
      navigate("/configure");
    } else {
      navigate("/receivers");
    }
  };

  const getBackButtonText = () => {
    if (summaryData && summaryData.systemTechnology === "4G") {
      return "Tilbake til Panelkonfigurasjon";
    }
    return "Tilbake til Svarapparat";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center text-red-600 font-semibold">
          {error}
          <button
            onClick={() => navigate("/")}
            className="mt-6 block mx-auto px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Gå til Hjem
          </button>
        </div>
      </div>
    );
  }

  if (summaryData === null || typeof summaryData === "undefined") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-500 animate-pulse">
          Laster sammendrag...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-800 mb-10 pb-4 border-b border-gray-300">
          Konfigurasjonssammendrag
        </h1>

        <section className="mb-8 p-6 bg-sky-50 border border-sky-200 rounded-lg shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-sky-700 mb-5 pb-2 border-b border-sky-300">
            Systemvalg
          </h2>
          <ul className="space-y-2 text-sm sm:text-base text-gray-700">
            <li>
              <strong>System Teknologi:</strong>{" "}
              {summaryData.systemTechnology || "Ikke valgt"}
            </li>
            <li>
              <strong>Paneltype:</strong>{" "}
              {summaryData.panelType || "Ikke valgt"}
            </li>
            <li>
              <strong>Global Installasjonstype:</strong>{" "}
              {summaryData.installationBoxTypeGlobal === "recessed"
                ? "Innfelt"
                : summaryData.installationBoxTypeGlobal === "wall-mounted"
                  ? "Utenpå"
                  : summaryData.installationBoxTypeGlobal || "N/A"}
            </li>
            <li>
              <strong>Global Vandalsikker:</strong>{" "}
              {typeof summaryData.isGlobalVandalProof !== "undefined"
                ? summaryData.isGlobalVandalProof
                  ? "Ja"
                  : "Nei"
                : "N/A"}
            </li>
            <li>
              <strong>Antall Paneler:</strong> {summaryData.numberOfPanels}
            </li>
            <li>
              <strong>Identisk Konfigurasjon:</strong>{" "}
              {summaryData.isSameConfiguration ? "Ja" : "Nei"}
            </li>
          </ul>
        </section>

        {summaryData.panelsConfig && summaryData.panelsConfig.length > 0 && (
          <section className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-5 pb-2 border-b border-indigo-300">
              Paneldetaljer
            </h2>
            <div className="flex flex-row flex-wrap gap-4 justify-center sm:justify-start">
              {summaryData.panelsConfig.map((panel) => (
                <div
                  key={panel.id}
                  className="bg-white p-4 rounded-md shadow border border-indigo-100 w-full sm:w-auto sm:min-w-[200px] flex-grow sm:flex-grow-0"
                >
                  <h3 className="text-md font-semibold text-indigo-600 mb-2">
                    {panel.label || `Panel ${panel.id}`}
                  </h3>
                  <p className="text-xs text-gray-600">
                    Installasjon:{" "}
                    {panel.installationType === "recessed"
                      ? "Innfelt"
                      : panel.installationType === "wall-mounted"
                        ? "Utenpå"
                        : panel.installationType}
                  </p>
                  <p className="text-xs text-gray-600">
                    Vandalsikker: {panel.isVR ? "Ja" : "Nei"}
                  </p>
                  {panel.modules && panel.modules.length > 0 ? (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 mb-1">
                        Moduler:
                      </h4>
                      <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs text-gray-600">
                        {panel.modules.map((moduleName, index) => (
                          <li key={`${panel.id}-mod-${index}`}>{moduleName}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-2">
                      Ingen moduler valgt for dette panelet.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8 p-6 bg-teal-50 border border-teal-200 rounded-lg shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-300">
            Total Produktliste (for bestilling)
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Bruk knappene under for å be om et tilbud, kopiere listen, eller
            laste den ned som en fil som kan åpnes i Excel.
          </p>
          {summaryData.finalProductList &&
          summaryData.finalProductList.length > 0 ? (
            <>
              <div className="overflow-x-auto shadow rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produktnummer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Navn
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Antall
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summaryData.finalProductList.map((item, index) => (
                      <tr
                        key={
                          item.productNumber
                            ? `${item.productNumber}-${item.name}-${index}`
                            : `item-${index}`
                        }
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {item.productNumber === "POE_SWITCH_TBD"
                            ? "Avklares av installatør"
                            : item.productNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {item.productNumber === "POE_SWITCH_TBD" ? (
                            <a
                              href="https://www.teletec.no/natverk/switchar"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              title="Klikk for å se POE-svitsjer hos Teletec"
                            >
                              {item.name}
                            </a>
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={handleRequestQuote}
                  className="w-full sm:w-auto order-first sm:order-none flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors"
                >
                  Be om tilbud
                </button>
                {tableTextToCopy && (
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
                  >
                    Kopier Liste
                  </button>
                )}
                {tableTextToCopy && (
                  <button
                    onClick={handleDownloadSheet}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Last ned Excel-vennlig fil (.tsv)
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Ingen produkter i listen.
            </p>
          )}
        </section>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-gray-300">
          <button
            onClick={handleBackNavigation}
            className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            {getBackButtonText()}
          </button>
          <button
            onClick={handleStartOver}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Start på nytt
          </button>
        </div>
      </div>
    </div>
  );
}
