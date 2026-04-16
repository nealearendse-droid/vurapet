'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Memory = {
  id: string;
  pet_id: string;
  date: string;
  title: string;
  content: string | null;
  tags: string | null;
  created_at: string;
};

const TAG_OPTIONS = [
  '🐾 First Walk',
  '🏊 First Swim',
  '🎾 Favorite Toy',
  '🎓 Learned a Trick',
  '🎂 Birthday',
  '🏥 Vet Visit',
  '✈️ Trip Together',
  '😂 Funny Moment',
  '❤️ Sweet Moment',
  '📸 Photo Day',
  '🏆 Achievement',
  '🌟 Milestone',
];

export default function MemoryBook({ petId }: { petId: string }) {
  const supabase = createSupabaseBrowserClient();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  async function loadMemories() {
    setLoading(true);

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setMemories(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (petId) loadMemories();
  }, [petId]);

  async function addMemory(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a title for your memory');
      return;
    }

    if (!date) {
      alert('Please select a date');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('memories').insert({
      pet_id: petId,
      date: date,
      title: title.trim(),
      content: content.trim() || null,
      tags: selectedTag || null,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // Reset form
    setTitle('');
    setContent('');
    setSelectedTag('');
    setDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);

    await loadMemories();
  }

  async function deleteMemory(memoryId: string) {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (error) {
      alert(error.message);
    } else {
      await loadMemories();
    }
  }

  // Check if any memory happened "on this day" in a previous year
  const onThisDay = memories.filter((m) => {
    const memDate = new Date(m.date);
    const today = new Date();
    return (
      memDate.getMonth() === today.getMonth() &&
      memDate.getDate() === today.getDate() &&
      memDate.getFullYear() !== today.getFullYear()
    );
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">📸 Memory Book</h2>
          <p className="text-sm text-gray-600 mt-1">
            Capture the moments that make your pet special.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {showForm ? 'Cancel' : '+ New Memory'}
        </button>
      </div>

      {/* On This Day Section */}
      {onThisDay.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-purple-700 mb-2">✨ On This Day...</h3>
          {onThisDay.map((m) => (
            <div key={m.id} className="text-sm text-purple-800">
              <span className="font-medium">{new Date(m.date).getFullYear()}</span> — {m.title}
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Form */}
      {showForm && (
        <form onSubmit={addMemory} className="bg-purple-50 rounded-xl p-6 mb-6 border border-purple-100">
          <h3 className="font-semibold mb-4 text-purple-900">New Memory</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Memory Title *
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-3"
                placeholder="e.g. Buddy's first time at the beach!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                required
                className="w-full border rounded-lg p-3"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                className="w-full border rounded-lg p-3"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">No tag</option>
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tell the story...
            </label>
            <textarea
              className="w-full border rounded-lg p-3"
              rows={4}
              placeholder="Write about this special moment. What happened? Why was it special? What made you smile?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
          >
            {saving ? 'Saving...' : '💜 Save Memory'}
          </button>
        </form>
      )}

      {/* Memories Timeline */}
      {loading ? (
        <p className="text-gray-600">Loading memories...</p>
      ) : memories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">📸</div>
          <p className="text-gray-500 font-medium">No memories yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Start capturing the special moments in your pet's life.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="border rounded-xl p-5 hover:shadow-md transition bg-white"
            >
              {/* Memory Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{memory.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {new Date(memory.date).toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {memory.tags && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        {memory.tags}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMemory(memory.id)}
                  className="text-gray-400 hover:text-red-500 text-sm transition"
                >
                  Delete
                </button>
              </div>

              {/* Memory Content */}
              {memory.content && (
                <p className="text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">
                  {memory.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Memory Count Footer */}
      {memories.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-400">
          💜 {memories.length} {memories.length === 1 ? 'memory' : 'memories'} saved
        </div>
      )}
    </div>
  );
}