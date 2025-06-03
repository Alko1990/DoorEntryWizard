# Entry Panel Configuration Tool

## Project Overview

The Entry Panel Configuration Tool is a web application designed to help users configure custom entry (door) phone panel systems. Users can select a system technology (X1, IP, 4G), choose panel types (Video, Audio), add various modules to panels, select compatible receivers, and generate a comprehensive list of required products and accessories. The tool includes logic for calculating necessary power supplies and installation hardware based on the configuration.

## Key Features

* **System Selection:** Choose between X1, IP, and 4G system technologies.
* **Panel Type Selection:** Select Video or Audio panel types (Audio is auto-selected for 4G).
* **Dynamic Panel Configuration:**
    * Add up to 3 entry panels.
    * Configure modules for each panel using drag-and-drop or click-to-add.
    * "Same Configuration" mode to apply settings from the first panel to all others.
    * Per-panel or global settings for Installation Type (Recessed/Wall-mounted) and Vandal-Proof (VR) status.
    * Dynamic display of standard or VR module images based on panel settings.
    * Budget calculation for modules within each panel.
* **Module Management:**
    * Validation for module addition (main module requirements, max per panel, exclusivity, budget).
    * Compact display of modules within entry panels (80px cells).
* **Receiver Selection:**
    * Lists compatible receivers based on system and panel type.
    * Allows quantity selection for receivers (manual input and +/- buttons).
    * 4G systems bypass receiver selection.
* **Accessory Calculation:**
    * Automatically calculates necessary frames and installation boxes based on module count and panel settings (installation type, VR).
    * Calculates other system-specific accessories (e.g., XDV/304 video splitter for X1).
* **Power Supply Calculation:**
    * Detailed logic for X1 systems (`VAS/100.30`, `VA/01`, `VAS/101`) based on panel count, module presence, and specific receiver types/quantities.
    * Logic for 4G system power supplies (one `VAS/100.30` per active panel).
    * Logic for IP systems (POE Switch requirement based on device count).
* **Summary Page:**
    * Comprehensive overview of the selected system, panel configurations, and a consolidated final product list.
    * Options to "Copy List" (TSV format) and "Download .tsv file".
    * "Be om tilbud" (Request a Quote) button that generates a `mailto:` link with configuration details.
    * Dynamic representative image based on panel VR status.
* **User Interface & Experience:**
    * Instructional modals for key pages (Home, Panel Selector) that show on first visit (via `localStorage`) and are accessible via a help icon (Heroicons).
    * Modals support rich content, including GIFs for demonstrations.
    * Responsive design elements.
    * Norwegian UI text for key elements like installation types.

## Technologies Used

* **Frontend Library/Framework:** React (with JSX)
* **Styling:** Tailwind CSS
* **State Management:** React Context API (`EntryManagerContext`)
* **Routing:** React Router
* **Drag and Drop:** React DnD (with HTML5 Backend)
* **Language:** JavaScript
* **Build Tool:** Vite
* **Icons:** Heroicons (`@heroicons/react`)
* **Data:** Product specifications and rules are managed via `Cleaned_metadata_new.json`. Image assets are mapped in `imageMap.js`.
