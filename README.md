# 🛠️ Support Logger - Internal Chrome Extension for Support Tickets

> A productivity tool designed to standardize, streamline, and enrich the creation of technical support tickets for the development team.

---

## 💡 The Solution

I developed a **Google Chrome Extension (Manifest V3)** that serves as a centralized hub for ticket submission. It automates the collection of technical metadata and sends a standardized report directly to the team's email queue using the **EmailJS** API.

### ✨ Key Features

* **🕵️‍♂️ Metadata Automation:** Automatically captures the active URL, User Agent, Screen Resolution, and Timestamp via *Content Scripts*.
* **📸 Evidence Management:**
    * Support for Drag-and-drop or **Ctrl+V (Paste)** for screenshots.
    * **Smart Compression:** Client-side algorithm using the Canvas API to resize and compress images, optimizing the payload for API limits.
* **📂 Log Attachments:** Support for attaching text-based files (XML, JSON, LOG), automatically reading and formatting the content within the email body.
* **💾 Data Persistence (Drafts):** Auto-save system using `localStorage`. If the user accidentally closes the popup, the form state (including images) is restored upon reopening.
* **🎨 Intuitive UI:** Clear categorization (Bug, Feature, Suggestion) and visual feedback for affected systems.

---

## 🚀 How to Run Locally

### Prerequisites
* Google Chrome.
* An [EmailJS](https://www.emailjs.com/) account (Service ID, Template ID, and Public Key). (Easy to create and FREE)

### Installation

1.  **Clone the repository:**
    ````bash
    git clone https://github.com/GustaRibeiror/chrome-extension-dev-support.git
    ```

2.  **Configure Security:**
    * In the project root, create a file named `config.js`.
    * Add your EmailJS credentials (this file is ignored by Git):
    ```javascript
    const CONFIG = {
        SERVICE_ID: "YOUR_SERVICE_ID",
        TEMPLATE_ID: "YOUR_TEMPLATE_ID",
        PUBLIC_KEY: "YOUR_PUBLIC_KEY"
    };
    ```

3.  **Load into Chrome:**
    * Open `chrome://extensions`.
    * Enable **Developer mode** (top right corner).
    * Click **Load Unpacked**.
    * Select the project folder.

---

## 📂 File Structure

```text
/
├── manifest.json      # Main configuration (Manifest V3)
├── popup.html         # User Interface
├── popup.js           # Core Logic (Compression, API, Drafts)
├── content.js         # Script injected to read page data
├── style.css          # Styling
├── email.min.js       # EmailJS SDK (Local)
└── config.js          # (Not versioned) API Keys
