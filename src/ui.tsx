import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Types
interface Properties {
  name: string;
  type: string;
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
}

interface Shortcut {
  key: string;
  description: string;
  action: string;
}

// Shortcut definitions
const shortcuts: Shortcut[] = [
  // Original Figma shortcuts
  { key: '~', description: 'Open Properties Panel', action: '~' },
  { key: 'Alt+S', description: 'Copy Element Size', action: 'alt+s' },
  { key: '1-0', description: 'Change Page Background Color', action: 'number-key' },
  { key: 'Alt+1/2/3', description: 'Change Layout Guide Style', action: 'alt+layout' },
  
  // New custom shortcuts
  { key: 'Ctrl+H', description: 'Toggle Hide/Show selected layer', action: 'toggle-hide-layer' },
  { key: 'C+S', description: 'Paste copied size to selected element', action: 'paste-size' },
  { key: 'Left Click + V', description: 'Open style and variable', action: 'open-style-variable' }
];

const App: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [properties, setProperties] = useState<Properties | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [copiedSize, setCopiedSize] = useState<{width: number, height: number} | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());

  // Handle messages from the main plugin code
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('UI received message:', event.data);
      const msg = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'listeners-ready':
          console.log('Keyboard listeners are ready');
          break;
        case 'show-properties':
          console.log('Showing properties:', msg.properties);
          setProperties(msg.properties);
          setShowProperties(true);
          break;
        case 'size-copied':
          console.log('Size copied:', msg.size);
          setCopiedSize(msg.size);
          setTimeout(() => setCopiedSize(null), 3000);
          break;
        case 'layer-hidden':
          if (msg.layerId) {
            setHiddenLayers(prev => new Set([...prev, msg.layerId]));
          }
          break;
        case 'layer-shown':
          if (msg.layerId) {
            setHiddenLayers(prev => {
              const newSet = new Set(prev);
              newSet.delete(msg.layerId);
              return newSet;
            });
          }
          break;
        default:
          console.log('Unknown message type:', msg.type);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Focus management state
  const [isPluginFocused, setIsPluginFocused] = useState(true);
  const [lastShortcutUsed, setLastShortcutUsed] = useState<string | null>(null);

  // Mouse and keyboard event listeners with improved focus handling
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        setIsMouseDown(true);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        setIsMouseDown(false);
      }
    };

    const handleFocus = () => {
      setIsPluginFocused(true);
      console.log('Plugin window focused - shortcuts active');
    };

    const handleBlur = (event: FocusEvent) => {
      // Don't change focus state if blurring to another element within the plugin
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (relatedTarget && document.contains(relatedTarget)) {
        return;
      }
      setIsPluginFocused(false);
      console.log('Plugin window lost focus - shortcuts inactive');
    };
    
    const handleVisibilityChange = () => {
      // Maintain focus state when tab switching
      if (!document.hidden) {
        setIsPluginFocused(true);
        console.log('Tab became visible - reactivating shortcuts');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent interference with text inputs and other interactive elements
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      console.log('Key pressed:', event.key, 'Alt:', event.altKey, 'Ctrl:', event.ctrlKey, 'Shift:', event.shiftKey, 'Mouse down:', isMouseDown);
      
      let shortcutAction = '';
      let shortcutData: any = {};
      let shortcutDisplay = '';
      let shouldPreventDefault = false;
      
      // Global shortcuts that work regardless of focus
      if (event.ctrlKey && event.key.toLowerCase() === 'h') {
        shouldPreventDefault = true;
        shortcutAction = 'toggle-hide-layer';
        shortcutDisplay = 'Ctrl+H (Toggle Hide)';
      } else if (event.altKey && event.key.toLowerCase() === 's') {
        shouldPreventDefault = true;
        shortcutAction = 'alt+s';
        shortcutDisplay = 'Alt+S (Copy Size)';
      } else if (event.key.toLowerCase() === 'c' && event.shiftKey && copiedSize) {
        shouldPreventDefault = true;
        shortcutAction = 'paste-size';
        shortcutData.size = copiedSize;
        shortcutDisplay = 'C+S (Paste Size)';
      } else if (isMouseDown && event.key.toLowerCase() === 'v') {
        shouldPreventDefault = true;
        shortcutAction = 'open-style-variable';
        shortcutDisplay = 'Left Click + V';
      }
      // Original shortcuts
      else if (event.key === '~') {
        shortcutAction = '~';
        shortcutDisplay = '~';
      } else if (event.altKey && ['1', '2', '3'].includes(event.key)) {
        shouldPreventDefault = true;
        shortcutAction = 'alt+layout';
        shortcutData.layoutStyle = event.key;
        shortcutDisplay = `Alt+${event.key}`;
      } else if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(event.key) && !event.altKey && !event.ctrlKey) {
        shouldPreventDefault = true;
        shortcutAction = 'number-key';
        shortcutData.colorKey = event.key;
        shortcutDisplay = event.key;
      }
      
      // Only prevent default for our shortcuts to avoid interfering with Figma
      if (shouldPreventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (shortcutAction) {
        console.log('Sending shortcut to plugin:', shortcutAction, shortcutData);
        setLastShortcutUsed(shortcutDisplay);
        setTimeout(() => setLastShortcutUsed(null), 2000);
        
        parent.postMessage({
          pluginMessage: {
            type: 'shortcut-pressed',
            shortcut: shortcutAction,
            data: shortcutData
          }
        }, '*');
      }
    };

    // Use document for global event listening with capture phase
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Auto-focus the plugin window on load with delay
    setTimeout(() => {
      window.focus();
      setIsPluginFocused(true);
    }, 100);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isMouseDown, copiedSize]);

  // Auto-start the plugin on load
  useEffect(() => {
    console.log('Sending start-plugin message');
    parent.postMessage({
      pluginMessage: {
        type: 'start-plugin'
      }
    }, '*');
  }, []);

  const handleToggleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    
    console.log('Toggling minimize:', newMinimized);
    parent.postMessage({
      pluginMessage: {
        type: newMinimized ? 'minimize-ui' : 'maximize-ui'
      }
    }, '*');
  };

  const handleClosePlugin = () => {
    console.log('Closing plugin');
    parent.postMessage({
      pluginMessage: {
        type: 'close-plugin'
      }
    }, '*');
  };

  const handleTestButton = () => {
    console.log('Test button clicked!');
    parent.postMessage({
      pluginMessage: {
        type: 'test-message',
        data: 'Hello from UI!'
      }
    }, '*');
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div 
        style={{
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2c2c2c',
          cursor: 'pointer'
        }} 
        onClick={handleToggleMinimize}
      >
        <span style={{ color: 'white', fontSize: '20px' }}>⚡</span>
      </div>
    );
  }

  // Main UI
  return (
    <div style={{
      padding: '16px',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#f8f8f8',
      minHeight: '400px',
      width: '300px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '8px'
      }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Shortcuts Plugin</h2>
        <button
          onClick={handleToggleMinimize}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#666',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          title="Minimize"
        >
          ◦◦
        </button>
      </div>



      {/* Global shortcuts indicator */}
      <div 
        style={{
          fontSize: '11px',
          color: '#2d5a2d',
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#e8f5e8',
          border: '1px solid #c3e6c3',
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
      >
        <span>🌐 Global shortcuts always active!</span>
      </div>

      {/* Last shortcut used indicator */}
      {lastShortcutUsed && (
        <div style={{
          fontSize: '12px',
          color: '#0066cc',
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#e6f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          🎯 Used: {lastShortcutUsed}
        </div>
      )}
      
      <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Available Shortcuts:</h3>
      
      <div style={{ marginBottom: '16px' }}>
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              marginBottom: '4px',
              fontSize: '12px'
            }}
          >
            <span style={{ fontWeight: 500 }}>{shortcut.key}</span>
            <span>{shortcut.description}</span>
          </div>
        ))}
      </div>

      {/* Properties Panel */}
      {showProperties && properties && (
        <div style={{
          backgroundColor: '#f0f8ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#0066cc' }}>Selected Object Properties</h4>
          <div style={{ fontSize: '11px', color: '#333' }}>
            <div><strong>Name:</strong> {properties.name}</div>
            <div><strong>Type:</strong> {properties.type}</div>
            <div><strong>Position:</strong> {properties.x}, {properties.y}</div>
            <div><strong>Size:</strong> {properties.width} × {properties.height}</div>
          </div>
          <button
            onClick={() => setShowProperties(false)}
            style={{
              marginTop: '8px',
              fontSize: '10px',
              padding: '4px 8px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Size copied indicator */}
      {copiedSize && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#155724'
        }}>
          📏 Size copied: {copiedSize.width} × {copiedSize.height}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '12px',
        fontSize: '11px',
        color: '#495057',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '6px', color: '#343a40' }}>📋 How to use shortcuts:</div>
        <div style={{ marginBottom: '4px' }}>• <strong>Global shortcuts:</strong> Work anywhere in Figma without focus requirements</div>
        <div style={{ marginBottom: '4px' }}>• <strong>Ctrl+H:</strong> Toggles hide/show for selected layers</div>
        <div style={{ marginBottom: '4px' }}>• <strong>Alt+S:</strong> Copies size of selected element</div>
        <div style={{ marginBottom: '4px' }}>• <strong>C+S:</strong> Pastes copied size to selected element</div>
        <div style={{ color: '#6c757d', fontSize: '10px', marginTop: '6px' }}>💡 Shortcuts won't interfere with text inputs or Figma's native shortcuts</div>
      </div>
    </div>
  );
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Initialize the React app
console.log('UI script starting...');
console.log('Document ready state:', document.readyState);

function initializeApp() {
  console.log('=== INITIALIZING APP ===');
  console.log('Document ready state:', document.readyState);
  console.log('Available elements:', document.querySelectorAll('*').length);
  
  const container = document.getElementById('react-page');
  console.log('Container element:', container);
  
  if (container) {
    try {
      console.log('Mounting React app...');
      
      // Add immediate visual feedback
      container.innerHTML = '<div style="padding: 16px; font-family: Inter, sans-serif; background: white; height: 100vh;"><h2 style="color: #333;">Loading Shortcuts Plugin...</h2><p style="color: #666;">Initializing React...</p></div>';
      
      const root = createRoot(container);
      root.render(<App />);
      console.log('React app mounted successfully!');
      
    } catch (error) {
      console.error('Error mounting React app:', error);
      // Fallback UI
      container.innerHTML = `
        <div style="padding: 16px; font-family: Inter, sans-serif; background: white; height: 100vh;">
          <h2 style="color: #333; margin: 0 0 16px 0;">Shortcuts Plugin</h2>
          <p style="color: #666; margin: 0 0 16px 0;">Plugin loaded (Fallback Mode)</p>
          <div style="background: #ffebee; padding: 8px; border-radius: 4px; margin: 8px 0; color: #c62828;">
            ❌ React failed to load: ${error}
          </div>
          <button onclick="console.log('Fallback button clicked'); parent.postMessage({pluginMessage: {type: 'test-message', data: 'Fallback mode'}}, '*');" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            Test Fallback Communication
          </button>
        </div>
      `;
    }
  } else {
    console.error('React container not found!');
    console.log('Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    document.body.innerHTML = `
      <div style="padding: 16px; font-family: Inter, sans-serif; background: white; height: 100vh;">
        <h2 style="color: #333;">Shortcuts Plugin</h2>
        <p style="color: #666;">Emergency fallback - no container found</p>
        <div style="background: #ffebee; padding: 8px; border-radius: 4px; margin: 8px 0; color: #c62828;">
          ❌ No react-page container found
        </div>
      </div>
    `;
  }
}

// Enhanced debugging for Figma environment
console.log('=== FIGMA PLUGIN DEBUG START ===');
console.log('Script loaded, document ready state:', document.readyState);
console.log('User agent:', navigator.userAgent);
console.log('Window location:', window.location.href);
console.log('Document body exists:', !!document.body);
console.log('Document head exists:', !!document.head);

// Check if we're in Figma iframe
const isInFigma = window.parent !== window;
console.log('Running in iframe (likely Figma):', isInFigma);

// Force initialization after a short delay to ensure DOM is ready
setTimeout(() => {
  console.log('=== FORCED INITIALIZATION ===');
  console.log('Document ready state after timeout:', document.readyState);
  initializeApp();
}, 100);

if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    initializeApp();
  });
} else {
  console.log('Document already ready, initializing immediately...');
  initializeApp();
}