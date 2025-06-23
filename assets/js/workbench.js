// Workbench functionality for ZAMA platform

class WorkbenchManager {
    constructor() {
        this.currentView = 'code';
        this.showTerminal = false;
        this.files = new Map();
        this.currentFile = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupTabs();
        this.setupTerminal();
        this.loadMockFiles();
    }

    setupElements() {
        this.workbenchPanel = document.getElementById('workbench-panel');
        this.codeView = document.getElementById('code-view');
        this.previewView = document.getElementById('preview-view');
        this.terminalPanel = document.getElementById('terminal-panel');
        this.fileTreeContent = document.getElementById('file-tree-content');
        this.fileBreadcrumb = document.getElementById('file-breadcrumb');
        this.codeEditor = document.getElementById('editor-textarea');
        this.previewIframe = document.getElementById('preview-iframe');
    }

    setupEventListeners() {
        // Toggle workbench
        const toggleWorkbench = document.getElementById('toggle-workbench');
        if (toggleWorkbench) {
            toggleWorkbench.addEventListener('click', () => {
                this.toggleWorkbench();
            });
        }

        // Close workbench
        const closeWorkbench = document.getElementById('close-workbench');
        if (closeWorkbench) {
            closeWorkbench.addEventListener('click', () => {
                this.hideWorkbench();
            });
        }

        // Toggle terminal
        const toggleTerminal = document.getElementById('toggle-terminal');
        if (toggleTerminal) {
            toggleTerminal.addEventListener('click', () => {
                this.toggleTerminal();
            });
        }

        // Close terminal
        const closeTerminal = document.getElementById('close-terminal');
        if (closeTerminal) {
            closeTerminal.addEventListener('click', () => {
                this.hideTerminal();
            });
        }

        // File actions
        const saveFile = document.getElementById('save-file');
        if (saveFile) {
            saveFile.addEventListener('click', () => {
                this.saveCurrentFile();
            });
        }

        const resetFile = document.getElementById('reset-file');
        if (resetFile) {
            resetFile.addEventListener('click', () => {
                this.resetCurrentFile();
            });
        }

        // Preview refresh
        const refreshPreview = document.getElementById('refresh-preview');
        if (refreshPreview) {
            refreshPreview.addEventListener('click', () => {
                this.refreshPreview();
            });
        }

        // Code editor changes
        if (this.codeEditor) {
            this.codeEditor.addEventListener('input', () => {
                this.handleEditorChange();
            });
        }
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        if (terminalInput) {
            terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand(terminalInput.value);
                    terminalInput.value = '';
                }
            });
        }
    }

    toggleWorkbench() {
        const isVisible = this.workbenchPanel.style.display !== 'none';
        if (isVisible) {
            this.hideWorkbench();
        } else {
            this.showWorkbench();
        }
    }

    showWorkbench() {
        this.workbenchPanel.style.display = 'flex';
        this.workbenchPanel.classList.add('animate-slide-left');
    }

    hideWorkbench() {
        this.workbenchPanel.style.display = 'none';
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-view`).classList.add('active');

        this.currentView = tab;

        if (tab === 'preview') {
            this.updatePreview();
        }
    }

    toggleTerminal() {
        this.showTerminal = !this.showTerminal;
        
        if (this.showTerminal) {
            this.terminalPanel.style.display = 'flex';
            this.terminalPanel.classList.add('animate-slide-up');
        } else {
            this.hideTerminal();
        }
    }

    hideTerminal() {
        this.showTerminal = false;
        this.terminalPanel.style.display = 'none';
    }

    loadMockFiles() {
        // Mock file structure
        const mockFiles = {
            'package.json': {
                type: 'file',
                content: JSON.stringify({
                    name: 'zama-project',
                    version: '1.0.0',
                    scripts: {
                        dev: 'vite',
                        build: 'vite build'
                    },
                    dependencies: {
                        react: '^18.0.0',
                        'react-dom': '^18.0.0'
                    }
                }, null, 2)
            },
            'src/App.jsx': {
                type: 'file',
                content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ZAMA</h1>
        <p>Your AI-powered development platform</p>
      </header>
    </div>
  );
}

export default App;`
            },
            'src/main.jsx': {
                type: 'file',
                content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`
            },
            'src/index.css': {
                type: 'file',
                content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}`
            },
            'index.html': {
                type: 'file',
                content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ZAMA Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
            }
        };

        // Store files
        Object.entries(mockFiles).forEach(([path, file]) => {
            this.files.set(path, file);
        });

        this.renderFileTree();
    }

    renderFileTree() {
        if (!this.fileTreeContent) return;

        const fileStructure = this.buildFileStructure();
        this.fileTreeContent.innerHTML = this.renderFileStructureHTML(fileStructure);

        // Add click listeners to files
        this.fileTreeContent.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.getAttribute('data-path');
                this.openFile(path);
            });
        });
    }

    buildFileStructure() {
        const structure = {};
        
        this.files.forEach((file, path) => {
            const parts = path.split('/');
            let current = structure;
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                
                if (i === parts.length - 1) {
                    // File
                    current[part] = { type: 'file', path };
                } else {
                    // Directory
                    if (!current[part]) {
                        current[part] = { type: 'directory', children: {} };
                    }
                    current = current[part].children;
                }
            }
        });
        
        return structure;
    }

    renderFileStructureHTML(structure, depth = 0) {
        let html = '';
        
        Object.entries(structure).forEach(([name, item]) => {
            const indent = depth * 20;
            
            if (item.type === 'directory') {
                html += `
                    <div class="folder-item" style="padding-left: ${indent}px">
                        <i class="icon-folder"></i>
                        <span>${name}</span>
                    </div>
                    ${this.renderFileStructureHTML(item.children, depth + 1)}
                `;
            } else {
                html += `
                    <div class="file-item" data-path="${item.path}" style="padding-left: ${indent}px">
                        <i class="icon-file"></i>
                        <span>${name}</span>
                    </div>
                `;
            }
        });
        
        return html;
    }

    openFile(path) {
        const file = this.files.get(path);
        if (!file) return;

        this.currentFile = path;
        
        // Update breadcrumb
        this.updateBreadcrumb(path);
        
        // Load content into editor
        if (this.codeEditor) {
            this.codeEditor.value = file.content;
        }

        // Highlight selected file
        this.fileTreeContent.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        });
        this.fileTreeContent.querySelector(`[data-path="${path}"]`).classList.add('selected');
    }

    updateBreadcrumb(path) {
        if (!this.fileBreadcrumb) return;

        const parts = path.split('/');
        const breadcrumbHTML = parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            return `<span class="breadcrumb-item ${isLast ? 'active' : ''}">${part}</span>`;
        }).join('<span class="breadcrumb-separator">/</span>');

        this.fileBreadcrumb.innerHTML = breadcrumbHTML;
    }

    handleEditorChange() {
        if (!this.currentFile) return;

        const file = this.files.get(this.currentFile);
        if (file) {
            file.modified = true;
            file.content = this.codeEditor.value;
        }

        // Update file tree to show modified state
        const fileItem = this.fileTreeContent.querySelector(`[data-path="${this.currentFile}"]`);
        if (fileItem) {
            fileItem.classList.add('modified');
        }
    }

    saveCurrentFile() {
        if (!this.currentFile) return;

        const file = this.files.get(this.currentFile);
        if (file) {
            file.modified = false;
            
            // Remove modified state from file tree
            const fileItem = this.fileTreeContent.querySelector(`[data-path="${this.currentFile}"]`);
            if (fileItem) {
                fileItem.classList.remove('modified');
            }

            window.zamaApp?.showNotification('File saved successfully', 'success');
        }
    }

    resetCurrentFile() {
        if (!this.currentFile) return;

        // In a real implementation, this would reload the original content
        window.zamaApp?.showNotification('File reset to last saved version', 'info');
    }

    updatePreview() {
        if (this.previewIframe) {
            // Mock preview update
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ZAMA Preview</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .container { max-width: 800px; margin: 0 auto; }
                        h1 { color: #3B82F6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>ZAMA Project Preview</h1>
                        <p>This is a mock preview of your project.</p>
                        <p>In a real implementation, this would show the actual running application.</p>
                    </div>
                </body>
                </html>
            `;
            
            this.previewIframe.srcdoc = htmlContent;
        }
    }

    refreshPreview() {
        this.updatePreview();
        window.zamaApp?.showNotification('Preview refreshed', 'info');
    }

    executeCommand(command) {
        const terminalOutput = this.terminalPanel.querySelector('.terminal-output');
        
        // Add command to output
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line';
        commandLine.innerHTML = `<span class="terminal-prompt">$ </span>${command}`;
        terminalOutput.appendChild(commandLine);

        // Mock command execution
        const outputLine = document.createElement('div');
        outputLine.className = 'terminal-line terminal-output-line';
        
        switch (command.toLowerCase()) {
            case 'ls':
                outputLine.textContent = 'package.json  src/  index.html';
                break;
            case 'npm run dev':
                outputLine.innerHTML = `
                    <div>Starting development server...</div>
                    <div>Local: http://localhost:3000</div>
                    <div>Ready in 1.2s</div>
                `;
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                return;
            default:
                outputLine.textContent = `Command '${command}' not found`;
        }
        
        terminalOutput.appendChild(outputLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

// Initialize workbench manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('workbench-panel')) {
        window.workbenchManager = new WorkbenchManager();
    }
});