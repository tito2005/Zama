import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { DashboardLayout } from '~/components/dashboard/DashboardLayout';
import { ProjectImport } from '~/components/import/ProjectImport';
import { requireUserSession, getUserById } from '~/lib/.server/auth/auth.server';
import { extractZipFile, validateImportFile, storeImportedProject } from '~/lib/.server/project-import/import.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const user = await getUserById(session.userId);
  
  if (!user) {
    throw new Response('User not found', { status: 404 });
  }

  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  
  try {
    const formData = await request.formData();
    const file = formData.get('projectFile') as File;
    
    if (!file || file.size === 0) {
      return json({ error: 'Please select a file to import' }, { status: 400 });
    }

    // Validate file
    const validation = validateImportFile(file);
    if (!validation.valid) {
      return json({ error: validation.error }, { status: 400 });
    }

    // Extract and process the file
    const buffer = await file.arrayBuffer();
    const project = await extractZipFile(buffer);
    
    // Store the project temporarily
    storeImportedProject(project);
    
    return json({ success: true, project });
  } catch (error: any) {
    console.error('Import error:', error);
    return json({ error: error.message || 'Failed to import project' }, { status: 500 });
  }
}

export default function ImportProject() {
  const { user } = useLoaderData<typeof loader>();

  const handleImportComplete = (project: any) => {
    // In a real implementation, this would save the project to the user's workspace
    console.log('Project imported successfully:', project);
    
    // Redirect to the new project or projects list
    window.location.href = '/dashboard/projects';
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zama-text-primary">Import Project</h1>
          <p className="text-zama-text-secondary mt-2">
            Upload your project archive to get started with ZAMA
          </p>
        </div>

        <ProjectImport onImportComplete={handleImportComplete} />
      </div>
    </DashboardLayout>
  );
}