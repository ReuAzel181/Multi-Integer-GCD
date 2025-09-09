// Main plugin code that runs in the Figma environment

// This shows the HTML page specified in manifest.json
// The UI is loaded from dist/ui.html as specified in manifest.json
figma.showUI(__html__, { width: 320, height: 400 });

// Keep the plugin running
figma.skipInvisibleInstanceChildren = true;

// Handle messages from the UI
figma.ui.onmessage = (msg) => {
  console.log('Backend received message from UI:', msg);
  
  if (msg.type === 'start-plugin') {
    console.log('Plugin started from UI');
    setupKeyboardListeners();
    
    // Send confirmation back to UI
    figma.ui.postMessage({
      type: 'listeners-ready'
    });
  } else if (msg.type === 'shortcut-pressed') {
    console.log('Shortcut pressed:', msg.shortcut, msg.data);
    handleShortcut(msg.shortcut, msg.data);
  } else if (msg.type === 'test-message') {
    console.log('Test message received:', msg.data);
    figma.notify('✅ Communication working! Message: ' + msg.data);
  } else if (msg.type === 'close-plugin') {
    console.log('Closing plugin');
    figma.closePlugin();
  } else if (msg.type === 'minimize-ui') {
    console.log('Minimizing UI');
    figma.ui.resize(60, 60);
  } else if (msg.type === 'maximize-ui') {
    console.log('Maximizing UI');
    figma.ui.resize(320, 480);
  } else {
    console.log('Unknown message type:', msg.type);
  }
};

// Set up keyboard listeners (this would be handled by the UI)
function setupKeyboardListeners() {
  // Send confirmation back to UI that listeners are set up
  figma.ui.postMessage({
    type: 'listeners-ready'
  });
}

// Handle different shortcuts
function handleShortcut(shortcut: string, data?: any) {
  console.log('Handling shortcut:', shortcut, data);
  
  switch (shortcut) {
    case '~':
      // Open properties panel
      openPropertiesPanel();
      break;
      
    case 'alt+s':
      // Copy element size
      copyElementSize();
      break;
      
    case 'number-key':
      // Change page background color
      changePageColor(data.colorKey);
      break;
      
    case 'alt+layout':
      // Change layout guide style
      changeLayoutGuideStyle(data.layoutStyle);
      break;
      
    case 'toggle-hide-layer':
      toggleHideSelectedLayer();
      break;
    case 'paste-size':
      pasteElementSize(data.size);
      break;
    case 'open-style-variable':
      openStyleAndVariable();
      break;
      
    default:
      figma.notify(`Shortcut ${shortcut} not implemented yet`);
  }
}

// Shortcut implementations
function openPropertiesPanel() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify('No objects selected');
    return;
  }
  
  const node = selection[0];
  const properties = {
    name: node.name,
    type: node.type,
    x: 'x' in node ? node.x : 'N/A',
    y: 'y' in node ? node.y : 'N/A',
    width: 'width' in node ? node.width : 'N/A',
    height: 'height' in node ? node.height : 'N/A'
  };
  
  figma.ui.postMessage({
    type: 'show-properties',
    properties: properties
  });
}

function copyElementSize() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify('No objects selected');
    return;
  }
  
  const node = selection[0];
  if ('width' in node && 'height' in node) {
    const size = {
      width: Math.round(node.width),
      height: Math.round(node.height)
    };
    
    // Send size to UI for display
    figma.ui.postMessage({
      type: 'size-copied',
      size: size
    });
    
    figma.notify(`Size copied: ${size.width} × ${size.height}`);
  } else {
    figma.notify('Selected object has no size properties');
  }
}

function changePageColor(colorKey: string) {
  // Map number keys to different shades from black to mid grey
  const colorMap: { [key: string]: RGB } = {
    '1': { r: 0.1, g: 0.1, b: 0.1 },     // Very dark grey
    '2': { r: 0.2, g: 0.2, b: 0.2 },     // Dark grey
    '3': { r: 0.3, g: 0.3, b: 0.3 },     // Medium dark grey
    '4': { r: 0.4, g: 0.4, b: 0.4 },     // Medium grey
    '5': { r: 0.5, g: 0.5, b: 0.5 },     // Mid grey
    '6': { r: 0.6, g: 0.6, b: 0.6 },     // Light medium grey
    '7': { r: 0.7, g: 0.7, b: 0.7 },     // Light grey
    '8': { r: 0.8, g: 0.8, b: 0.8 },     // Very light grey
    '9': { r: 0.9, g: 0.9, b: 0.9 },     // Almost white
    '0': { r: 0, g: 0, b: 0 }             // Black
  };
  
  const color = colorMap[colorKey];
  if (color) {
    figma.currentPage.backgrounds = [{
      type: 'SOLID',
      color: color
    }];
    figma.notify(`Page background changed to ${colorKey === '0' ? 'black' : `grey ${colorKey}`}`);
  }
}

function changeLayoutGuideStyle(layoutStyle: string) {
  // Note: Figma API has limited access to layout grid styles
  // This is a simplified implementation
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify('No frame selected. Select a frame to change layout guides.');
    return;
  }
  
  const frame = selection[0];
  if (frame.type !== 'FRAME') {
    figma.notify('Please select a frame to change layout guides.');
    return;
  }
  
  // Create different layout grid configurations with proper typing
  let layoutGrid: LayoutGrid;
  
  switch (layoutStyle) {
    case '1':
      // Column layout
      layoutGrid = {
        pattern: 'COLUMNS',
        sectionSize: 12,
        visible: true,
        color: { r: 0.96, g: 0.26, b: 0.21, a: 0.1 },
        alignment: 'MIN',
        gutterSize: 20,
        offset: 0
      } as RowsColsLayoutGrid;
      break;
    case '2':
      // Row layout
      layoutGrid = {
        pattern: 'ROWS',
        sectionSize: 8,
        visible: true,
        color: { r: 0.96, g: 0.26, b: 0.21, a: 0.1 },
        alignment: 'MIN',
        gutterSize: 20,
        offset: 0
      } as RowsColsLayoutGrid;
      break;
    case '3':
      // Grid layout
      layoutGrid = {
        pattern: 'GRID',
        sectionSize: 8,
        visible: true,
        color: { r: 0.96, g: 0.26, b: 0.21, a: 0.1 }
      } as GridLayoutGrid;
      break;
    default:
      figma.notify('Invalid layout style');
      return;
  }
  
  frame.layoutGrids = [layoutGrid];
  figma.notify(`Layout guide style ${layoutStyle} applied`);
}

function toggleHideSelectedLayer() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify('No objects selected');
    return;
  }
  
  let hiddenCount = 0;
  let shownCount = 0;
  
  selection.forEach(node => {
    if (node.visible) {
      node.visible = false;
      hiddenCount++;
      // Send message to UI about hidden layer
      figma.ui.postMessage({
        type: 'layer-hidden',
        layerId: node.id
      });
    } else {
      node.visible = true;
      shownCount++;
      // Send message to UI about shown layer
      figma.ui.postMessage({
        type: 'layer-shown',
        layerId: node.id
      });
    }
  });
  
  if (hiddenCount > 0 && shownCount > 0) {
    figma.notify(`Toggled ${hiddenCount + shownCount} layer(s): ${hiddenCount} hidden, ${shownCount} shown`);
  } else if (hiddenCount > 0) {
    figma.notify(`Hidden ${hiddenCount} layer(s)`);
  } else if (shownCount > 0) {
    figma.notify(`Shown ${shownCount} layer(s)`);
  }
}

function pasteElementSize(size: {width: number, height: number}) {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify('No objects selected');
    return;
  }
  
  if (!size) {
    figma.notify('No size copied. Use Alt+S to copy size first.');
    return;
  }
  
  let resizedCount = 0;
  
  selection.forEach(node => {
    if ('resize' in node) {
      try {
        node.resize(size.width, size.height);
        resizedCount++;
      } catch (error) {
        console.log(`Could not resize ${node.name}:`, error);
      }
    } else if ('width' in node && 'height' in node) {
      try {
        node.width = size.width;
        node.height = size.height;
        resizedCount++;
      } catch (error) {
        console.log(`Could not resize ${node.name}:`, error);
      }
    }
  });
  
  if (resizedCount > 0) {
    figma.notify(`Pasted size ${size.width} × ${size.height} to ${resizedCount} element(s)`);
  } else {
    figma.notify('Could not resize selected elements');
  }
}

// Open style and variable panel (Left Click + V)
function openStyleAndVariable() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify('No element selected');
    return;
  }
  
  // This will focus on the selected element and show its properties
  // Note: Figma API doesn't allow direct panel opening, but we can provide useful info
  const element = selection[0];
  let styleInfo = `Element: ${element.name || element.type}`;
  
  if ('fills' in element && element.fills && Array.isArray(element.fills)) {
    const fills = element.fills.filter(fill => fill.type === 'SOLID');
    if (fills.length > 0) {
      const color = fills[0].color;
      const hex = `#${Math.round(color.r * 255).toString(16).padStart(2, '0')}${Math.round(color.g * 255).toString(16).padStart(2, '0')}${Math.round(color.b * 255).toString(16).padStart(2, '0')}`;
      styleInfo += ` | Fill: ${hex.toUpperCase()}`;
    }
  }
  
  if ('strokeWeight' in element && element.strokeWeight) {
    styleInfo += ` | Stroke: ${element.strokeWeight}px`;
  }
  
  figma.notify(styleInfo);
  
  // Scroll to and focus the element
  figma.viewport.scrollAndZoomIntoView([element]);
}

// Keep the plugin running indefinitely
console.log('Figma Shortcuts Plugin loaded');