import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useWeddingStore } from '../store/weddingStore';
import type { SeatingTable, Guest } from '@shared/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Plus, Save, RotateCcw, Edit2, Trash2 } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const TableDroppable = ({ table, onEdit, onDelete }: { table: SeatingTable, onEdit: (t: SeatingTable) => void, onDelete: (t: SeatingTable) => void }) => {
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `drop-${table.id}`,
    data: { type: 'table', table },
  });

  const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
    id: `drag-${table.id}`,
    data: { type: 'table', table },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  const pct = Math.round((table.guests.length / table.capacity) * 100);

  return (
    <div
      ref={(node) => { setDropRef(node); setDragRef(node); }}
      className={`absolute flex flex-col items-center justify-center rounded-full border-4 shadow-sm w-36 h-36 bg-white cursor-move transition-colors ${
        isOver ? 'border-blush-400 bg-blush-50' : 'border-gray-200'
      }`}
      style={{ left: table.posX, top: table.posY, ...style }}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-0 right-0 p-1 flex gap-1 -mt-4 mr-4">
        <button onPointerDown={(e) => { e.stopPropagation(); onEdit(table); }} className="w-5 h-5 bg-white border border-gray-200 rounded text-gray-400 flex justify-center items-center hover:text-charcoal"><Edit2 className="w-3 h-3" /></button>
        <button onPointerDown={(e) => { e.stopPropagation(); onDelete(table); }} className="w-5 h-5 bg-white border border-gray-200 rounded text-gray-400 flex justify-center items-center hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
      </div>

      <div className="font-heading font-bold text-charcoal">{table.name}</div>
      <div className="text-xs text-gray-400 mt-1">{table.guests.length} / {table.capacity}</div>
      
      {/* progress circle visual inside */}
      <div className="absolute inset-2 border-2 border-gray-100 rounded-full pointer-events-none" />
      <svg className="absolute inset-2 w-[8.2rem] h-[8.2rem] pointer-events-none -rotate-90">
        <circle
          cx="65.5"
          cy="65.5"
          r="63"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={395}
          strokeDashoffset={395 - (395 * pct) / 100}
          className="text-blush-400 transition-all duration-300"
        />
      </svg>
    </div>
  );
};

const DraggableGuest = ({ guest }: { guest: Guest }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `guest-${guest.id}`,
    data: { type: 'guest', guest },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: 100,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 bg-white rounded-md border border-gray-200 text-sm shadow-sm hover:border-blush-300 cursor-grab active:cursor-grabbing"
    >
      <div className="font-medium text-charcoal">{guest.firstName} {guest.lastName}</div>
      {guest.dietaryNeeds && <div className="text-xs text-red-400 mt-0.5" title={guest.dietaryNeeds}>Dietary reqs</div>}
    </div>
  );
};

export default function SeatingPage() {
  const {
    guests, tables,
    fetchGuests, fetchTables, createTable, updateTable, deleteTable, updateGuest
  } = useWeddingStore();

  useEffect(() => {
    fetchGuests();
    fetchTables();
  }, [fetchGuests, fetchTables]);

  const [localTables, setLocalTables] = useState<SeatingTable[]>([]);
  
  useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<SeatingTable | null>(null);
  const [form, setForm] = useState<Partial<SeatingTable>>({});

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<SeatingTable | null>(null);

  const [saving, setSaving] = useState(false);

  // Unassigned guests
  const unassigned = useMemo(() => {
    return guests.filter(g => !g.tableId && g.rsvpStatus !== 'DECLINED');
  }, [guests]);

  // Merge table guests locally 
  const displayTables = localTables.map(t => {
    const tGuests = guests.filter(g => g.tableId === t.id);
    return { ...t, guests: tGuests };
  });

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over, delta } = e;
    const type = active.data.current?.type;

    if (type === 'table') {
      const id = String(active.id).replace('drag-', '');
      setLocalTables(prev => prev.map(t => {
        if (t.id === id) {
          return { ...t, posX: Math.max(0, t.posX + delta.x), posY: Math.max(0, t.posY + delta.y) };
        }
        return t;
      }));
    } else if (type === 'guest') {
      const guest = active.data.current?.guest as Guest;
      if (over && over.data.current?.type === 'table') {
        const table = over.data.current?.table as SeatingTable;
        if (table.guests.length < table.capacity && guest.tableId !== table.id) {
          updateGuest(guest.id, { tableId: table.id }).catch(() => toast.error('Failed to assign seat'));
        } else if (table.guests.length >= table.capacity) {
          toast.error('Table is full');
        }
      } else if (!over) {
        // Drop on floor -> unassign
        if (guest.tableId) updateGuest(guest.id, { tableId: '' }).catch(() => toast.error('Failed to unassign seat'));
      }
    }
  };

  const handleSaveFloorPlan = async () => {
    setSaving(true);
    try {
      await Promise.all(localTables.map(t => updateTable(t.id, { posX: t.posX, posY: t.posY })));
      toast.success('Floor plan saved');
    } catch {
      toast.error('Failed to save floor plan');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoAssign = async () => {
    if (unassigned.length === 0) return toast('No unassigned guests');
    const toAssign = [...unassigned];
    // shuffle logic
    toAssign.sort(() => Math.random() - 0.5);

    let assignedCount = 0;
    for (const table of displayTables) {
      const openSeats = table.capacity - table.guests.length;
      if (openSeats > 0) {
        for (let i = 0; i < openSeats && toAssign.length > 0; i++) {
          const guest = toAssign.pop()!;
          await updateGuest(guest.id, { tableId: table.id });
          assignedCount++;
        }
      }
    }
    if (assignedCount > 0) toast.success(`Auto-assigned ${assignedCount} guests`);
    else toast.error('No open seats available');
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await updateTable(editingTable.id, form);
        toast.success('Table updated');
      } else {
        await createTable({ ...form, posX: 50, posY: 50 } as Partial<SeatingTable>);
        toast.success('Table created');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to save table');
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      // unassign guests first
      const tGuests = guests.filter(g => g.tableId === tableToDelete.id);
      await Promise.all(tGuests.map(g => updateGuest(g.id, { tableId: '' })));
      
      await deleteTable(tableToDelete.id);
      toast.success('Table deleted');
      setIsDeleteOpen(false);
      setTableToDelete(null);
    } catch {
      toast.error('Failed to delete table');
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-heading text-3xl font-semibold text-charcoal">Seating Layout</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => { setLocalTables(tables); toast('Reset to last saved', { icon: '↺' }); }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveFloorPlan}
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Layout
            </Button>
            <Button
              onClick={() => { setEditingTable(null); setForm({ capacity: 8 }); setIsModalOpen(true); }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Table
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Guest Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 card flex flex-col overflow-hidden !p-0">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-medium text-charcoal">Unassigned</h2>
              <span className="bg-blush-100 text-blush-800 text-xs px-2 py-0.5 rounded-full font-medium">
                {unassigned.length}
              </span>
            </div>
            
            <div className="p-2 border-b border-gray-100">
              <Button onClick={handleAutoAssign} variant="secondary" className="w-full text-xs" size="sm">
                Auto-assign seats
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {unassigned.length === 0 ? (
                <div className="text-center text-sm text-gray-400 mt-8">
                  All guests are seated!
                </div>
              ) : (
                unassigned.map(g => (
                  <DraggableGuest key={g.id} guest={g} />
                ))
              )}
            </div>
          </div>

          {/* Floor Plan Canvas */}
          <div className="flex-1 card !p-0 overflow-hidden relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] bg-slate-50">
            <div className="absolute inset-0 overflow-auto">
              {displayTables.map(t => (
                <TableDroppable
                  key={t.id}
                  table={t}
                  onEdit={(table) => { setEditingTable(table); setForm(table); setIsModalOpen(true); }}
                  onDelete={(table) => { setTableToDelete(table); setIsDeleteOpen(true); }}
                />
              ))}

              {displayTables.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="h-16 w-16 bg-blush-50 rounded-full flex items-center justify-center mb-4 text-blush-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-400">Add tables to build your floor plan</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTable ? 'Edit Table' : 'Add Table'} size="sm">
        <form onSubmit={handleSaveTable} className="space-y-4">
          <Input
            label="Table Name / Number"
            required
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Table 1, Head Table"
          />
          <Input
            label="Seat Capacity"
            type="number"
            required
            min={1}
            max={20}
            value={form.capacity || ''}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteTable}
        title="Delete Table"
        message={`Are you sure you want to delete ${tableToDelete?.name}? Seated guests will be unassigned.`}
        confirmLabel="Delete"
      />
    </DndContext>
  );
}
