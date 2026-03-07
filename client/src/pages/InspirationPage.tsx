import React, { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useWeddingStore } from '../store/weddingStore';
import type { MoodImage } from '@shared/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Plus, Image as ImageIcon, Link as LinkIcon, UploadCloud, X, ZoomIn, Trash2 } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const INSPIRATION_TAGS = ['Dress', 'Venue', 'Flowers', 'Cake', 'Decor', 'Hair', 'Makeup', 'Rings', 'Other'];

const SortableImage = ({ image, onClick, onDelete }: { image: MoodImage, onClick: () => void, onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative mb-4 break-inside-avoid group rounded-xl overflow-hidden cursor-move border border-gray-100 shadow-sm hover:shadow-warm transition-all"
      {...attributes}
      {...listeners}
    >
      <img
        src={image.url}
        alt={image.tag || 'Inspiration'}
        className="w-full object-cover"
        loading="lazy"
        onPointerDown={() => {
          // If they click the image directly (not dragging), open lightbox
          // We can't entirely block drag, but we can detect a short click versus a drag if needed, 
          // or just put a dedicated 'Expand' button overlay
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <button
            onPointerDown={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 bg-red-500/90 text-white rounded hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between pointer-events-auto">
          {image.tag && (
            <span className="bg-white/90 text-charcoal text-xs px-2 py-1 rounded-md font-medium">
              {image.tag}
            </span>
          )}
          <button
            onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
            className="p-1.5 bg-white/90 text-charcoal rounded hover:bg-white transition-colors ml-auto shadow-sm"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function InspirationPage() {
  const {
    moodImages, fetchMoodImages, uploadMoodImage, addMoodImageUrl,
    updateMoodImage, deleteMoodImage
  } = useWeddingStore();

  useEffect(() => {
    fetchMoodImages();
  }, [fetchMoodImages]);

  const [activeTag, setActiveTag] = useState<string>('All');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [tagInput, setTagInput] = useState<string>('Decor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lightboxImage, setLightboxImage] = useState<MoodImage | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<MoodImage | null>(null);

  const [saving, setSaving] = useState(false);

  // Local state for optimistic sorting
  const [items, setItems] = useState<MoodImage[]>([]);

  useEffect(() => {
    // Only update local items if the lengths differ or no drag is in progress 
    // to avoid flickering. For simplicity, just sync:
    setItems([...moodImages].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [moodImages]);

  const filteredItems = useMemo(() => {
    if (activeTag === 'All') return items;
    return items.filter(img => img.tag === activeTag);
  }, [items, activeTag]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      
      setItems(newItems);

      // Now sync the new sortOrders to the backend
      try {
        await Promise.all(
          newItems.map((img, index) => {
            if (img.sortOrder !== index) {
              return updateMoodImage(img.id, { sortOrder: index });
            }
            return Promise.resolve();
          })
        );
      } catch {
        toast.error('Failed to save new order');
        fetchMoodImages(); // rollback
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (uploadMode === 'file') {
        const file = fileInputRef.current?.files?.[0];
        if (!file) throw new Error('Please select a file');
        if (file.size > 5 * 1024 * 1024) throw new Error('File must be under 5MB');
        await uploadMoodImage(file, tagInput);
        toast.success('Image uploaded');
      } else {
        if (!urlInput) throw new Error('Please enter a URL');
        await addMoodImageUrl({ url: urlInput, tag: tagInput });
        toast.success('Image added');
      }
      setIsUploadModalOpen(false);
      setUrlInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to add image');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      await deleteMoodImage(imageToDelete.id);
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setIsDeleteModalOpen(false);
      setImageToDelete(null);
    }
  };

  const allTags = ['All', ...INSPIRATION_TAGS];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold text-charcoal">Inspiration Board</h1>
        <Button onClick={() => setIsUploadModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Inspiration
        </Button>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 hide-scrollbar">
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTag === t
                ? 'bg-charcoal text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-charcoal hover:text-charcoal shadow-sm'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="card text-center py-20 flex flex-col items-center justify-center border-dashed">
          <div className="w-16 h-16 bg-blush-50 rounded-full flex items-center justify-center mb-4 text-blush-300">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-charcoal">No inspiration yet</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto mb-6">
            Upload images or paste URLs to start building your vision board.
          </p>
          <Button onClick={() => setIsUploadModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add Image
          </Button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filteredItems.map((img) => (
                <SortableImage
                  key={img.id}
                  image={img}
                  onClick={() => setLightboxImage(img)}
                  onDelete={() => { setImageToDelete(img); setIsDeleteModalOpen(true); }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload Modal */}
      <Modal open={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Add Inspiration">
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                uploadMode === 'file' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              <UploadCloud className="w-4 h-4" /> Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                uploadMode === 'url' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              <LinkIcon className="w-4 h-4" /> Paste URL
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div className="space-y-2">
              <label className="label">Select Image (Max 5MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                ref={fileInputRef}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blush-50 file:text-blush-700 hover:file:bg-blush-100 transition-colors"
                required
              />
            </div>
          ) : (
            <Input
              label="Image URL"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
            />
          )}

          <div>
            <label className="label">Category Tag</label>
            <select
              className="input bg-white"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              required
            >
              {INSPIRATION_TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Add Image
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              className="absolute -top-12 right-0 sm:-right-12 sm:-top-8 p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.tag || 'Inspiration'}
              className="max-h-[85vh] w-auto max-w-full rounded-lg shadow-2xl object-contain"
            />
            {lightboxImage.tag && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md">
                {lightboxImage.tag}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image from your inspiration board?"
        confirmLabel="Delete"
      />
    </div>
  );
}
