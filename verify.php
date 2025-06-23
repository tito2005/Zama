<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

$token = $_GET['token'] ?? '';
$message = '';
$success = false;

if ($token) {
    if (verifyEmail($token)) {
        $success = true;
        $message = 'Email verified successfully! You can now sign in to your account.';
    } else {
        $message = 'Invalid or expired verification token.';
    }
} else {
    $message = 'No verification token provided.';
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - ZAMA</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/auth.css">
    <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo-icon">Z</div>
                <h1><?php echo $success ? 'Email Verified!' : 'Verification Failed'; ?></h1>
            </div>

            <div class="<?php echo $success ? 'alert alert-success' : 'alert alert-error'; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>

            <div class="text-center">
                <a href="login.php" class="btn btn-primary">Go to Sign In</a>
            </div>
        </div>
    </div>
</body>
</html>