# Nuko - Interactive Periodic Table 🌌

Nuko is a beautifully designed, modern, and highly interactive periodic table built for students and chemistry enthusiasts. It transforms the traditional periodic table into a premium, immersive learning space using a deep-space glassmorphic aesthetic.

## ✨ Features

* **Stunning Glassmorphic UI:** A visually striking design featuring deep space gradients, holographic glass reflections, smooth micro-animations, and custom scrollbars.
* **Live Search & Filtering:** Instantly filter elements by Name, Symbol, or Atomic Number. Non-matching elements fade into the background while matches glow brilliantly.
* **Rich Element Details:** Click on any element to view a dedicated detail page. Nuko automatically fetches high-quality images and real-time summaries, historical facts, and use-cases directly from the Wikipedia API.
* **Category Highlighting:** Hover over any legend category (e.g., Noble Gases, Alkali Metals) to instantly isolate and highlight those specific elements on the table.
* **Zero Backend Required:** Nuko is a 100% static frontend application. No databases or backends to configure.

## 🛠️ Technologies Used

* **HTML5:** Semantic structure for the periodic table grid and detail pages.
* **CSS3:** Advanced styling including CSS Grid for the table layout, Flexbox, custom properties (variables), `backdrop-filter` for glassmorphism, and complex CSS animations.
* **Vanilla JavaScript (ES6+):** Client-side logic for search, DOM manipulation, state management, and asynchronous data fetching (`fetch` API).
* **External APIs:** Integrates seamlessly with the public Wikimedia REST API to dynamically pull in element summaries and image galleries.

## 🚀 How to Run Locally

Because Nuko is a purely static website, running it is incredibly simple:

1. **Clone or Download** this repository to your local machine.
2. **Start a Local Server:** While you can simply double-click `index.html`, it is highly recommended to run a local web server so that the JavaScript API calls work perfectly without CORS issues.
   * If using **VS Code**, install the "Live Server" extension and click "Go Live".
   * If you have **Python** installed, open a terminal in the project folder and run: `python -m http.server 8000`
   * If you have **Node.js** installed, run: `npx http-server`
3. **Open in Browser:** Navigate to `http://localhost:8000` (or whatever port your server provides) and start exploring!

## 🌍 Sharing the Project

If you want to share your local version of Nuko with others over the internet, you can use a tool like **ngrok**:
1. Ensure your local server is running (e.g., on port 8000).
2. Open a new terminal and run: `ngrok http 8000`
3. Share the generated `https://...ngrok-free.app` forwarding link!

---
*Designed to make chemistry, clearly visualized.*
