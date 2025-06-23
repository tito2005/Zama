<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

// Redirect if already logged in
if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitizeInput($_POST['name'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $terms = isset($_POST['terms']);
    
    // Validation
    if (empty($name) || empty($email) || empty($password) || empty($confirmPassword)) {
        $error = 'All fields are required';
    } elseif ($password !== $confirmPassword) {
        $error = 'Passwords do not match';
    } elseif (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters long';
    } elseif (!$terms) {
        $error = 'You must agree to the Terms of Service and Privacy Policy';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address';
    } else {
        $result = register($name, $email, $password);
        if ($result['success']) {
            $success = true;
        } else {
            $error = $result['message'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - ZAMA</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/auth.css">
    <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <?php if ($success): ?>
                <div class="success-message">
                    <div class="success-icon">✓</div>
                    <h2>Check your email</h2>
                    <p>We've sent a verification link to your email address. Please click the link to activate your account.</p>
                    <a href="login.php" class="btn btn-primary">Back to Sign In</a>
                </div>
            <?php else: ?>
                <div class="auth-header">
                    <div class="logo-icon">Z</div>
                    <h1>Join ZAMA</h1>
                    <p>Create your account and start building</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-error">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>

                <form method="POST" class="auth-form">
                    <div class="form-group">
                        <label for="name">Full name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            required 
                            value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>"
                            placeholder="Enter your full name"
                        >
                    </div>

                    <div class="form-group">
                        <label for="email">Email address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required 
                            value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                            placeholder="Enter your email"
                        >
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="password-input">
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                minlength="8"
                                placeholder="Create a password"
                            >
                            <button type="button" class="password-toggle" onclick="togglePassword('password')">
                                <i class="icon-eye"></i>
                            </button>
                        </div>
                        <div class="form-hint">Must be at least 8 characters long</div>
                    </div>

                    <div class="form-group">
                        <label for="confirm_password">Confirm password</label>
                        <div class="password-input">
                            <input 
                                type="password" 
                                id="confirm_password" 
                                name="confirm_password" 
                                required 
                                placeholder="Confirm your password"
                            >
                            <button type="button" class="password-toggle" onclick="togglePassword('confirm_password')">
                                <i class="icon-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox">
                            <input type="checkbox" name="terms" required>
                            <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></span>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-primary btn-full">Create account</button>

                    <div class="divider">
                        <span>Or continue with</span>
                    </div>

                    <div class="social-buttons">
                        <button type="button" class="btn btn-social">
                            <i class="icon-google"></i>
                            Google
                        </button>
                        <button type="button" class="btn btn-social">
                            <i class="icon-facebook"></i>
                            Facebook
                        </button>
                    </div>
                </form>

                <div class="auth-footer">
                    <span>Already have an account? </span>
                    <a href="login.php">Sign in</a>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script src="assets/js/auth.js"></script>
</body>
</html>