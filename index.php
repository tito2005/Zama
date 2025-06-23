<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

$isAuthenticated = isLoggedIn();
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZAMA - AI-Powered Development Platform</title>
    <meta name="description" content="Build amazing applications with ZAMA, the AI-powered development platform that brings your ideas to life.">
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/animations.css">
    <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <?php if ($isAuthenticated): ?>
        <!-- Authenticated User Interface -->
        <div id="app" class="app-container">
            <header class="header">
                <div class="header-content">
                    <div class="logo">
                        <div class="logo-icon">Z</div>
                        <span class="logo-text">ZAMA</span>
                    </div>
                    <div class="header-center">
                        <span id="chat-description" class="chat-description"></span>
                    </div>
                    <div class="header-actions">
                        <button id="toggle-chat" class="header-btn" title="Toggle Chat">
                            <i class="icon-chat"></i>
                        </button>
                        <button id="toggle-workbench" class="header-btn" title="Toggle Workbench">
                            <i class="icon-code"></i>
                        </button>
                        <div class="user-menu">
                            <button class="user-avatar">
                                <?php echo strtoupper(substr($_SESSION['user_name'], 0, 1)); ?>
                            </button>
                            <div class="user-dropdown">
                                <a href="dashboard.php">Dashboard</a>
                                <a href="logout.php">Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main class="main-content">
                <div id="chat-panel" class="chat-panel">
                    <div class="chat-container">
                        <div id="chat-intro" class="chat-intro">
                            <h1>Where ideas begin</h1>
                            <p>Bring ideas to life in seconds or get help on existing projects.</p>
                        </div>
                        
                        <div id="chat-messages" class="chat-messages"></div>
                        
                        <div class="chat-input-container">
                            <div class="chat-input-wrapper">
                                <textarea 
                                    id="chat-input" 
                                    placeholder="How can ZAMA help you today?"
                                    rows="1"
                                ></textarea>
                                <button id="send-btn" class="send-btn" disabled>
                                    <i class="icon-send"></i>
                                </button>
                            </div>
                            <div class="chat-controls">
                                <button id="enhance-btn" class="enhance-btn">
                                    <i class="icon-stars"></i>
                                    <span>Enhance prompt</span>
                                </button>
                                <div class="input-hint">
                                    Use <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
                                </div>
                            </div>
                        </div>

                        <div id="example-prompts" class="example-prompts">
                            <button class="example-prompt">Build a todo app in React using Tailwind</button>
                            <button class="example-prompt">Build a simple blog using Astro</button>
                            <button class="example-prompt">Create a cookie consent form using Material UI</button>
                            <button class="example-prompt">Make a space invaders game</button>
                            <button class="example-prompt">How do I center a div?</button>
                        </div>
                    </div>
                </div>

                <div id="workbench-panel" class="workbench-panel">
                    <div class="workbench-header">
                        <div class="workbench-tabs">
                            <button class="tab-btn active" data-tab="code">Code</button>
                            <button class="tab-btn" data-tab="preview">Preview</button>
                        </div>
                        <div class="workbench-actions">
                            <button id="toggle-terminal" class="workbench-btn">
                                <i class="icon-terminal"></i>
                                Terminal
                            </button>
                            <button id="close-workbench" class="workbench-btn">
                                <i class="icon-close"></i>
                            </button>
                        </div>
                    </div>

                    <div class="workbench-content">
                        <div id="code-view" class="tab-content active">
                            <div class="editor-layout">
                                <div class="file-tree">
                                    <div class="file-tree-header">
                                        <i class="icon-folder"></i>
                                        <span>Files</span>
                                    </div>
                                    <div id="file-tree-content" class="file-tree-content">
                                        <!-- File tree will be populated by JavaScript -->
                                    </div>
                                </div>
                                <div class="editor-main">
                                    <div class="editor-header">
                                        <div id="file-breadcrumb" class="file-breadcrumb"></div>
                                        <div class="editor-actions">
                                            <button id="save-file" class="editor-btn">
                                                <i class="icon-save"></i>
                                                Save
                                            </button>
                                            <button id="reset-file" class="editor-btn">
                                                <i class="icon-reset"></i>
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                    <div id="code-editor" class="code-editor">
                                        <textarea id="editor-textarea" placeholder="Select a file to start editing..."></textarea>
                                    </div>
                                </div>
                            </div>
                            <div id="terminal-panel" class="terminal-panel">
                                <div class="terminal-header">
                                    <div class="terminal-tabs">
                                        <button class="terminal-tab active">
                                            <i class="icon-terminal"></i>
                                            Terminal 1
                                        </button>
                                    </div>
                                    <button id="close-terminal" class="terminal-close">
                                        <i class="icon-chevron-down"></i>
                                    </button>
                                </div>
                                <div id="terminal-content" class="terminal-content">
                                    <div class="terminal-output"></div>
                                    <div class="terminal-input-line">
                                        <span class="terminal-prompt">$ </span>
                                        <input type="text" id="terminal-input" class="terminal-input" placeholder="Enter command...">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="preview-view" class="tab-content">
                            <div class="preview-header">
                                <button id="refresh-preview" class="preview-btn">
                                    <i class="icon-refresh"></i>
                                </button>
                                <div class="preview-url">
                                    <input type="text" id="preview-url-input" value="http://localhost:3000" readonly>
                                </div>
                            </div>
                            <div class="preview-content">
                                <iframe id="preview-iframe" src="about:blank"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Loading Overlay -->
        <div id="loading-overlay" class="loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">Processing...</div>
        </div>

        <!-- Sidebar Menu -->
        <div id="sidebar-menu" class="sidebar-menu">
            <div class="sidebar-header">
                <div class="logo">
                    <div class="logo-icon">Z</div>
                    <span class="logo-text">ZAMA</span>
                </div>
            </div>
            <div class="sidebar-content">
                <a href="/" class="sidebar-btn">
                    <i class="icon-chat"></i>
                    Start new chat
                </a>
                <div class="sidebar-section">
                    <h3>Your Chats</h3>
                    <div id="chat-history" class="chat-history">
                        <!-- Chat history will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

    <?php else: ?>
        <!-- Landing Page for Non-Authenticated Users -->
        <div class="landing-page">
            <!-- Navigation -->
            <nav class="landing-nav">
                <div class="nav-container">
                    <div class="nav-brand">
                        <div class="logo-icon">Z</div>
                        <span class="logo-text">ZAMA</span>
                    </div>
                    <div class="nav-actions">
                        <a href="login.php" class="nav-link">Sign In</a>
                        <a href="register.php" class="btn btn-primary">Get Started</a>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <section class="hero">
                <div class="hero-container">
                    <div class="hero-content">
                        <h1 class="hero-title">
                            Build with <span class="gradient-text">AI Power</span>
                        </h1>
                        <p class="hero-description">
                            Transform your ideas into reality with ZAMA's AI-powered development platform. 
                            Create, deploy, and scale applications faster than ever before.
                        </p>
                        <div class="hero-actions">
                            <a href="register.php" class="btn btn-primary btn-large">Start Building Free</a>
                            <a href="login.php" class="btn btn-secondary btn-large">Sign In</a>
                        </div>
                    </div>

                    <!-- Feature Cards -->
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">⚡</div>
                            <h3>Lightning Fast</h3>
                            <p>Build applications in minutes, not hours. Our AI understands your requirements and generates production-ready code.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🧠</div>
                            <h3>AI-Powered</h3>
                            <p>Leverage advanced AI models to write, debug, and optimize your code automatically.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🚀</div>
                            <h3>Deploy Instantly</h3>
                            <p>Deploy your applications with one click to our global infrastructure.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Stats Section -->
            <section class="stats">
                <div class="stats-container">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">10K+</div>
                            <div class="stat-label">Projects Created</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">50M+</div>
                            <div class="stat-label">Lines of Code</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">99.9%</div>
                            <div class="stat-label">Uptime</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">24/7</div>
                            <div class="stat-label">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="cta">
                <div class="cta-container">
                    <h2>Ready to build the future?</h2>
                    <p>Join thousands of developers who are already building amazing applications with ZAMA.</p>
                    <a href="register.php" class="btn btn-primary btn-large">Start Your Free Trial</a>
                </div>
            </section>

            <!-- Footer -->
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-brand">
                        <div class="logo-icon">Z</div>
                        <span class="logo-text">ZAMA</span>
                    </div>
                    <div class="footer-links">
                        <a href="#privacy">Privacy</a>
                        <a href="#terms">Terms</a>
                        <a href="#support">Support</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 ZAMA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    <?php endif; ?>

    <script src="assets/js/main.js"></script>
    <?php if ($isAuthenticated): ?>
        <script src="assets/js/chat.js"></script>
        <script src="assets/js/workbench.js"></script>
        <script src="assets/js/editor.js"></script>
    <?php endif; ?>
</body>
</html>