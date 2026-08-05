<div align="center"> <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&pause=1000&color=A855F7&center=true&vCenter=true&width=600&lines=Designify+AI;Figma+%E2%86%92+Production+Code;Powered+by+Gemini+AI" alt="Typing SVG" />
🎨 Designify AI
🚀 AI-Powered Figma to Production Code Generator

Transform Figma designs into clean, reusable and production-ready React components using AI.

<p align="center"> <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=20232a"> <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=20232a"> <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white&labelColor=20232a"> <img src="https://img.shields.io/badge/Google-OAuth-EA4335?style=for-the-badge&logo=google&logoColor=white&labelColor=20232a"> <img src="https://img.shields.io/badge/AI-Gemini-8E44AD?style=for-the-badge&logoColor=white&labelColor=20232a"> <img src="https://img.shields.io/github/license/Namanraj-0007/DesignifyAI?style=for-the-badge&labelColor=20232a"> </p> <p align="center"> <img src="https://img.shields.io/github/stars/Namanraj-0007/DesignifyAI?style=social"> <img src="https://img.shields.io/github/forks/Namanraj-0007/DesignifyAI?style=social"> <img src="https://img.shields.io/github/last-commit/Namanraj-0007/DesignifyAI?style=flat-square&color=A855F7"> </p> <br/> <p align="center"> <a href="https://your-portfolio-url.vercel.app"><img src="https://img.shields.io/badge/🌐_My_Portfolio-Visit_Now-000000?style=for-the-badge&logo=vercel&logoColor=white"></a> <a href="#"><img src="https://img.shields.io/badge/🚀_Live_Demo-Coming_Soon-6C5CE7?style=for-the-badge"></a> </p>

<sub>⚠️ Replace <code>your-portfolio-url.vercel.app</code> above with your actual deployed portfolio link.</sub>

</div> <br/> <div align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=header" width="100%"> </div>
📖 Overview

Designify AI is an intelligent AI-powered platform that converts Figma UI designs into production-ready React code.

Instead of manually recreating UI designs, developers can import Figma files and generate optimized, responsive React components with AI assistance — cutting design-to-code time from hours to minutes.

🎥 Screen Recording
<div align="center">

🎬 A full walkthrough of Designify AI in action — from Figma import to generated React code.

<!-- Replace the line below with your actual screen recording. Options: 1) Upload a .mp4/.mov to GitHub via an Issue, copy the resulting link, and embed it in an HTML <video> tag (renders on GitHub). 2) Convert your recording to a .gif and reference it directly like an image. 3) Host on YouTube/Loom and use the thumbnail-as-link trick below. --> <a href="#"> <img src="https://your-cdn-or-repo-link/demo-thumbnail.png" alt="Watch the demo" width="80%"> </a>

<sub>👆 Click to watch the full demo (replace with your video link)</sub>

</div> <details> <summary>📌 How to add your own screen recording</summary> <br/>
Record your screen (e.g. with OBS, ScreenStudio, or Loom).
Convert to .gif for autoplay-in-README, or keep as .mp4 for a clickable thumbnail.
Place the file in a docs/media/ folder in your repo.
Reference it here:
md
   ![Demo](docs/media/demo.gif)

or for video via HTML (works on GitHub):

html
   <video src="docs/media/demo.mp4" controls width="100%"></video>
</details>
📸 Screenshots
<div align="center"> <table> <tr> <td align="center" width="50%"> <img src="https://your-cdn-or-repo-link/screenshot-dashboard.png" width="100%"><br/> <sub><b>🏠 Dashboard</b></sub> </td> <td align="center" width="50%"> <img src="https://your-cdn-or-repo-link/screenshot-editor.png" width="100%"><br/> <sub><b>🧩 Component Editor</b></sub> </td> </tr> <tr> <td align="center" width="50%"> <img src="https://your-cdn-or-repo-link/screenshot-figma-import.png" width="100%"><br/> <sub><b>🎨 Figma Import</b></sub> </td> <td align="center" width="50%"> <img src="https://your-cdn-or-repo-link/screenshot-code-preview.png" width="100%"><br/> <sub><b>⚡ Live Code Preview</b></sub> </td> </tr> </table>

<sub>📁 Drop your screenshots in <code>docs/media/</code> and swap the placeholder links above.</sub>

</div>
✨ Features
<table> <tr> <td>

✅ Secure JWT Authentication ✅ Google OAuth Login ✅ MongoDB Atlas Integration ✅ AI-Powered UI Analysis ✅ Figma API Integration

</td> <td>

✅ Component Detection ✅ Responsive React Code Generation ✅ Live Preview ✅ Project Dashboard ✅ Theme Support & Export

</td> </tr> </table>
🛠 Tech Stack
<div align="center">
Layer	Stack
🎨 Frontend	React · TypeScript · Vite · Tailwind CSS
⚙️ Backend	FastAPI · Python · JWT · Google OAuth
🗄 Database	MongoDB Atlas
🤖 AI	Gemini API
🖌 Design Source	Figma API
</div>
🏗 Project Architecture
text
                    React + Vite (Frontend)
                              │
                              ▼
                     FastAPI Backend (API Layer)
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       MongoDB Atlas                     Gemini AI
     (Users · Projects)             (Design Analysis)
              │                               │
              └───────────────┬───────────────┘
                              ▼
                        Figma API
                  (Design Source of Truth)
📂 Folder Structure
text
DesignifyAI
│
├── backend
│   ├── app
│   ├── routers
│   ├── services
│   ├── models
│   ├── schemas
│   └── utils
│
├── frontend
│   ├── src
│   ├── pages
│   ├── components
│   ├── hooks
│   ├── context
│   └── api
│
├── docs
│   └── media          👈 put screenshots & recordings here
└── README.md
🚀 Installation

Clone the repository

bash
git clone https://github.com/Namanraj-0007/DesignifyAI.git

Frontend

bash
cd frontend
npm install
copy .env.example .env
npm run dev

Backend

bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

The app should now be available at:

🖥 Frontend → http://localhost:5073
⚙️ Backend → http://localhost:8000
🔑 Environment Variables

Backend

env
MONGODB_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

Frontend

env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=
🗺 Roadmap
 Authentication
 MongoDB Atlas
 JWT
 Google OAuth
 Figma Import
 AI Component Detection
 React Code Generation
 Live Preview
 Export Project
 Deployment
🤝 Contributing

Contributions are welcome! Feel free to fork the project, open an issue, or submit a Pull Request.

⭐ Support

If you like this project, consider giving it a ⭐ on GitHub — it helps a lot!

<div align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%">
Made with ❤️ by Naman Raj
Designed by Namandip Raj with ❤️
</div>
