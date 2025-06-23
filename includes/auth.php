<?php
require_once 'config.php';

function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function requireAuth() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

function getCurrentUser() {
    global $pdo;
    
    if (!isLoggedIn()) {
        return null;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

function login($email, $password) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND email_verified = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && verifyPassword($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_plan'] = $user['plan'];
        
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        return true;
    }
    
    return false;
}

function register($name, $email, $password) {
    global $pdo;
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return ['success' => false, 'message' => 'User already exists'];
    }
    
    // Create user
    $hashedPassword = hashPassword($password);
    $verificationToken = generateToken();
    
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, verification_token, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    try {
        $stmt->execute([$name, $email, $hashedPassword, $verificationToken]);
        
        // Send verification email (mock implementation)
        sendVerificationEmail($email, $verificationToken);
        
        return ['success' => true, 'message' => 'Registration successful. Please check your email to verify your account.'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Registration failed'];
    }
}

function sendVerificationEmail($email, $token) {
    // Mock email sending - in production, use a proper email service
    $verificationUrl = APP_URL . "/verify.php?token=" . $token;
    
    // Log the verification URL for development
    error_log("Verification URL for $email: $verificationUrl");
    
    return true;
}

function verifyEmail($token) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE verification_token = ? AND email_verified = 0");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    
    if ($user) {
        $stmt = $pdo->prepare("UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?");
        $stmt->execute([$user['id']]);
        return true;
    }
    
    return false;
}

function logout() {
    session_destroy();
    header('Location: login.php');
    exit;
}

function updateTokenUsage($userId, $tokensUsed) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        UPDATE users 
        SET tokens_used = tokens_used + ?, 
            tokens_reset_date = CASE 
                WHEN DATE(tokens_reset_date) < CURDATE() THEN CURDATE()
                ELSE tokens_reset_date 
            END
        WHERE id = ?
    ");
    
    return $stmt->execute([$tokensUsed, $userId]);
}

function canUseTokens($userId, $requestedTokens) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT tokens_used, tokens_limit, tokens_reset_date 
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        return false;
    }
    
    // Reset daily usage if it's a new day
    if (date('Y-m-d', strtotime($user['tokens_reset_date'])) < date('Y-m-d')) {
        $stmt = $pdo->prepare("UPDATE users SET tokens_used = 0, tokens_reset_date = CURDATE() WHERE id = ?");
        $stmt->execute([$userId]);
        $user['tokens_used'] = 0;
    }
    
    return ($user['tokens_used'] + $requestedTokens) <= $user['tokens_limit'];
}
?>