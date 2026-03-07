import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings } from 'lucide-react';
import { useWeddingStore } from '../store/weddingStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function SettingsPage() {
  const { wedding, updateWedding } = useWeddingStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    partner1Name: '',
    partner2Name: '',
    date: '',
    venueName: '',
    venueAddress: '',
    budget: '',
  });

  useEffect(() => {
    if (wedding) {
      setForm({
        partner1Name: wedding.partner1Name ?? '',
        partner2Name: wedding.partner2Name ?? '',
        date: wedding.date ? wedding.date.split('T')[0] : '',
        venueName: wedding.venueName ?? '',
        venueAddress: wedding.venueAddress ?? '',
        budget: String(wedding.budget ?? 0),
      });
    }
  }, [wedding]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWedding({
        partner1Name: form.partner1Name || null,
        partner2Name: form.partner2Name || null,
        date: form.date || null,
        venueName: form.venueName || null,
        venueAddress: form.venueAddress || null,
        budget: parseFloat(form.budget) || 0,
      });
      toast.success('Wedding details saved!');
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-blush-300" />
        <h1 className="font-heading text-3xl font-semibold text-charcoal">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="card space-y-5">
        <h2 className="font-heading text-xl font-semibold text-charcoal">Wedding Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Partner 1 Name"
            value={form.partner1Name}
            onChange={(e) => handleChange('partner1Name', e.target.value)}
            placeholder="Alex"
          />
          <Input
            label="Partner 2 Name"
            value={form.partner2Name}
            onChange={(e) => handleChange('partner2Name', e.target.value)}
            placeholder="Jordan"
          />
        </div>

        <Input
          label="Wedding Date"
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />

        <Input
          label="Venue Name"
          value={form.venueName}
          onChange={(e) => handleChange('venueName', e.target.value)}
          placeholder="The Grand Ballroom"
        />

        <Input
          label="Venue Address"
          value={form.venueAddress}
          onChange={(e) => handleChange('venueAddress', e.target.value)}
          placeholder="123 Wedding Lane, City, State"
        />

        <Input
          label="Total Budget ($)"
          type="number"
          min="0"
          step="100"
          value={form.budget}
          onChange={(e) => handleChange('budget', e.target.value)}
          placeholder="30000"
        />

        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
