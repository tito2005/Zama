<?php
session_start();
require_once '../includes/config.php';
require_once '../includes/auth.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];
$user = getCurrentUser();

switch ($method) {
    case 'GET':
        handleGetFiles();
        break;
    case 'POST':
        handleCreateFile();
        break;
    case 'PUT':
        handleUpdateFile();
        break;
    case 'DELETE':
        handleDeleteFile();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleGetFiles() {
    global $pdo, $user;
    
    $projectId = $_GET['project_id'] ?? null;
    
    if (!$projectId) {
        jsonResponse(['error' => 'Project ID is required'], 400);
    }
    
    $stmt = $pdo->prepare("
        SELECT f.*, p.name as project_name 
        FROM files f 
        JOIN projects p ON f.project_id = p.id 
        WHERE f.project_id = ? AND p.user_id = ?
        ORDER BY f.path
    ");
    $stmt->execute([$projectId, $user['id']]);
    $files = $stmt->fetchAll();
    
    jsonResponse(['files' => $files]);
}

function handleCreateFile() {
    global $pdo, $user;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $projectId = $input['project_id'] ?? null;
    $path = $input['path'] ?? null;
    $content = $input['content'] ?? '';
    $type = $input['type'] ?? 'file';
    
    if (!$projectId || !$path) {
        jsonResponse(['error' => 'Project ID and path are required'], 400);
    }
    
    // Verify project ownership
    $stmt = $pdo->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
    $stmt->execute([$projectId, $user['id']]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Project not found'], 404);
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO files (project_id, path, content, type, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([$projectId, $path, $content, $type]);
        
        $fileId = $pdo->lastInsertId();
        
        jsonResponse([
            'success' => true,
            'file_id' => $fileId,
            'message' => 'File created successfully'
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            jsonResponse(['error' => 'File already exists'], 409);
        }
        jsonResponse(['error' => 'Failed to create file'], 500);
    }
}

function handleUpdateFile() {
    global $pdo, $user;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $fileId = $input['file_id'] ?? null;
    $content = $input['content'] ?? '';
    
    if (!$fileId) {
        jsonResponse(['error' => 'File ID is required'], 400);
    }
    
    // Verify file ownership through project
    $stmt = $pdo->prepare("
        SELECT f.id 
        FROM files f 
        JOIN projects p ON f.project_id = p.id 
        WHERE f.id = ? AND p.user_id = ?
    ");
    $stmt->execute([$fileId, $user['id']]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'File not found'], 404);
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE files SET content = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$content, $fileId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'File updated successfully'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to update file'], 500);
    }
}

function handleDeleteFile() {
    global $pdo, $user;
    
    $fileId = $_GET['file_id'] ?? null;
    
    if (!$fileId) {
        jsonResponse(['error' => 'File ID is required'], 400);
    }
    
    // Verify file ownership through project
    $stmt = $pdo->prepare("
        SELECT f.id 
        FROM files f 
        JOIN projects p ON f.project_id = p.id 
        WHERE f.id = ? AND p.user_id = ?
    ");
    $stmt->execute([$fileId, $user['id']]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'File not found'], 404);
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM files WHERE id = ?");
        $stmt->execute([$fileId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['error' => 'Failed to delete file'], 500);
    }
}
?>