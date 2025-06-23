// Code editor functionality for ZAMA platform

class CodeEditor {
    constructor(container) {
        this.container = container;
        this.textarea = container.querySelector('textarea');
        this.language = 'javascript';
        this.theme = 'light';
        this.init();
    }

    init() {
        this.setupSyntaxHighlighting();
        this.setupAutocompletion();
        this.setupKeyboardShortcuts();
        this.setupLineNumbers();
    }

    setupSyntaxHighlighting() {
        // Basic syntax highlighting using CSS classes
        this.textarea.addEventListener('input', () => {
            this.highlightSyntax();
        });

        this.textarea.addEventListener('scroll', () => {
            this.syncHighlighting();
        });
    }

    highlightSyntax() {
        // This is a simplified syntax highlighter
        // In a real implementation, you'd use a library like Prism.js or CodeMirror
        const content = this.textarea.value;
        
        // Create highlighted version
        let highlighted = content
            .replace(/\b(function|const|let|var|if|else|for|while|return|import|export|class|extends)\b/g, '<span class="keyword">$1</span>')
            .replace(/(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span class="string">$1$2$3</span>')
            .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
            .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

        // Update highlighting overlay (if exists)
        this.updateHighlightingOverlay(highlighted);
    }

    updateHighlightingOverlay(highlighted) {
        let overlay = this.container.querySelector('.syntax-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'syntax-overlay';
            this.container.appendChild(overlay);
        }
        
        overlay.innerHTML = highlighted;
        this.syncHighlighting();
    }

    syncHighlighting() {
        const overlay = this.container.querySelector('.syntax-overlay');
        if (overlay) {
            overlay.scrollTop = this.textarea.scrollTop;
            overlay.scrollLeft = this.textarea.scrollLeft;
        }
    }

    setupAutocompletion() {
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab();
            }
            
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.save();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 'f':
                        e.preventDefault();
                        this.openFind();
                        break;
                }
            }
        });

        // Auto-close brackets and quotes
        this.textarea.addEventListener('input', (e) => {
            this.handleAutoClose(e);
        });
    }

    insertTab() {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        this.textarea.value = value.substring(0, start) + '  ' + value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
    }

    handleAutoClose(e) {
        const openChars = ['(', '[', '{', '"', "'"];
        const closeChars = [')', ']', '}', '"', "'"];
        const pairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'"
        };

        const char = e.data;
        if (openChars.includes(char)) {
            const start = this.textarea.selectionStart;
            const end = this.textarea.selectionEnd;
            const value = this.textarea.value;
            
            if (start === end) { // No selection
                const closeChar = pairs[char];
                this.textarea.value = value.substring(0, start) + closeChar + value.substring(end);
                this.textarea.selectionStart = this.textarea.selectionEnd = start;
            }
        }
    }

    setupKeyboardShortcuts() {
        // Additional keyboard shortcuts
        this.textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'd':
                        e.preventDefault();
                        this.duplicateLine();
                        break;
                    case '/':
                        e.preventDefault();
                        this.toggleComment();
                        break;
                }
            }
        });
    }

    setupLineNumbers() {
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';
        this.container.insertBefore(lineNumbers, this.textarea);

        this.textarea.addEventListener('input', () => {
            this.updateLineNumbers();
        });

        this.textarea.addEventListener('scroll', () => {
            lineNumbers.scrollTop = this.textarea.scrollTop;
        });

        this.updateLineNumbers();
    }

    updateLineNumbers() {
        const lineNumbers = this.container.querySelector('.line-numbers');
        if (!lineNumbers) return;

        const lines = this.textarea.value.split('\n').length;
        const numbersHTML = Array.from({ length: lines }, (_, i) => 
            `<div class="line-number">${i + 1}</div>`
        ).join('');

        lineNumbers.innerHTML = numbersHTML;
    }

    duplicateLine() {
        const start = this.textarea.selectionStart;
        const value = this.textarea.value;
        const lines = value.split('\n');
        
        // Find current line
        let currentLine = 0;
        let charCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= start) {
                currentLine = i;
                break;
            }
            charCount += lines[i].length + 1; // +1 for newline
        }

        // Duplicate the line
        lines.splice(currentLine + 1, 0, lines[currentLine]);
        this.textarea.value = lines.join('\n');
        
        // Move cursor to duplicated line
        const newPosition = charCount + lines[currentLine].length + 1;
        this.textarea.selectionStart = this.textarea.selectionEnd = newPosition;
    }

    toggleComment() {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        // Get selected lines
        const beforeSelection = value.substring(0, start);
        const selection = value.substring(start, end);
        const afterSelection = value.substring(end);
        
        const lines = selection.split('\n');
        const commentedLines = lines.map(line => {
            if (line.trim().startsWith('//')) {
                return line.replace(/^\s*\/\/\s?/, '');
            } else {
                return '// ' + line;
            }
        });
        
        const newSelection = commentedLines.join('\n');
        this.textarea.value = beforeSelection + newSelection + afterSelection;
        
        // Restore selection
        this.textarea.selectionStart = start;
        this.textarea.selectionEnd = start + newSelection.length;
    }

    save() {
        // Trigger save event
        const event = new CustomEvent('editor-save', {
            detail: { content: this.textarea.value }
        });
        this.container.dispatchEvent(event);
    }

    undo() {
        document.execCommand('undo');
    }

    redo() {
        document.execCommand('redo');
    }

    openFind() {
        // Simple find implementation
        const searchTerm = prompt('Find:');
        if (searchTerm) {
            this.find(searchTerm);
        }
    }

    find(searchTerm) {
        const content = this.textarea.value;
        const index = content.indexOf(searchTerm);
        
        if (index !== -1) {
            this.textarea.focus();
            this.textarea.selectionStart = index;
            this.textarea.selectionEnd = index + searchTerm.length;
        } else {
            alert('Text not found');
        }
    }

    setLanguage(language) {
        this.language = language;
        this.highlightSyntax();
    }

    setTheme(theme) {
        this.theme = theme;
        this.container.setAttribute('data-theme', theme);
    }

    getValue() {
        return this.textarea.value;
    }

    setValue(value) {
        this.textarea.value = value;
        this.highlightSyntax();
        this.updateLineNumbers();
    }

    focus() {
        this.textarea.focus();
    }

    getSelection() {
        return {
            start: this.textarea.selectionStart,
            end: this.textarea.selectionEnd,
            text: this.textarea.value.substring(
                this.textarea.selectionStart,
                this.textarea.selectionEnd
            )
        };
    }

    setSelection(start, end) {
        this.textarea.selectionStart = start;
        this.textarea.selectionEnd = end;
        this.textarea.focus();
    }
}

// Initialize code editors when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const editorContainers = document.querySelectorAll('.code-editor');
    editorContainers.forEach(container => {
        new CodeEditor(container);
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeEditor;
}