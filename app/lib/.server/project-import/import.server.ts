import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';

export interface ImportedFile {
  path: string;
  content: string;
  size: number;
  type: 'file' | 'folder';
}

export interface ImportResult {
  id: string;
  name: string;
  files: ImportedFile[];
  totalFiles: number;
  totalSize: number;
  createdAt: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.md', '.txt', '.env', '.gitignore',
  '.py', '.php', '.rb', '.go', '.rs', '.java',
  '.c', '.cpp', '.h', '.hpp', '.cs', '.swift',
  '.kt', '.dart', '.r', '.sql', '.sh', '.bat',
  '.yml', '.yaml', '.toml', '.ini', '.cfg',
  '.xml', '.svg', '.dockerfile', '.makefile'
];

export async function extractZipFile(buffer: ArrayBuffer): Promise<ImportResult> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(buffer);
    
    const files: ImportedFile[] = [];
    let totalSize = 0;
    
    // Process each file in the zip
    for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
      if (zipEntry.dir) {
        // Add folder entry
        files.push({
          path: relativePath,
          content: '',
          size: 0,
          type: 'folder'
        });
        continue;
      }
      
      // Check file extension
      const extension = getFileExtension(relativePath);
      if (!ALLOWED_EXTENSIONS.includes(extension) && !isTextFile(relativePath)) {
        console.log(`Skipping file with unsupported extension: ${relativePath}`);
        continue;
      }
      
      // Get file content
      const content = await zipEntry.async('text');
      const size = content.length;
      
      // Check individual file size
      if (size > MAX_FILE_SIZE) {
        throw new Error(`File ${relativePath} is too large (${formatBytes(size)}). Maximum allowed size is ${formatBytes(MAX_FILE_SIZE)}.`);
      }
      
      totalSize += size;
      
      // Check total size
      if (totalSize > MAX_TOTAL_SIZE) {
        throw new Error(`Total project size is too large (${formatBytes(totalSize)}). Maximum allowed size is ${formatBytes(MAX_TOTAL_SIZE)}.`);
      }
      
      files.push({
        path: relativePath,
        content,
        size,
        type: 'file'
      });
    }
    
    const result: ImportResult = {
      id: uuidv4(),
      name: extractProjectName(files),
      files,
      totalFiles: files.filter(f => f.type === 'file').length,
      totalSize,
      createdAt: new Date().toISOString()
    };
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract zip file. Please ensure it\'s a valid zip archive.');
  }
}

export async function extractRarFile(buffer: ArrayBuffer): Promise<ImportResult> {
  // For RAR files, we would need a different library like node-7z
  // For now, we'll throw an error suggesting ZIP format
  throw new Error('RAR files are not currently supported. Please convert your archive to ZIP format.');
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot).toLowerCase();
}

function isTextFile(filename: string): boolean {
  const textFiles = [
    'readme', 'license', 'changelog', 'contributing',
    'dockerfile', 'makefile', 'gemfile', 'rakefile',
    'procfile', 'requirements.txt', 'package.json',
    'composer.json', 'cargo.toml', 'go.mod'
  ];
  
  const baseName = filename.toLowerCase().split('/').pop() || '';
  return textFiles.some(pattern => baseName.includes(pattern));
}

function extractProjectName(files: ImportedFile[]): string {
  // Try to find package.json for project name
  const packageJson = files.find(f => f.path.endsWith('package.json'));
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson.content);
      if (pkg.name) return pkg.name;
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  
  // Try to find the root folder name
  const rootFolders = files
    .filter(f => f.type === 'folder' && !f.path.includes('/'))
    .map(f => f.path.replace('/', ''));
  
  if (rootFolders.length === 1) {
    return rootFolders[0];
  }
  
  // Default name
  return `imported-project-${Date.now()}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateImportFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum allowed size is ${formatBytes(MAX_TOTAL_SIZE)}.`
    };
  }
  
  // Check file type
  const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
  if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.zip')) {
    return {
      valid: false,
      error: 'Only ZIP files are currently supported. Please convert your archive to ZIP format.'
    };
  }
  
  return { valid: true };
}

// Store imported projects temporarily (in production, use proper database)
const importedProjects: Map<string, ImportResult> = new Map();

export function storeImportedProject(project: ImportResult): void {
  importedProjects.set(project.id, project);
  
  // Clean up old imports after 1 hour
  setTimeout(() => {
    importedProjects.delete(project.id);
  }, 60 * 60 * 1000);
}

export function getImportedProject(id: string): ImportResult | null {
  return importedProjects.get(id) || null;
}

export function deleteImportedProject(id: string): void {
  importedProjects.delete(id);
}