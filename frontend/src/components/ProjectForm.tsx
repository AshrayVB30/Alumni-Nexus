import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface Project {
  title?: string;
  description?: string;
  tech_stack: string[];
  github_link?: string;
}

interface ProjectFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectForm({ projects, onChange }: ProjectFormProps) {
  const addProject = () => {
    onChange([...projects, { title: '', description: '', tech_stack: [], github_link: '' }]);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-700">Projects (Optional)</h3>
        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          onClick={addProject}
          className="h-8 px-3 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Project
        </Button>
      </div>

      {projects.map((proj, index) => (
        <Card key={index} className="relative bg-slate-50 border-dashed border-slate-300 shadow-none">
          <button 
            type="button" 
            onClick={() => removeProject(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <CardContent className="pt-6 space-y-3">
            <Input 
              placeholder="Project Title" 
              value={proj.title || ''} 
              onChange={(e) => updateProject(index, 'title', e.target.value)}
              className="h-9 rounded-xl"
            />
            <textarea 
              placeholder="Description" 
              value={proj.description || ''} 
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 min-h-[80px]"
            />
            <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Tech Stack (comma separated)" 
                  value={proj.tech_stack?.join(', ') || ''} 
                  onChange={(e) => updateProject(index, 'tech_stack', e.target.value.split(',').map(s => s.trim()))}
                  className="h-9 rounded-xl"
                />
                <Input 
                  placeholder="GitHub Link" 
                  value={proj.github_link || ''} 
                  onChange={(e) => updateProject(index, 'github_link', e.target.value)}
                  className="h-9 rounded-xl"
                />
            </div>
          </CardContent>
        </Card>
      ))}

      {projects.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-sm text-slate-400">No projects added yet.</p>
        </div>
      )}
    </div>
  );
}
