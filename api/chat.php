<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/auth.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$messages = $input['messages'] ?? [];

if (empty($messages)) {
    jsonResponse(['error' => 'Messages are required'], 400);
}

$user = getCurrentUser();
if (!$user) {
    jsonResponse(['error' => 'User not found'], 404);
}

// Estimate tokens for the request
$requestText = implode(' ', array_column($messages, 'content'));
$estimatedTokens = estimateTokens($requestText);

// Check if user has enough tokens
if (!canUseTokens($user['id'], $estimatedTokens)) {
    jsonResponse([
        'error' => 'Token limit exceeded. Please upgrade your plan or wait for daily reset.'
    ], 429);
}

try {
    // Prepare the request to Groq API
    $groqMessages = array_map(function($msg) {
        return [
            'role' => $msg['role'],
            'content' => $msg['content']
        ];
    }, $messages);

    $requestData = [
        'model' => 'llama3-8b-8192',
        'messages' => $groqMessages,
        'temperature' => 0.7,
        'max_tokens' => 4096,
        'stream' => false
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, GROQ_API_URL);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        jsonResponse(['error' => 'AI service unavailable'], 503);
    }

    $responseData = json_decode($response, true);
    
    if (!$responseData || !isset($responseData['choices'][0]['message']['content'])) {
        jsonResponse(['error' => 'Invalid response from AI service'], 500);
    }

    $aiResponse = $responseData['choices'][0]['message']['content'];
    $responseTokens = estimateTokens($aiResponse);
    
    // Update token usage
    updateTokenUsage($user['id'], $estimatedTokens + $responseTokens);

    jsonResponse([
        'message' => [
            'role' => 'assistant',
            'content' => $aiResponse
        ]
    ]);

} catch (Exception $e) {
    error_log('Chat API error: ' . $e->getMessage());
    jsonResponse(['error' => 'Internal server error'], 500);
}

function estimateTokens($text) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return ceil(strlen($text) / 4);
}
?>