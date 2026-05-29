const { GoogleGenerativeAI } = require('@google/generative-ai');

let client;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY?.trim()) return null;
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client;
};

const OCR_MODEL = 'gemini-1.5-flash';

const OCR_PROMPT = `You are a careful OCR + structured-extraction system for Indian household bills (kirana, supermarkets, Blinkit/Zepto/BigBasket/Swiggy Instamart receipts, restaurant bills, utility bills).

Read the bill image and return ONE JSON object only, no markdown, no commentary. Schema:

{
  "vendor": string,                    // store name, best guess
  "vendor_type": "kirana" | "delivery" | "supermarket" | "restaurant" | "utility" | "other",
  "date": "YYYY-MM-DD" | null,
  "currency": "INR",
  "subtotal": number | null,
  "tax": number | null,
  "discount": number | null,
  "total": number | null,              // grand total in ₹
  "items": [
    {
      "name": string,                  // English item name, normalized (e.g. "Tomato", "Toor Dal")
      "name_hi": string | null,        // Hindi name if obvious from context, else null
      "quantity": number,              // numeric quantity, default 1
      "unit": "kg" | "g" | "l" | "ml" | "piece" | "dozen" | "packet",
      "price": number | null,          // total price for that line
      "category": "vegetables" | "fruits" | "dairy" | "staples" | "snacks" | "beverages" | "spices" | "meat" | "bakery" | "household" | "personal_care" | "frozen" | "other"
    }
  ],
  "confidence": "high" | "medium" | "low",
  "notes": string | null               // anything unusual you noticed
}

Rules:
- Ignore promotional text, store header/footer, taxes-as-line-items.
- Combine duplicate item lines if obvious.
- If the bill is not a bill (selfie, random text), return: {"vendor": null, "items": [], "total": null, "confidence": "low", "notes": "not_a_bill"}.
- Numbers must be plain JSON numbers, never strings with ₹ or commas.
- Output VALID JSON only.`;

const stripCodeFence = (text) => {
  let t = String(text || '').trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  return t.trim();
};

const safeJsonParse = (text) => {
  const cleaned = stripCodeFence(text);
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { /* fall through */ }
    }
    throw new Error('OCR returned non-JSON response');
  }
};

const isOcrConfigured = () => Boolean(process.env.GEMINI_API_KEY?.trim());

const extractBill = async ({ imageBase64, mimeType = 'image/jpeg' }) => {
  const c = getClient();
  if (!c) {
    throw new Error('Bill OCR unavailable: GEMINI_API_KEY not set on server');
  }
  const model = c.getGenerativeModel({ model: OCR_MODEL });
  const result = await model.generateContent([
    OCR_PROMPT,
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ]);
  const raw = result.response.text();
  const parsed = safeJsonParse(raw);

  // Sanity-clean the output
  const items = Array.isArray(parsed.items) ? parsed.items.map((i) => ({
    name: String(i.name || '').trim(),
    name_hi: i.name_hi ? String(i.name_hi).trim() : null,
    quantity: Number.isFinite(Number(i.quantity)) && Number(i.quantity) > 0 ? Number(i.quantity) : 1,
    unit: ['kg', 'g', 'l', 'ml', 'piece', 'dozen', 'packet'].includes(i.unit) ? i.unit : 'piece',
    price: Number.isFinite(Number(i.price)) ? Number(i.price) : null,
    category: i.category || 'other',
  })).filter((i) => i.name) : [];

  return {
    vendor: parsed.vendor || null,
    vendor_type: parsed.vendor_type || 'other',
    date: parsed.date || null,
    currency: 'INR',
    subtotal: Number.isFinite(Number(parsed.subtotal)) ? Number(parsed.subtotal) : null,
    tax: Number.isFinite(Number(parsed.tax)) ? Number(parsed.tax) : null,
    discount: Number.isFinite(Number(parsed.discount)) ? Number(parsed.discount) : null,
    total: Number.isFinite(Number(parsed.total)) ? Number(parsed.total) : null,
    items,
    confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
    notes: parsed.notes || null,
  };
};

module.exports = { extractBill, isOcrConfigured };
