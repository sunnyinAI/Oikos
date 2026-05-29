// Build a rich WhatsApp-friendly text share for a grocery list.
// Designed to land beautifully in family group chats.

const CATEGORY_EMOJI = {
  dairy: '🥛',
  vegetables: '🥬',
  fruits: '🍎',
  staples: '🌾',
  snacks: '🍪',
  beverages: '🧃',
  spices: '🌶️',
  meat: '🍗',
  bakery: '🍞',
  household: '🧴',
  personal_care: '🧼',
  frozen: '🧊',
  other: '🛒',
};

function emoji(cat) {
  if (!cat) return '•';
  return CATEGORY_EMOJI[cat.toLowerCase?.()] || '•';
}

export function buildListShareText({
  listName = 'Family Grocery',
  items = [],
  shareCode,
  origin,
} = {}) {
  const pending = items.filter((i) => !i.is_checked);
  const done = items.filter((i) => i.is_checked);

  const lines = [];
  lines.push(`🛒 *${listName}* — Omni`);
  lines.push(`_सब कुछ, एक जगह_`);
  lines.push('');

  if (pending.length > 0) {
    lines.push(`📝 *Need to buy (${pending.length}):*`);
    pending.slice(0, 25).forEach((i) => {
      const qty = i.quantity ? ` — ${i.quantity}${i.unit ? ' ' + i.unit : ''}` : '';
      lines.push(`☐ ${emoji(i.category)} ${i.name}${qty}`);
    });
    if (pending.length > 25) lines.push(`…and ${pending.length - 25} more`);
    lines.push('');
  }

  if (done.length > 0) {
    lines.push(`✅ *Already done (${done.length}):*`);
    done.slice(0, 10).forEach((i) => lines.push(`✓ ${i.name}`));
    if (done.length > 10) lines.push(`…and ${done.length - 10} more`);
    lines.push('');
  }

  if (pending.length === 0 && done.length === 0) {
    lines.push('_Empty list — add items in Omni._');
    lines.push('');
  }

  if (shareCode) {
    const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://omni.app');
    lines.push(`👉 Join this list: ${base}/join/${shareCode}`);
    lines.push(`Or open Omni and enter code: *${shareCode}*`);
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Try Web Share API for native sheet; fall back to WA deeplink.
export async function shareViaNative({ title, text, url }) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') return false;
    }
  }
  if (typeof window !== 'undefined') {
    window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
    return true;
  }
  return false;
}
