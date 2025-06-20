import { Form, useActionData, useNavigation } from '@remix-run/react';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImportedProject {
  id: string;
  name: string;
  totalFiles: number;
  totalSize: number;
  files: Array<{
    path: string;
    content: string;
    size: number;
    type: 'file' | 'folder';
  }>;
}

interface ProjectImportProps {
  onImportComplete?: (project: ImportedProject) => void;
}

export function ProjectImport({ onImportComplete }: ProjectImportProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ 
    error?: string; 
    success?: boolean; 
    project?: ImportedProject;
  }>();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewProject, setPreviewProject] = useState<ImportedProject | null>(null);
  
  const isUploading = navigation.state === 'submitting';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setPreviewProject(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  // Handle successful import
  if (actionData?.success && actionData.project) {
    if (!previewProject) {
      setPreviewProject(actionData.project);
    }
  }

  const handleConfirmImport = () => {
    if (previewProject) {
      onImportComplete?.(previewProject);
      setPreviewProject(null);
      setSelectedFile(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (previewProject) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zama-surface rounded-2xl shadow-xl border border-zama-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-zama-border bg-gradient-to-r from-zama-primary to-zama-accent">
            <h2 className="text-xl font-bold text-white">Project Preview</h2>
            <p className="text-blue-100 text-sm">Review your project before importing</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-zama-surface-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-zama-text-primary">{previewProject.name}</div>
                <div className="text-sm text-zama-text-secondary">Project Name</div>
              </div>
              <div className="bg-zama-surface-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-zama-text-primary">{previewProject.totalFiles}</div>
                <div className="text-sm text-zama-text-secondary">Files</div>
              </div>
              <div className="bg-zama-surface-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-zama-text-primary">{formatBytes(previewProject.totalSize)}</div>
                <div className="text-sm text-zama-text-secondary">Total Size</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zama-text-primary mb-4">File Structure</h3>
              <div className="bg-zama-surface-secondary rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  {previewProject.files
                    .filter(file => file.type === 'file')
                    .slice(0, 50) // Show first 50 files
                    .map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center justify-between py-1 px-2 hover:bg-zama-border rounded text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="i-ph:file w-4 h-4 text-zama-text-secondary" />
                          <span className="text-zama-text-primary">{file.path}</span>
                        </div>
                        <span className="text-zama-text-secondary text-xs">{formatBytes(file.size)}</span>
                      </motion.div>
                    ))}
                  {previewProject.files.filter(f => f.type === 'file').length > 50 && (
                    <div className="text-center py-2 text-zama-text-secondary text-sm">
                      ... and {previewProject.files.filter(f => f.type === 'file').length - 50} more files
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmImport}
                className="flex-1 bg-gradient-to-r from-zama-primary to-zama-accent text-white py-3 px-6 rounded-lg font-semibold hover:from-zama-primary-dark hover:to-zama-accent transition-all duration-200"
              >
                Import Project
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPreviewProject(null);
                  setSelectedFile(null);
                }}
                className="px-6 py-3 border border-zama-border text-zama-text-primary rounded-lg font-semibold hover:bg-zama-surface-secondary transition-all duration-200"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zama-surface rounded-2xl shadow-xl border border-zama-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-zama-border">
          <h2 className="text-xl font-bold text-zama-text-primary">Import Project</h2>
          <p className="text-zama-text-secondary text-sm">Upload a ZIP archive to import your project</p>
        </div>

        <div className="p-6">
          {actionData?.error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {actionData.error}
            </motion.div>
          )}

          <Form method="post" encType="multipart/form-data">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                isDragActive
                  ? 'border-zama-primary bg-blue-50'
                  : selectedFile
                  ? 'border-zama-success bg-green-50'
                  : 'border-zama-border hover:border-zama-primary hover:bg-zama-surface-secondary'
              }`}
            >
              <input {...getInputProps()} name="projectFile" />
              
              <div className="space-y-4">
                {selectedFile ? (
                  <>
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-zama-success to-zama-primary rounded-full flex items-center justify-center">
                      <div className="i-ph:check w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-zama-text-primary">{selectedFile.name}</p>
                      <p className="text-zama-text-secondary">{formatBytes(selectedFile.size)}</p>
                    </div>
                    <p className="text-sm text-zama-text-secondary">
                      Click upload to process this file, or drag another file to replace it
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-zama-primary to-zama-accent rounded-full flex items-center justify-center">
                      <div className="i-ph:upload w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-zama-text-primary">
                        {isDragActive ? 'Drop your file here' : 'Drag & drop your project archive'}
                      </p>
                      <p className="text-zama-text-secondary">or click to browse files</p>
                    </div>
                    <div className="text-sm text-zama-text-secondary">
                      <p>Supported formats: ZIP</p>
                      <p>Maximum size: 100MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-zama-primary to-zama-accent text-white py-3 px-6 rounded-lg font-semibold hover:from-zama-primary-dark hover:to-zama-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="i-svg-spinners:90-ring-with-bg w-5 h-5 mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Upload & Preview'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="px-6 py-3 border border-zama-border text-zama-text-primary rounded-lg font-semibold hover:bg-zama-surface-secondary transition-all duration-200"
                >
                  Clear
                </motion.button>
              </motion.div>
            )}
          </Form>

          <div className="mt-8 bg-zama-surface-secondary rounded-lg p-4">
            <h3 className="font-semibold text-zama-text-primary mb-2">Supported Project Types</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-zama-text-secondary">
              <div>• React / Next.js</div>
              <div>• Vue / Nuxt.js</div>
              <div>• Angular</div>
              <div>• Svelte / SvelteKit</div>
              <div>• Node.js</div>
              <div>• Python</div>
              <div>• PHP</div>
              <div>• Static HTML/CSS/JS</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}