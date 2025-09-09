# Figma Shortcuts Plugin

A powerful Figma plugin that provides custom keyboard shortcuts and a persistent UI for enhanced productivity in Figma.

## Features

- **Instant Access**: No password required - starts immediately
- **Persistent UI**: Plugin stays open and running once started
- **Custom Shortcuts**: Unique shortcuts that don't conflict with Figma's built-in ones
- **Minimize/Maximize**: Toggle between full UI and minimized icon
- **Properties Panel**: View selected object properties
- **Page Styling**: Quick page background color changes
- **Layout Guides**: Instant layout grid configurations
- **Size Copying**: Copy element dimensions with visual feedback
- **Clean React UI**: Modern, responsive interface

## Available Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `~` | Open Properties Panel | View details of selected object |
| `Alt+S` | Copy Element Size | Copy width and height of selected element |
| `1-0` | Change Page Background | Number keys set page background from black (0) to light grey (9) |
| `Alt+1` | Column Layout Grid | Apply 12-column grid to selected frame |
| `Alt+2` | Row Layout Grid | Apply 8-row grid to selected frame |
| `Alt+3` | Square Grid Layout | Apply square grid to selected frame |

## Installation & Setup

### Method 1: Development Installation (Recommended)

1. **Clone and Build**:
   ```bash
   git clone <repository-url>
   cd Figma-Plugin
   npm install
   npm run build
   ```

2. **Install in Figma Desktop**:
   - Open Figma Desktop App (required for plugins)
   - Go to `Menu` → `Plugins` → `Development` → `Import plugin from manifest...`
   - Navigate to your project folder and select `manifest.json`
   - The plugin will appear in your plugins list as "Shortcuts Plugin"

3. **Run the Plugin**:
   - Go to `Menu` → `Plugins` → `Development` → `Shortcuts Plugin`
   - The plugin will start immediately (no password required)
   - Keep the plugin window open to use shortcuts

### Method 2: Direct Installation

If you have the built files:
1. Download the `dist/` folder and `manifest.json`
2. Follow step 2-3 above

## Usage Guide

### Basic Usage
1. **Launch**: Open the plugin from Figma's plugin menu
2. **Keep Open**: Leave the plugin window open to use shortcuts
3. **Shortcuts Work**: Press any shortcut while the plugin is active

### Shortcut Details

**Element Properties (`~`)**:
- Select any object in Figma
- Press `~` to view its properties in the plugin panel

**Copy Element Size (`Alt+S`)**:
- Select any object with dimensions
- Press `Alt+S` to copy its width and height
- Size appears in the plugin with visual confirmation

**Page Background Colors (`1-0`)**:
- Press number keys to change page background:
  - `0` = Black
  - `1` = Very dark grey
  - `2-4` = Medium greys
  - `5` = Mid grey
  - `6-8` = Light greys
  - `9` = Very light grey

**Layout Grids (`Alt+1/2/3`)**:
- Select a frame first
- `Alt+1` = 12-column grid with 20px margins
- `Alt+2` = 8-row grid with 20px margins  
- `Alt+3` = Square grid with 8px spacing

### Interface Controls
- **Minimize (➖)**: Reduce to small icon to save screen space
- **Restore**: Click the minimized icon to restore full interface
- **Close (✕)**: Close the plugin entirely

## Development

### Tech Stack
- **Language**: TypeScript
- **Framework**: React 18
- **Build Tool**: Vite
- **API**: Figma Plugin API

### Scripts
- `npm run build` - Build for production
- `npm run dev` - Build with watch mode for development
- `npm run type-check` - Run TypeScript type checking

### Project Structure
```
├── src/
│   ├── code.ts      # Main plugin logic (Figma API)
│   ├── ui.tsx       # React UI component
│   └── ui.html      # HTML template
├── dist/            # Built files (generated)
├── manifest.json    # Figma plugin manifest
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── vite.config.ts   # Vite build configuration
```

## How It Works

1. **Plugin Architecture**:
   - `code.ts` runs in Figma's plugin sandbox
   - `ui.tsx` runs in an iframe with React
   - Communication via `postMessage` API

2. **State Management**:
   - React hooks for UI state
   - Message passing for plugin-UI communication
   - Persistent plugin execution

3. **Keyboard Handling**:
   - Event listeners in React component
   - Shortcut detection and action dispatch
   - Integration with Figma API for canvas manipulation

## Customization & Development

### Adding New Shortcuts:
1. **Update UI** (`src/ui.tsx`):
   - Add shortcut to `shortcuts` array
   - Add key detection in `handleKeyDown` function

2. **Update Plugin Logic** (`src/code.ts`):
   - Add case in `handleShortcut` function
   - Implement the action function

3. **Rebuild**:
   ```bash
   npm run build
   ```

### Modifying Colors/Grids:
- Edit `colorMap` in `changePageColor()` for different color schemes
- Modify `layoutConfigs` in `changeLayoutGuideStyle()` for different grid setups

### Development Mode:
```bash
npm run dev  # Watch mode for development
```

## Plugin Capabilities & Limitations

### What This Plugin Can Do:
- ✅ Read selected object properties
- ✅ Change page background colors
- ✅ Apply layout grids to frames
- ✅ Copy element dimensions
- ✅ Provide persistent UI with shortcuts

### Figma API Limitations:
- ❌ Cannot access Figma's native panels (Properties, Layers, etc.)
- ❌ Cannot modify Figma's built-in UI elements
- ❌ Layout grid options are limited to what the API exposes
- ❌ Some advanced styling options require manual adjustment

### How It Works:
This plugin works as a **shortcut overlay** that:
1. Listens for keyboard input while the plugin window is active
2. Uses Figma's Plugin API to make changes to your document
3. Provides visual feedback through the plugin interface
4. Does NOT integrate with Figma's native panels - it creates its own functionality

## Security & Privacy

- No password required
- No network access
- No data collection
- Runs entirely within Figma's secure plugin environment
- All code is open source and auditable

## License

MIT License - Feel free to modify and distribute.