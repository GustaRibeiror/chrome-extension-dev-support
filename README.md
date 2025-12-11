# 🛠️ Support Logger - Internal Chrome Extension for Support Tickets

> A productivity tool designed to standardize, streamline, and enrich the creation of technical support tickets for the development team.

![Status](https://img.shields.io/badge/Status-Validated%20MVP-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-JavaScript_ES6-yellow?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Chrome_Extension_V3-blue?style=for-the-badge)

---

## 🎯 The Challenge

In the previous workflow, the development team faced significant friction with decentralized and incomplete support tickets. Requests often arrived via chat or email missing critical technical context, such as:
* The exact URL where the error occurred.
* Environment details (Browser/OS version).
* Clear visual evidence or technical logs.

This resulted in an unproductive cycle of back-and-forth communication just to gather basic triage information, delaying critical bug fixes.

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

## 🛠️ Architecture & Technical Decisions

The project was built upon the **Chrome Manifest V3** architecture, prioritizing performance and security.

### 1. The Payload Challenge (Error 413)
The EmailJS free tier imposes a strict request size limit (approx. 50kb). Sending high-resolution screenshots caused consistent API failures.
* **Solution:** I implemented a processing pipeline in `popup.js`. Before transmission, images are drawn onto an off-screen `<canvas>`, resized (max 800px width), and compressed to JPEG format with adjustable quality. This ensures visual clarity without exceeding the payload quota.

### 2. Client-Side Security
Since browser extensions run in an insecure client-side environment, storing real SMTP credentials (passwords) is a security risk.
* **Solution:** Integration with EmailJS using Public Keys. Real credentials remain protected on the provider's server. Additionally, configuration keys were segregated into a `config.js` file (listed in `.gitignore`) to prevent leakage in public repositories.

### 3. State Persistence
To enhance UX and prevent data loss during context switching.
* **Solution:** Implementation of a *Draft* system using `localStorage`. The form state is serialized and saved on every input event, and cleared only after a successful API response (HTTP 200).

---

## 🚀 How to Run Locally

### Prerequisites
* Google Chrome.
* An [EmailJS](https://www.emailjs.com/) account (Service ID, Template ID, and Public Key). (Easy to create and FREE)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR-USERNAME]/support-logger.git
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