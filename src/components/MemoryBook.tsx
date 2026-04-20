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
  
  // Slideshow
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Form
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

  // --- PDF GENERATOR FUNCTION ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title Page
    doc.setFontSize(22);
    doc.setTextColor(128, 0, 128); // Purple color
    doc.text("VuraPet: The Lifetime Memory Book", 105, 40, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Every special moment captured for a lifetime`, 105, 50, { align: "center" });
    
    // Table of Memories
    const tableData = memories.map(m => [
      new Date(m.date).toLocaleDateString(),
      m.title,
      m.tags || '-',
      m.content || ''
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Date', 'Moment', 'Tag', 'The Story']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] }, // Purple header
    });

    doc.save(`VuraPet_MemoryBook_${new Date().toISOString().slice(0,10)}.pdf`);
    alert("✨ Your Memory Book PDF has been created!");
  };

  // Slideshow Logic
  const startSlideshow = () => {
    const mediaMems = memories.filter(m => m.media_url);
    if (mediaMems.length === 0) return alert('Add some photos or videos first!');
    setCurrentSlide(0);
    setShowSlideshow(true);
    setIsPlaying(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    if (file.type.startsWith('video/')) setMediaType('video');
    else if (file.type.startsWith('audio/')) setMediaType('audio');
    else setMediaType('image');
  };

  async function addMemory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    let mediaUrl = null;
    if (mediaFile) {
      const fileName = `${petId}/${Date.now()}`;
      const { data } = await supabase.storage.from('memories').upload(fileName, mediaFile);
      if (data) {
        const { data: publicData } = supabase.storage.from('memories').getPublicUrl(fileName);
        mediaUrl = publicData.publicUrl;
      }
    }

    const { error } = await supabase.from('memories').insert({
      pet_id: petId, date, title, content, tags: selectedTag,
      media_url: mediaUrl, media_type: mediaType
    });

    setSaving(false);
    if (!error) {
      setShowForm(false);
      setTitle(''); setContent(''); setMediaFile(null); setMediaPreview(null);
      loadMemories();
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">📸 Memory Book</h2>
          <p className="text-sm text-gray-600">The life story of your best friend.</p>
        </div>
        <div className="flex gap-2">
          {/* NEW PDF BUTTON */}
          <button
            onClick={exportToPDF}
            className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-bold hover:bg-purple-50 transition flex items-center gap-2"
          >
            📖 Export Book PDF
          </button>
          <button
            onClick={startSlideshow}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition"
          >
            ▶️ Memory Lane
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {showForm ? 'Cancel' : '+ New Memory'}
          </button>
        </div>
      </div>

      {/* Form (Simplified View) */}
      {showForm && (
        <form onSubmit={addMemory} className="bg-purple-50 p-6 rounded-xl mb-6">
           <input type="file" onChange={handleFileChange} className="mb-4 block w-full text-sm" />
           <input placeholder="Moment Title" className="w-full p-2 mb-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
           <textarea placeholder="Tell the story..." className="w-full p-2 mb-2 border rounded" value={content} onChange={e => setContent(e.target.value)} />
           <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">{saving ? 'Saving...' : 'Save Memory'}</button>
        </form>
      )}

      {/* Timeline List */}
      <div className="space-y-4">
        {memories.map((m) => (
          <div key={m.id} className="border rounded-xl p-4 bg-gray-50">
            <h3 className="font-bold text-lg">{m.title}</h3>
            <p className="text-sm text-gray-500">{m.date} • {m.tags}</p>
            {m.media_url && m.media_type === 'image' && <img src={m.media_url} className="h-40 rounded mt-2" />}
            <p className="mt-2 text-gray-700">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}