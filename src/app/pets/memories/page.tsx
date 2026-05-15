'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

type Memory = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string;
  media_url?: string;
  media_type?: string; // 'image' | 'video'
  pet_id: string;
};

type Pet = { id: string; name: string; species: string; breed: string };

const milestoneEmojis: Record<string, string> = {
  'first walk': '🐾',
  'first swim': '🏊',
  'learned a trick': '🎯',
  'favourite toy': '🧸',
  'birthday': '🎂',
  'adoption day': '🏠',
  'vet visit': '🩺',
  'grooming': '✂️',
};

function getTagEmoji(tags: string) {
  const lower = tags?.toLowerCase() || '';
  for (const [key, emoji] of Object.entries(milestoneEmojis)) {
    if (lower.includes(key)) return emoji;
  }
  return '💛';
}

function MediaPreview({ url, type }: { url: string; type?: string }) {
  if (!url) return null;
  if (type === 'video') {
    return (
      <video
        src={url}
        controls
        className="w-full rounded-xl mt-3 max-h-72 object-cover bg-black"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Memory"
      className="w-full rounded-xl mt-3 max-h-72 object-cover"
    />
  );
}

export default function MemoriesPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    petId: '',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

      const { data: petsData } = await supabase
        .from('pets')
        .select('id, name, species, breed')
        .eq('user_id', session.user.id);

      const petList = petsData || [];
      setPets(petList);

      if (petList.length > 0) {
        setForm(f => ({ ...f, petId: petList[0].id }));
        setSelectedPetId(petList[0].id);
      }

      const petIds = petList.map((p: Pet) => p.id);
      if (petIds.length > 0) {
        const { data: memoriesData } = await supabase
          .from('memories')
          .select('*')
          .in('pet_id', petIds)
          .order('date', { ascending: false });
        setMemories(memoriesData || []);
      }

      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Please upload an image or video file.');
      return;
    }

    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadMedia = async (file: File, petId: string): Promise<string | null> => {
    const supabase = getSupabaseClient();
    const ext = file.name.split('.').pop();
    const fileName = `${petId}/${Date.now()}.${ext}`;

    setUploadProgress(10);

    const { data, error } = await supabase.storage
      .from('memories')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    setUploadProgress(80);

    const { data: urlData } = supabase.storage
      .from('memories')
      .getPublicUrl(data.path);

    setUploadProgress(100);
    return urlData.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress(0);

    const supabase = getSupabaseClient();
        // Check user's plan for memory limit
    const { data: { session } } = await supabase.auth.getSession();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', session.user.id)
      .single();
    
    const userPlan = profile?.subscription_plan || 'free';
    
    // Free plan: only 5 memories allowed
    if (userPlan === 'free') {
      const { count } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('pet_id', form.petId);
      
      if (count && count >= 5) {
        alert('❌ Free plan only allows 5 memories per pet. Upgrade to Pro or Family for unlimited memories.');
        setSaving(false);
        return;
      }
    }

    let uploadedUrl: string | undefined = undefined;
    let uploadedType: string | undefined = undefined;

    if (mediaFile) {
      const url = await uploadMedia(mediaFile, form.petId);
      if (url) {
        uploadedUrl = url;
        uploadedType = mediaType || undefined;
      }
    }

    const { error } = await supabase.from('memories').insert({
      pet_id: form.petId,
      title: form.title,
      content: form.content,
      date: form.date,
      tags: form.tags,
      media_url: uploadedUrl,
      media_type: uploadedType,
    });

    if (!error) {
      const { data } = await supabase
        .from('memories')
        .select('*')
        .in('pet_id', pets.map(p => p.id))
        .order('date', { ascending: false });
      setMemories(data || []);
      setShowForm(false);
      setForm(f => ({ ...f, title: '', content: '', tags: '' }));
      handleRemoveMedia();
    }

    setSaving(false);
    setUploadProgress(0);
  };

  const deleteMemory = async (memoryId: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      const supabase = getSupabaseClient();
      await supabase.from('memories').delete().eq('id', memoryId);
      
      // Refresh the list
      const petIds = pets.map(p => p.id);
      const { data } = await supabase
        .from('memories')
        .select('*')
        .in('pet_id', petIds)
        .order('date', { ascending: false });
      setMemories(data || []);
    }
  };

  const getPetName = (petId: string) =>
    pets.find(p => p.id === petId)?.name || 'Unknown';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📸</div>
          <p style={{ color: '#9ca3af' }} className="font-medium">Loading memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8"
      style={{ color: '#f1f5f9' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#f97316' }}>
            📸 Memory Book
          </h1>
          <p style={{ color: '#94a3b8' }} className="mt-1 text-sm">
            Capture the moments that matter — photos, videos & stories.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(249,115,22,0.35)',
          }}
        >
          + New Memory
        </button>
      </div>

      {/* Add Memory Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl p-6 mb-6 space-y-4"
          style={{
            background: '#1e2530',
            border: '1px solid #2d3748',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <h2 className="font-bold text-lg" style={{ color: '#f1f5f9' }}>
            Add a Memory
          </h2>

          {/* Pet selector */}
          {pets.length > 1 && (
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
                Which pet?
              </label>
              <select
                value={form.petId}
                onChange={e => setForm({ ...form, petId: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                style={{
                  background: '#111827',
                  border: '1px solid #374151',
                  color: '#f1f5f9',
                }}
              >
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
              Title *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. First time at the beach"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
              style={{
                background: '#111827',
                border: '1px solid #374151',
                color: '#f1f5f9',
              }}
              onFocus={e => (e.target.style.borderColor = '#f97316')}
              onBlur={e => (e.target.style.borderColor = '#374151')}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
              What happened? *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe this special moment..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none"
              style={{
                background: '#111827',
                border: '1px solid #374151',
                color: '#f1f5f9',
              }}
              onFocus={e => (e.target.style.borderColor = '#f97316')}
              onBlur={e => (e.target.style.borderColor = '#374151')}
            />
          </div>

          {/* Date & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                style={{
                  background: '#111827',
                  border: '1px solid #374151',
                  color: '#f1f5f9',
                  colorScheme: 'dark',
                }}
                onFocus={e => (e.target.style.borderColor = '#f97316')}
                onBlur={e => (e.target.style.borderColor = '#374151')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
                Tag / Milestone
              </label>
              <input
                type="text"
                placeholder="e.g. first walk"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                style={{
                  background: '#111827',
                  border: '1px solid #374151',
                  color: '#f1f5f9',
                }}
                onFocus={e => (e.target.style.borderColor = '#f97316')}
                onBlur={e => (e.target.style.borderColor = '#374151')}
              />
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#94a3b8' }}>
              Photo or Video
            </label>

            {!mediaPreviewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl flex flex-col items-center justify-center py-8 cursor-pointer transition-all"
                style={{
                  border: '2px dashed #374151',
                  background: '#111827',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#f97316')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = '#374151')}
              >
                <span className="text-3xl mb-2">📁</span>
                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                  Click to upload a photo or video
                </p>
                <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
                  JPG, PNG, GIF, MP4, MOV — max 50MB
                </p>
              </div>
            ) : (
              <div className="relative">
                {mediaType === 'video' ? (
                  <video
                    src={mediaPreviewUrl}
                    controls
                    className="w-full rounded-xl max-h-52 object-cover"
                    style={{ background: '#000' }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaPreviewUrl}
                    alt="Preview"
                    className="w-full rounded-xl max-h-52 object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold transition-all"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  ✕
                </button>
                <p className="text-xs mt-1.5" style={{ color: '#94a3b8' }}>
                  {mediaFile?.name}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Upload progress */}
          {saving && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs" style={{ color: '#94a3b8' }}>
                <span>Uploading media...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: '#1f2937' }}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%`, background: '#f97316' }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(249,115,22,0.3)',
              }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </span>
              ) : '💛 Save Memory'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); handleRemoveMedia(); }}
              className="px-5 py-3 rounded-xl font-medium transition-all"
              style={{
                border: '1px solid #374151',
                color: '#94a3b8',
                background: 'transparent',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Memories List */}
      <div className="space-y-4">
        {memories.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              background: '#1e2530',
              border: '2px dashed #2d3748',
            }}
          >
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#f1f5f9' }}>
              No memories yet
            </h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#64748b' }}>
              Start capturing the moments that make your pet's story special — photos, videos, and stories.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="font-bold px-6 py-3 rounded-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(249,115,22,0.3)',
              }}
            >
              + Add First Memory
            </button>
          </div>
        ) : (
          memories.map(memory => (
            <div
              key={memory.id}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: '#1e2530',
                border: '1px solid #2d3748',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getTagEmoji(memory.tags)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold" style={{ color: '#f1f5f9' }}>{memory.title}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#1f2937', color: '#f97316', border: '1px solid #374151' }}
                    >
                      {getPetName(memory.pet_id)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: '#94a3b8' }}>
                    {memory.content}
                  </p>

                  {/* Media */}
                  {memory.media_url && (
                    <MediaPreview url={memory.media_url} type={memory.media_type} />
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs" style={{ color: '#4b5563' }}>
                      {new Date(memory.date).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    {memory.tags && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}
                      >
                        {memory.tags}
                      </span>
                    )}
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="mt-3 text-xs px-3 py-1 rounded-lg transition-all"
                    style={{ background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    🗑️ Delete Memory
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}