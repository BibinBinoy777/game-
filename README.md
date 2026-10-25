# 🏏 Gully Kerala Premier

An arcade-style village cricket game set in rural Kerala. Play on a lush paddy-field pitch, follow local gully rules, listen to Manglish commentary, and enjoy synthesized chenda beats.

> Built with Next.js and the Gemini API, starting from the Google AI Studio applet template.


---

## ✨ Features

- **Village cricket, arcade style:** quick, fun gameplay on a paddy-field pitch
- **Gully rules:** local street-cricket rules instead of the standard laws
- **Manglish commentary:** Malayalam-flavoured English commentary, powered by the Gemini API (server-side)
- **Chenda beats:** percussion synthesized in the browser
- **Modern UI:** responsive layout with smooth animations

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | [Motion](https://motion.dev/) |
| Icons | lucide-react |
| AI | [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Gemini API) |

## 📁 Project Structure

```
├── app/           # Next.js routes and pages
├── components/    # Reusable UI and game components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and helpers
├── public/        # Static assets
├── .env.example   # Environment variable template
└── metadata.json  # AI Studio applet metadata
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or later
- A [Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/BibinBinoy777/game-.git
cd game-

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` and add your values:

```env
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:3000"
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other scripts

| Command | Description |
|---|---|
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run clean` | Clean Next.js build output |

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key, used server-side for AI features |
| `APP_URL` | Yes | URL where the app is hosted (used for self-referential links) |

> Never commit your real `.env.local`. It is already covered by `.gitignore`.

## 🎮 How to Play

<!-- Fill in your actual controls and rules, for example: -->
1. Start a match from the main screen.
2. Time your shot as the ball comes in.
3. Follow the gully rules shown in-game (for example, what counts as out or a boundary).
4. Score as many runs as you can and beat the target.

## 🗺️ Roadmap

- [ ] Add screenshots and a live demo link
- [ ] More pitches and local rule variations
- [ ] Multiplayer or high-score leaderboard
- [ ] Sound and commentary settings

## 🤝 Contributing

Contributions are welcome. Fork the repo, create a feature branch, and open a pull request.

## 📄 License

Add a license of your choice (for example MIT) and update this section.

## 👤 Author

**Bibin Binoy**
GitHub: [@BibinBinoy777](https://github.com/BibinBinoy777)

---

*Made with ❤️ in Kerala.*
