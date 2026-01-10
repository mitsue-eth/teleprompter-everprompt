# EverPrompt

A professional teleprompter application for video recording. Free to use with local storage, with optional premium features for cloud sync.

🌐 **Website**: [everprompt.ai](https://everprompt.ai)

## Features

- ✨ **Free & Local**: Use completely free with browser local storage
- 🎬 **Professional Teleprompter**: Smooth scrolling text display optimized for video recording
- 🎨 **Dark Mode**: Beautiful dark theme designed for recording environments
- ⚙️ **Granular Controls**: Fine-tune font size, text width, positioning, and scroll speed
- 📱 **Collapsible Panels**: Clean interface with hideable editor and controls
- 🖱️ **Mouse Scroll Support**: Scroll through your script with mouse wheel
- ⏱️ **Reading Time Estimation**: Know how long your script will take to read
- 💾 **Settings Persistence**: All settings and scripts saved automatically
- 🔄 **Auto & Manual Modes**: Automatic scrolling or manual step-by-step control

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Accessible primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/mitsue-eth/teleprompter-everprompt.git

# Navigate to the project
cd teleprompter-everprompt

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

1. **Enter Your Script**: Click the editor button (top-left) to open the script editor
2. **Adjust Settings**: Click the controls button (top-right) to fine-tune appearance and speed
3. **Start Recording**: Click Play to begin auto-scrolling, or use manual mode for more control
4. **Scroll Manually**: Use mouse wheel or arrow buttons to navigate through your script

## Premium Features (Coming Soon)

- ☁️ **Cloud Sync**: Access your scripts and settings from any device
- 📚 **Script Library**: Save and organize multiple scripts
- 👥 **Team Collaboration**: Share scripts with your team
- 🎯 **Advanced Features**: Custom fonts, themes, and more

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Main teleprompter page
│   └── icon.svg           # App icon/favicon
├── components/            # React components
│   ├── teleprompter.tsx   # Main teleprompter component
│   ├── teleprompter-editor.tsx    # Script editor
│   ├── teleprompter-display.tsx   # Text display area
│   ├── teleprompter-controls.tsx  # Control panel
│   └── logo.tsx           # Logo component
├── hooks/                 # Custom React hooks
│   ├── use-teleprompter-settings.ts  # Settings management
│   └── use-teleprompter-scroll.ts    # Scrolling logic
└── public/               # Static assets
    ├── logo.svg         # Full logo
    └── logo-icon.svg    # Icon version
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

This project is open source and available for free use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for content creators
