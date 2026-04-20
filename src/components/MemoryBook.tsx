'use client';

import { useEffect, useState, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Memory = {
  id: string;
  pet_id: string;
  date: string;
  title: string;
  content: string | null;
  tags: string | null;
  media_url?: string | null;
  media_type?: 'image' | 'video' | 'audio' | null;
  created_at: string;
};

const TAG_OPTIONS = [
  '🐾 First Walk', '🏊 First Swim', '🎾 Favorite Toy', '🎓 Learned a Trick',
  '🎂 Birthday', '🏥 Vet Visit', '✈️ Trip Together', '😂 Funny Moment',
  '❤️ Sweet Moment', '📸 Photo Day', '🏆 Achievement', '🌟 Milestone',
  '🎙️ First Bark', '🎥 First Video'
];

export default function MemoryBook({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);

  async function loadMemories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });
    if (!error) setMemories(data || []);
    setLoading(false);
  }

  useEffect(() => { if (petId) loadMemories(); }, [petId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { alert('File too large! Max 20MB.'); return; }
    
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    
    if (file.type.startsWith('video/')) setMediaType('video');
    else if (file.type.startsWith('audio/')) setMediaType('audio');
    else if (file.type.startsWith('image/')) setMediaType('image');
  };

  async function addMemory(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return alert('Please enter a title');
    setSaving(true);

    let mediaUrl = null;
    if (mediaFile && mediaType) {
      try {
        const fileName = `${petId}/${Date.now()}`;
        const { data } = await supabase.storage.from('memories').upload(fileName, mediaFile);
        if (data) {
          const { data: urlData } = supabase.storage.from('memories').getPublicUrl(fileName);
          mediaUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert('Failed to upload media. Did you create the "memories" bucket in Supabase?');
      }
    }

    const { error } = await supabase.from('memories').insert({
      pet_id: petId, date, title, content, tags: selectedTag,
      media_url: mediaUrl, media_type: mediaType
    });

    setSaving(false);
    if (!error) {
      setShowForm(false);
      setTitle(''); setContent(''); setMediaFile(null); setMediaPreview(null); setMediaType(null);
      loadMemories();
    } else {
      alert(error.message);
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(128, 0, 128);
    doc.text("VuraPet: The Lifetime Memory Book", 105, 40, { align: "center" });
    
    const tableData = memories.map(m => [
      new Date(m.date).toLocaleDateString(),
      m.title,
      m.tags || '-',
      m.content || ''
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Date', 'Moment', 'Tag', 'Story']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });

    doc.save(`VuraPet_MemoryBook_${new Date().toISOString().slice(0,10)}.pdf`);
    alert("✨ Your Memory Book PDF has been created!");
  };

  const startSlideshow = (startIndex = 0) => {
    const mediaMems = memories.filter(m => m.media_url);
    if (mediaMems.length === 0) return alert('Add photos or videos first!');
    setCurrentSlide(startIndex);
    setShowSlideshow(true);
    setIsPlaying(true);
  };
  
  async function deleteMemory(memoryId: string) {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    const { error } = await supabase.from('memories').delete().eq('id', memoryId);
    if (error) alert(error.message);
    else await loadMemories();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">📸 Memory Book</h2>
          <p className="text-sm text-gray-600">Capture moments forever.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={exportToPDF} className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50">📖 Export PDF</button>
           <button onClick={() => startSlideshow()} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">▶️ Memory Lane</button>
           <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">{showForm ? 'Cancel' : '+ New Memory'}</button>
        </div>
      </div>

      {showSlideshow && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-8">
          <button onClick={() => {setShowSlideshow(false); setIsPlaying(false)}} className="absolute top-4 right-4 text-white text-4xl">×</button>
          <img src={memories.filter(m => m.media_url)[currentSlide]?.media_url} alt="Memory" className="max-h-[90vh] max-w-full rounded" />
        </div>
      )}

      {showForm && (
        <form onSubmit={addMemory} className="bg-purple-50 p-6 rounded-xl mb-6">
          <label className="block text-sm font-bold mb-2 text-purple-700">📎 Upload Photo, Video, or Audio</label>
          <input type="file" accept="image/*,video/*,audio/*" onChange={handleFileChange} className="w-full mb-4 p-2 border rounded bg-white" />
          
          {mediaPreview && (
            <div className="mb-4 bg-white p-2 rounded border">
              {mediaType === 'image' && <img src={mediaPreview} className="max-h-40 rounded" />}
              {mediaType === 'video' && <video src={mediaPreview} controls className="max-h-40 rounded" />}
              {mediaType === 'audio' && <audio src={mediaPreview} controls />}
            </div>
          )}

          <input required placeholder="Title (e.g. First Bark)" className="w-full p-2 border rounded mb-2" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea rows={3} placeholder="Tell the story..." className="w-full p-2 border rounded mb-2" value={content} onChange={e=>setContent(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input type="date" required className="p-2 border rounded" value={date} onChange={e=>setDate(e.target.value)} />
            <select className="p-2 border rounded" value={selectedTag} onChange={e=>setSelectedTag(e.target.value)}>
              <option value="">No Tag</option>
              {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <button disabled={saving} className="w-full bg-purple-600 text-white p-2 rounded font-bold">{saving ? 'Uploading...' : 'Save Memory'}</button>
        </form>
      )}

      <div className="space-y-4">
        {memories.map((m, index) => (
          <div key={m.id} className="border rounded-xl p-4 bg-gray-50 hover:shadow-md transition">
             <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-lg">{m.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{m.date} {m.tags && `• ${m.tags}`}</p>
               </div>
               <button onClick={() => deleteMemory(m.id)} className="text-gray-400 hover:text-red-500 text-sm">Delete</button>
             </div>
             
             {m.media_type === 'image' && <img src={m.media_url!} className="h-48 w-full object-cover rounded mt-2 cursor-pointer" onClick={() => startSlideshow(index)} />}
             {m.media_type === 'video' && <video src={m.media_url!} controls className="h-48 w-full rounded mt-2 bg-black" />}
             {m.media_type === 'audio' && <div className="mt-2"><span className="text-xl mr-2">🎵</span><audio src={m.media_url!} controls /></div>}
             
             <p className="mt-2 text-gray-700 whitespace-pre-line">{m.content}</p>
          </div>
        ))}
        {loading && <p>Loading memories...</p>}
        {!loading && memories.length === 0 && <p className="text-center text-gray-500 p-8">No memories yet. Add your first one!</p>}
      </div>
    </div>
  );
}