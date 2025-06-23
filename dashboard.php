<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

requireAuth();
$user = getCurrentUser();

// Calculate token usage stats
$tokenUsagePercentage = ($user['tokens_used'] / $user['tokens_limit']) * 100;
$remainingTokens = $user['tokens_limit'] - $user['tokens_used'];

// Mock recent projects data
$recentProjects = [
    ['id' => 1, 'name' => 'E-commerce Website', 'last_modified' => '2 hours ago', 'status' => 'active'],
    ['id' => 2, 'name' => 'Portfolio Site', 'last_modified' => '1 day ago', 'status' => 'completed'],
    ['id' => 3, 'name' => 'Blog Platform', 'last_modified' => '3 days ago', 'status' => 'active'],
];
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - ZAMA</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="dashboard-sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <div class="logo-icon">Z</div>
                    <span class="logo-text">ZAMA</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <a href="dashboard.php" class="nav-item active">
                    <i class="icon-home"></i>
                    <span>Dashboard</span>
                </a>
                <a href="projects.php" class="nav-item">
                    <i class="icon-folder"></i>
                    <span>Projects</span>
                </a>
                <a href="import.php" class="nav-item">
                    <i class="icon-upload"></i>
                    <span>Import Project</span>
                </a>
                <a href="usage.php" class="nav-item">
                    <i class="icon-chart"></i>
                    <span>Usage</span>
                </a>
                <a href="billing.php" class="nav-item">
                    <i class="icon-credit-card"></i>
                    <span>Billing</span>
                </a>
                <a href="settings.php" class="nav-item">
                    <i class="icon-settings"></i>
                    <span>Settings</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="token-usage">
                    <div class="token-header">
                        <span>Token Usage</span>
                        <span class="plan-badge"><?php echo ucfirst($user['plan']); ?></span>
                    </div>
                    <div class="token-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: <?php echo $tokenUsagePercentage; ?>%"></div>
                        </div>
                        <div class="token-stats">
                            <span><?php echo number_format($user['tokens_used']); ?></span>
                            <span><?php echo number_format($user['tokens_limit']); ?></span>
                        </div>
                    </div>
                    <?php if ($user['plan'] === 'free'): ?>
                        <a href="billing.php" class="upgrade-btn">Upgrade Plan</a>
                    <?php endif; ?>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="dashboard-main">
            <!-- Top Bar -->
            <header class="dashboard-header">
                <button class="mobile-menu-btn">
                    <i class="icon-menu"></i>
                </button>
                <div class="header-actions">
                    <button class="notification-btn">
                        <i class="icon-bell"></i>
                    </button>
                    <div class="user-menu">
                        <button class="user-avatar">
                            <?php echo strtoupper(substr($user['name'], 0, 1)); ?>
                        </button>
                        <div class="user-dropdown">
                            <div class="user-info">
                                <div class="user-name"><?php echo htmlspecialchars($user['name']); ?></div>
                                <div class="user-email"><?php echo htmlspecialchars($user['email']); ?></div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a href="profile.php">Profile</a>
                            <a href="settings.php">Settings</a>
                            <div class="dropdown-divider"></div>
                            <a href="logout.php">Logout</a>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Dashboard Content -->
            <div class="dashboard-content">
                <div class="welcome-section">
                    <h1>Welcome back, <?php echo htmlspecialchars($user['name']); ?>!</h1>
                    <p>Here's what's happening with your ZAMA projects today.</p>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-value"><?php echo number_format($user['tokens_used']); ?></div>
                            <div class="stat-label">Tokens Used Today</div>
                        </div>
                        <div class="stat-icon">
                            <i class="icon-lightning"></i>
                        </div>
                        <div class="stat-change positive">+12%</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-value"><?php echo number_format($remainingTokens); ?></div>
                            <div class="stat-label">Remaining Tokens</div>
                        </div>
                        <div class="stat-icon">
                            <i class="icon-battery"></i>
                        </div>
                        <div class="stat-change"><?php echo number_format(100 - $tokenUsagePercentage, 1); ?>%</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-value">3</div>
                            <div class="stat-label">Active Projects</div>
                        </div>
                        <div class="stat-icon">
                            <i class="icon-folder"></i>
                        </div>
                        <div class="stat-change positive">+1</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-value"><?php echo ucfirst($user['plan']); ?></div>
                            <div class="stat-label">Plan</div>
                        </div>
                        <div class="stat-icon">
                            <i class="icon-crown"></i>
                        </div>
                        <div class="stat-change"><?php echo $user['plan'] === 'free' ? 'Upgrade' : 'Active'; ?></div>
                    </div>
                </div>

                <!-- Token Usage Chart -->
                <div class="chart-section">
                    <div class="section-header">
                        <h2>Token Usage</h2>
                        <span class="reset-time">Resets in <?php echo 24 - date('H'); ?> hours</span>
                    </div>
                    
                    <div class="usage-details">
                        <div class="usage-stats">
                            <span>Daily Usage</span>
                            <span><?php echo number_format($user['tokens_used']); ?> / <?php echo number_format($user['tokens_limit']); ?></span>
                        </div>
                        
                        <div class="usage-bar">
                            <div class="usage-fill" style="width: <?php echo $tokenUsagePercentage; ?>%"></div>
                        </div>
                        
                        <div class="usage-markers">
                            <span>0</span>
                            <span><?php echo number_format($user['tokens_limit'] / 2); ?></span>
                            <span><?php echo number_format($user['tokens_limit']); ?></span>
                        </div>
                    </div>

                    <?php if ($tokenUsagePercentage > 80): ?>
                        <div class="usage-warning">
                            <i class="icon-warning"></i>
                            <span>You're running low on tokens. Consider upgrading your plan.</span>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Recent Projects -->
                <div class="projects-section">
                    <div class="section-header">
                        <h2>Recent Projects</h2>
                        <a href="projects.php" class="view-all-link">View all →</a>
                    </div>

                    <div class="projects-list">
                        <?php foreach ($recentProjects as $project): ?>
                            <div class="project-item">
                                <div class="project-info">
                                    <i class="icon-folder project-icon"></i>
                                    <div class="project-details">
                                        <h3><?php echo htmlspecialchars($project['name']); ?></h3>
                                        <p>Modified <?php echo htmlspecialchars($project['last_modified']); ?></p>
                                    </div>
                                </div>
                                <div class="project-actions">
                                    <span class="status-badge status-<?php echo $project['status']; ?>">
                                        <?php echo ucfirst($project['status']); ?>
                                    </span>
                                    <button class="project-action-btn">
                                        <i class="icon-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>

                        <?php if (empty($recentProjects)): ?>
                            <div class="empty-state">
                                <i class="icon-folder-plus"></i>
                                <p>No projects yet. Start building something amazing!</p>
                                <a href="/" class="btn btn-primary">Create Project</a>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="assets/js/dashboard.js"></script>
</body>
</html>