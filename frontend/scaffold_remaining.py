import os

base_dir = r"e:\Alumini Project\Alumni Nexus\frontend\src"

marketplace_page = """'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/services/api';

export default function Marketplace() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/')
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Skill Marketplace</h1>
          <p className="text-slate-500">Find real-world projects posted by Alumni</p>
        </div>
        <Button>Post Project</Button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <Card><CardContent className="pt-6"><p>No projects available right now. Check back later!</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((p: any) => (
            <Card key={p._id}>
              <CardHeader>
                <h3 className="font-semibold text-xl">{p.title}</h3>
                <p className="text-sm text-slate-500">Posted by {p.posted_by}</p>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{p.description}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-500">{p.applicants?.length || 0} Applicants</span>
                  <Button variant="primary">Apply Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
"""
with open(os.path.join(base_dir, "app", "marketplace", "page.tsx"), "w") as f:
    f.write(marketplace_page)

profile_page = """'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Profile() {
  const user = useAuthStore(state => state.user);
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.get(`/users/${user.id}`).then(res => {
        if(res.data.profile) {
          setSkills(res.data.profile.skills?.join(', ') || '');
          setExperience(res.data.profile.experience || '');
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArr = skills.split(',').map(s => s.trim()).filter(s => s);
      await api.put(`/users/${user?.id}/profile`, {
        skills: skillsArr,
        interests: [],
        experience: experience
      });
      alert('Profile saved!');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Your Profile</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Edit Details</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
            <Input 
              value={skills} 
              onChange={e => setSkills(e.target.value)} 
              placeholder="e.g. React, Python, Machine Learning" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Experience / Bio</label>
            <textarea 
              className="flex w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 min-h-[100px]"
              value={experience} 
              onChange={e => setExperience(e.target.value)} 
              placeholder="Tell us about yourself..." 
            />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Button onClick={handleSave} isLoading={saving}>Save Profile</Button> 
            <p className="text-xs text-slate-500 mt-2">Saving these details triggers AI FAISS embedding regeneration.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
"""
with open(os.path.join(base_dir, "app", "profile", "page.tsx"), "w") as f:
    f.write(profile_page)

print("Remaining UI complete.")
