import { useEffect, useState } from 'react';
import { Plus, Share2, RotateCcw, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGroceryStore } from '../store/useGroceryStore';
import { useUIStore } from '../store/useUIStore';
import { shareList } from '../lib/api';
import { buildListShareText, shareViaNative } from '../lib/shareCard';
import AddItemSheet from '../components/grocery/AddItemSheet';
import GroceryItem from '../components/grocery/GroceryItem';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Chip from '../components/ui/Chip';
import { GROCERY_CATEGORIES } from '../config/constants';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Remaining' },
  { id: 'done', label: 'Done' },
  { id: 'recurring', label: '🔁 Recurring' },
];

export default function GroceryPage() {
  const { lists, items, activeListId, fetchLists, fetchItems, addItem, toggleItem, deleteItem, resetList, createList, setActiveList } = useGroceryStore();
  const { addToast } = useUIStore();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [collapsedCats, setCollapsedCats] = useState({});
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  useEffect(() => {
    if (activeListId) fetchItems(activeListId);
  }, [activeListId, fetchItems]);

  const activeItems = items[activeListId] || [];

  const filteredItems = activeItems.filter((item) => {
    if (filter === 'pending') return !item.is_checked;
    if (filter === 'done') return item.is_checked;
    if (filter === 'recurring') return item.is_recurring;
    return true;
  }).filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()));

  // Group by category
  const grouped = GROCERY_CATEGORIES.reduce((acc, cat) => {
    const catItems = filteredItems.filter((i) => i.category === cat.id);
    if (catItems.length > 0) acc[cat.id] = { ...cat, items: catItems };
    return acc;
  }, {});

  const checkedCount = activeItems.filter((i) => i.is_checked).length;
  const progress = activeItems.length > 0 ? Math.round((checkedCount / activeItems.length) * 100) : 0;

  const handleShare = async () => {
    if (!activeListId) return;
    try {
      const { share_code } = await shareList(activeListId);
      const list = lists.find((l) => l.id === activeListId);
      const text = buildListShareText({
        listName: list?.name || 'Family Grocery',
        items: activeItems,
        shareCode: share_code,
      });
      await shareViaNative({
        title: `${list?.name || 'Grocery'} — Oikos`,
        text,
      });
      addToast(`Shared! Code: ${share_code}`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName.trim());
    setNewListName('');
    setShowNewList(false);
    addToast('List created!', 'success');
  };

  const toggleCategory = (catId) => setCollapsedCats((s) => ({ ...s, [catId]: !s[catId] }));

  const activeList = lists.find((l) => l.id === activeListId);

  return (
    <div className="page-container">
      {/* List selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveList(list.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
              list.id === activeListId
                ? 'bg-saffron-500 text-white border-saffron-500'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {list.name}
          </button>
        ))}
        <button
          onClick={() => setShowNewList(true)}
          className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-saffron-400 hover:text-saffron-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {showNewList && (
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            placeholder="List name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            autoFocus
          />
          <Button size="sm" onClick={handleCreateList}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowNewList(false)}>✕</Button>
        </div>
      )}

      {/* Progress header */}
      {activeList && activeItems.length > 0 && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{checkedCount}/{activeItems.length} items</span>
              {progress === 100 && <span className="ml-2 text-xs text-kgreen-600 dark:text-kgreen-400 font-medium">🎉 All done!</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg bg-money-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-soft hover:bg-money-600 active:scale-95"
              >
                <Share2 size={13} />
                WhatsApp
              </button>
              <button onClick={() => resetList(activeListId)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <RotateCcw size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-money-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {/* Items grouped by category */}
      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={filter === 'all' ? '🛒' : '✅'}
          title={filter === 'all' ? 'Your list is empty' : 'Nothing here'}
          description={filter === 'all' ? 'Add items to get started' : 'Change the filter to see items'}
          action={filter === 'all' && (
            <Button onClick={() => setShowAddSheet(true)}>Add First Item</Button>
          )}
        />
      ) : (
        <AnimatePresence>
          {Object.values(grouped).map((cat) => (
            <motion.div key={cat.id} layout className="mb-3">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center gap-2 px-1 mb-2 group"
              >
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  {cat.icon} {cat.labelFull}
                  <span className="text-xs text-gray-400">({cat.items.length})</span>
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                {collapsedCats[cat.id] ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
              </button>
              <AnimatePresence>
                {!collapsedCats[cat.id] && cat.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    layout
                  >
                    <GroceryItem
                      item={item}
                      onToggle={() => toggleItem(activeListId, item.id)}
                      onDelete={() => deleteItem(activeListId, item.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-saffron-500 hover:bg-saffron-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
      >
        <Plus size={24} />
      </motion.button>

      <AddItemSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={(item) => addItem(activeListId, item)}
        listId={activeListId}
      />
    </div>
  );
}
