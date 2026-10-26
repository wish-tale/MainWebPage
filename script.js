document.documentElement.classList.add("js");

/* =====================================================================
   SETTINGS: edit these in one place
   ===================================================================== */
const CONFIG = {
  brand: "WishTale",
  email: "hello@yourdomain.com",   // used for the "Send by Email" buttons
  phone: "+91 00000 00000",
  city: "Your City, India",
  weddingMax: 499,                  // wedding invitations must not exceed this (checked in the console)
  pageSize: 12                      // designs shown before "Show more designs"
};

const CATEGORIES = {
  wedding:  { label: "Wedding" },
  birthday: { label: "Birthday" },
  love:     { label: "Love" },
  family:   { label: "Family" },
  friends:  { label: "Friends" },
  festival: { label: "Festivals" },
  websites: { label: "Personalised Websites" }
};

/* Colour palettes for the sample designs.
   a, b = background gradient · i = text on the background
   x = accent on the background · d = deeper accent for light panels */
const PALETTES = {
  blush:      { a: "#FDE4EA", b: "#F7D6DF", i: "#5A2F3B", x: "#D96C85", d: "#B94A66" },
  peach:      { a: "#FFE9DA", b: "#FFDCC8", i: "#5C3524", x: "#E98979", d: "#C25A47" },
  cream:      { a: "#FFFBF5", b: "#F6E6D8", i: "#4A3A33", x: "#C9956B", d: "#9A6A45" },
  rose:       { a: "#F9C9D4", b: "#E7889F", i: "#3E1722", x: "#FFF4F0", d: "#8E2F4B" },
  coral:      { a: "#FFD2C6", b: "#E98979", i: "#3E1E17", x: "#FFF4EC", d: "#B4503F" },
  sand:       { a: "#F7ECDD", b: "#E9D3B8", i: "#4A382C", x: "#B7774F", d: "#8F5A36" },
  marigold:   { a: "#FFF0C7", b: "#FFD58A", i: "#5A3A12", x: "#D9822B", d: "#A8601A" },
  honey:      { a: "#FFE2A8", b: "#F3B785", i: "#4A2C12", x: "#B2432F", d: "#A5361F" },
  wine:       { a: "#8E3B4A", b: "#5E2431", i: "#FFEFE6", x: "#F7D6DF", d: "#8E3B4A" },
  terracotta: { a: "#C9674F", b: "#8F3F2E", i: "#FFF3EA", x: "#FFDCC8", d: "#8F3F2E" }
};

const LANG_CODES = { en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu", mr: "Marathi", gu: "Gujarati", pa: "Punjabi", ml: "Malayalam", kn: "Kannada", ur: "Urdu" };

// Sample greeting lines for the preview's language switch (please have them proofread before real use)
const PHRASES = {
  English:   { invite: "You are warmly invited", love: "With love" },
  Hindi:     { invite: "आप सादर आमंत्रित हैं", love: "प्यार के साथ" },
  Bengali:   { invite: "আপনি সাদরে আমন্ত্রিত", love: "ভালোবাসার সঙ্গে" },
  Tamil:     { invite: "உங்களை அன்புடன் அழைக்கிறோம்", love: "அன்புடன்" },
  Telugu:    { invite: "మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నాము", love: "ప్రేమతో" },
  Marathi:   { invite: "आपण सस्नेह आमंत्रित आहात", love: "प्रेमाने" },
  Gujarati:  { invite: "આપ સહર્ષ આમંત્રિત છો", love: "પ્રેમ સહ" },
  Punjabi:   { invite: "ਤੁਹਾਨੂੰ ਦਿਲੋਂ ਸੱਦਾ ਹੈ", love: "ਪਿਆਰ ਸਹਿਤ" },
  Malayalam: { invite: "നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു", love: "സ്നേഹത്തോടെ" },
  Kannada:   { invite: "ನಿಮ್ಮನ್ನು ಪ್ರೀತಿಯಿಂದ ಆಹ್ವಾನಿಸುತ್ತೇವೆ", love: "ಪ್ರೀತಿಯಿಂದ" },
  Urdu:      { invite: "آپ کو محبت سے مدعو کیا جاتا ہے", love: "محبت کے ساتھ" }
};
const INVITE_CATS = ["wedding", "birthday", "family", "festival"];

/* =====================================================================
   TEMPLATE DATA: add, edit or remove designs here.
   id     unique id (later: use it for previews, orders and payments)
   cat    wedding | birthday | love | family | friends | festival | websites
   occ    short occasion label
   name   design title            price  number in rupees
   from   true = shown as "From ₹…" (custom work, quoted separately)
   added  date added (YYYY-MM-DD), used by "Newest"
   v      layout style: arch floral frame stripe ticket confetti letter polaroid
                        circle timeline heart minimal lantern baby ribbon browser
   p      colour palette name (see PALETTES)
   m      emoji motif          t, s  main text and small text shown on the design
   l      optional languages, e.g. "en hi ta" (default: English + Hindi)
   img    optional image path, e.g. "images/w01.jpg" (replaces the CSS design)
   demoUrl optional interactive experience URL, shown in an isolated preview iframe
   offerBadge optional visual demo badge (does not change the template price)
   ===================================================================== */
const TEMPLATES = [
  // ---------- Wedding ----------
  { id: "w01", cat: "wedding", occ: "Save the Date", name: "Blossom Save the Date", price: 99, added: "2026-09-18", v: "floral", p: "blush", m: "🌸", t: "Aarav & Meera", s: "14 · 02 · 2027" },
  { id: "w02", cat: "wedding", occ: "Wedding Invitation", name: "Royal Arch Invitation", price: 449, added: "2026-06-10", v: "arch", p: "sand", m: "🪷", t: "Aarav & Meera", s: "Saturday · 14 February", l: "en hi ur pa" },
  { id: "w03", cat: "wedding", occ: "Haldi", name: "Marigold Haldi", price: 249, offerBadge: "20% OFF", added: "2026-08-02", v: "circle", p: "marigold", m: "🌼", t: "Haldi Ceremony", s: "Morning of 13 February", l: "en hi mr gu" },
  { id: "w04", cat: "wedding", occ: "Mehendi", name: "Henna Mehendi Afternoon", price: 249, added: "2026-07-21", v: "frame", p: "honey", m: "🌿", t: "Mehendi Afternoon", s: "Songs · Henna · Chai", l: "en hi mr te" },
  { id: "w05", cat: "wedding", occ: "Sangeet", name: "Sangeet Night", price: 299, added: "2026-10-05", v: "confetti", p: "coral", m: "🎶", t: "Sangeet Night", s: "Music · Dance · Dinner", l: "en hi pa" },
  { id: "w06", cat: "wedding", occ: "Engagement", name: "Ring Ceremony", price: 199, offerBadge: "40% OFF", added: "2026-07-05", v: "heart", p: "rose", m: "💍", t: "Aarav ♡ Meera", s: "Our engagement" },
  { id: "w07", cat: "wedding", occ: "Wedding Invitation", name: "Alpona Border Invitation", price: 279, added: "2026-09-02", v: "frame", p: "peach", m: "🪷", t: "Aarav & Meera", s: "শুভ বিবাহ", l: "en bn hi" },
  { id: "w08", cat: "wedding", occ: "Wedding Invitation", name: "Jasmine & Silk Invitation", price: 399, added: "2026-08-24", v: "stripe", p: "blush", m: "🌺", t: "Aarav & Meera", s: "Wedding · 9:30 AM", l: "en ta te kn ml" },
  { id: "w09", cat: "wedding", occ: "Reception", name: "Reception Evening", price: 349, added: "2026-10-12", v: "lantern", p: "wine", m: "✨", t: "Wedding Reception", s: "Dinner · Dancing · 7 PM" },
  { id: "w10", cat: "wedding", occ: "Wedding RSVP", name: "Wedding RSVP Card", price: 149, added: "2026-06-28", v: "ticket", p: "peach", m: "💌", t: "Will you join us?", s: "Kindly reply by 10 January", l: "en hi ta te kn ml" },
  { id: "w11", cat: "wedding", occ: "Wedding Invitation", name: "Simple Floral Invitation", price: 149, added: "2026-06-02", v: "minimal", p: "cream", m: "🌷", t: "Aarav & Meera", s: "14 · 02 · 2027", l: "en hi mr gu" },
  { id: "w12", cat: "wedding", occ: "Couple Story", name: "Our Story & Wedding Day", price: 499, offerBadge: "60% OFF", added: "2026-10-18", v: "timeline", p: "blush", m: "💞", t: "How we met", s: "Then, now, forever", l: "en hi bn gu" },
  { id: "w13", cat: "wedding", occ: "Save the Date", name: "Palace Save the Date", price: 129, added: "2026-09-26", v: "arch", p: "honey", m: "🏰", t: "Save the Date", s: "14 · 02 · 2027" },

  // ---------- Birthday ----------
  { id: "b01", cat: "birthday", occ: "Birthday Invitation", name: "Confetti Cake", price: 79, offerBadge: "20% OFF", added: "2026-08-15", v: "confetti", p: "peach", m: "🎂", t: "Priya turns 25!", s: "Saturday · 7 PM" },
  { id: "b02", cat: "birthday", occ: "Surprise Birthday", name: "Surprise Reveal", price: 149, added: "2026-10-09", v: "ribbon", p: "coral", m: "🎁", t: "A surprise for you", s: "Tap to unwrap" },
  { id: "b03", cat: "birthday", occ: "Milestone Birthday", name: "Golden Milestone", price: 129, added: "2026-07-30", v: "frame", p: "honey", m: "🥂", t: "Fifty & Fabulous", s: "Join the celebration" },
  { id: "b04", cat: "birthday", occ: "First Birthday", name: "Little One's First", price: 99, offerBadge: "60% OFF", added: "2026-09-09", v: "baby", p: "blush", m: "🧸", t: "Aanya is ONE", s: "Tea party · 4 PM" },
  { id: "b05", cat: "birthday", occ: "Birthday Greeting", name: "Balloon Wishes", price: 49, added: "2026-06-18", v: "circle", p: "peach", m: "🎈", t: "Happy Birthday!", s: "Wishing you joy" },
  { id: "b06", cat: "birthday", occ: "Birthday Greeting", name: "Birthday Letter", price: 69, added: "2026-10-20", v: "letter", p: "blush", m: "💌", t: "Dear You,", s: "A little note for your day" },
  { id: "b07", cat: "birthday", occ: "Birthday Page", name: "Birthday Scrapbook", price: 129, offerBadge: "40% OFF", added: "2026-08-08", v: "polaroid", p: "sand", m: "📸", t: "Twenty-One Memories", s: "A year in pictures" },

  // ---------- Love ----------
  { id: "l01", cat: "love", occ: "Anniversary", name: "Anniversary Timeline", price: 199, offerBadge: "40% OFF", added: "2026-09-14", v: "timeline", p: "cream", m: "💑", t: "Our Story So Far", s: "Together since 2019", l: "en hi ta mr", demoUrl: "templetes/anniversarytimeline.html" },
  { id: "l02", cat: "love", occ: "Proposal", name: "Will You Marry Me", price: 179, offerBadge: "20% OFF", added: "2026-10-01", v: "heart", p: "rose", m: "💍", t: "Will you marry me?", s: "A question for you", l: "en hi pa", demoUrl: "templetes/willyoumarryme.html", description: "Experience eight interactive chapters, from a heartfelt letter to the proposal and celebration. Add your own names, memories, photos and licensed music." },
  { id: "l03", cat: "love", occ: "Love Letter", name: "Secret Love Letter", price: 99, added: "2026-07-12", v: "letter", p: "peach", m: "💌", t: "To my love,", s: "Open with care", l: "en hi ur bn", demoUrl: "templetes/secretloveletter.html" },
  { id: "l04", cat: "love", occ: "Romantic Greeting", name: "Rose Garden Greeting", price: 59, added: "2026-06-22", v: "floral", p: "rose", m: "🌹", t: "Forever Yours", s: "Happy Anniversary", demoUrl: "templetes/rosegardengreeting.html" },
  { id: "l05", cat: "love", occ: "For Her", name: "For My Girlfriend", price: 149, offerBadge: "60% OFF", added: "2026-08-28", v: "polaroid", p: "blush", m: "🎀", t: "My Favourite Person", s: "Made for you", l: "en hi bn", demoUrl: "templetes/formygirlfriend.html" },
  { id: "l06", cat: "love", occ: "For Him", name: "For My Boyfriend", price: 149, added: "2026-09-21", v: "stripe", p: "honey", m: "🧡", t: "Reasons I Love You", s: "Ten little reasons", demoUrl: "templetes/formyboyfriend.html" },
  { id: "l07", cat: "love", occ: "Long Distance", name: "Miles Apart, One Link", price: 129, added: "2026-07-26", v: "ticket", p: "cream", m: "✈️", t: "See you soon", s: "12 days to go", demoUrl: "templetes/milesapartonelink.html" },
  { id: "l08", cat: "love", occ: "Couple Page", name: "Our Couple Page", price: 249, added: "2026-10-14", v: "browser", p: "blush", m: "💞", t: "Aarav + Meera", s: "Our little corner", demoUrl: "templetes/ourcouplepage.html" },

  // ---------- Family ----------
  { id: "fa01", cat: "family", occ: "Housewarming", name: "Griha Pravesh", price: 149, added: "2026-08-19", v: "arch", p: "honey", m: "🏡", t: "Griha Pravesh", s: "Join us in our new home", l: "en hi mr gu ta te kn ml" },
  { id: "fa02", cat: "family", occ: "Baby Shower", name: "Baby Shower Bloom", price: 129, offerBadge: "20% OFF", added: "2026-07-17", v: "baby", p: "peach", m: "🍼", t: "Baby Shower", s: "Sweet wishes for mum-to-be" },
  { id: "fa03", cat: "family", occ: "Naming Ceremony", name: "Naming Ceremony", price: 149, added: "2026-09-05", v: "circle", p: "blush", m: "🧸", t: "Welcome, Little One", s: "Naming ceremony", l: "en hi bn ta te" },
  { id: "fa04", cat: "family", occ: "Baby Announcement", name: "Hello, Little One", price: 99, added: "2026-10-07", v: "polaroid", p: "cream", m: "👶", t: "She's here!", s: "Meet our little star" },
  { id: "fa05", cat: "family", occ: "Family Celebration", name: "Family Get-Together", price: 89, added: "2026-06-30", v: "confetti", p: "honey", m: "🍽️", t: "Family Day", s: "Sunday lunch · 1 PM" },
  { id: "fa06", cat: "family", occ: "Housewarming", name: "Housewarming Glow", price: 129, offerBadge: "40% OFF", added: "2026-10-16", v: "lantern", p: "terracotta", m: "🪔", t: "Our New Home", s: "Come celebrate with us" },

  // ---------- Friends ----------
  { id: "fr01", cat: "friends", occ: "Best Friends", name: "Bestie Scrapbook", price: 79, offerBadge: "40% OFF", added: "2026-08-11", v: "polaroid", p: "peach", m: "🌸", t: "Best Friends Forever", s: "Our favourite moments" },
  { id: "fr02", cat: "friends", occ: "Friendship", name: "Friendship Greeting", price: 49, added: "2026-06-14", v: "floral", p: "blush", m: "🌼", t: "Friends Like You", s: "Happy Friendship Day" },
  { id: "fr03", cat: "friends", occ: "Farewell", name: "Farewell Memories", price: 99, added: "2026-09-30", v: "ticket", p: "sand", m: "👋", t: "Until We Meet Again", s: "Farewell wishes" },
  { id: "fr04", cat: "friends", occ: "Congratulations", name: "Big Congratulations", price: 59, added: "2026-08-26", v: "confetti", p: "coral", m: "🎉", t: "Congratulations!", s: "So proud of you" },
  { id: "fr05", cat: "friends", occ: "Graduation", name: "Graduation Day", price: 129, offerBadge: "20% OFF", added: "2026-07-08", v: "frame", p: "cream", m: "🎓", t: "Class of 2026", s: "Congratulations, graduate" },
  { id: "fr06", cat: "friends", occ: "Apology", name: "I'm Really Sorry", price: 49, added: "2026-09-12", v: "minimal", p: "peach", m: "🥺", t: "I'm sorry", s: "Let me make it right" },
  { id: "fr07", cat: "friends", occ: "Thank You", name: "Thank You Note", price: 49, added: "2026-10-03", v: "letter", p: "cream", m: "🌷", t: "Thank you", s: "From the bottom of my heart" },

  // ---------- Festivals & celebrations ----------
  { id: "fe01", cat: "festival", occ: "Festival of Lights", name: "Lamps & Lanterns", price: 69, offerBadge: "20% OFF", added: "2026-10-10", v: "lantern", p: "wine", m: "🪔", t: "Festival of Lights", s: "Warm wishes to you", l: "en hi gu mr" },
  { id: "fe02", cat: "festival", occ: "Harvest Festival", name: "Harvest Greetings", price: 69, added: "2026-07-14", v: "circle", p: "marigold", m: "🌾", t: "Happy Harvest", s: "Joy, thanks & sunshine", l: "en ta pa ml" },
  { id: "fe03", cat: "festival", occ: "Festival of Colours", name: "Spring Colours", price: 79, offerBadge: "60% OFF", added: "2026-08-04", v: "confetti", p: "rose", m: "🎨", t: "Happy Colours!", s: "Let the fun begin" },
  { id: "fe04", cat: "festival", occ: "Seasonal Greeting", name: "Season's Greetings", price: 59, added: "2026-10-19", v: "frame", p: "sand", m: "❄️", t: "Season's Greetings", s: "Warmest wishes" },
  { id: "fe05", cat: "festival", occ: "Festival Greeting", name: "Lantern Night", price: 69, added: "2026-09-27", v: "lantern", p: "terracotta", m: "🏮", t: "Lantern Night", s: "Light up the evening" },
  { id: "fe06", cat: "festival", occ: "Party Invitation", name: "Party Invitation", price: 99, offerBadge: "40% OFF", added: "2026-06-26", v: "ribbon", p: "honey", m: "🥳", t: "You're invited!", s: "Party · Music · Cake" },
  { id: "fe07", cat: "festival", occ: "Business Invitation", name: "Business Invitation", price: 249, added: "2026-08-30", v: "minimal", p: "sand", m: "💼", t: "Annual Gathering", s: "An evening of connection" },

  // ---------- Personalised websites (quoted separately, shown as "From ₹…") ----------
  { id: "ws01", cat: "websites", occ: "Digital Scrapbook", name: "Digital Scrapbook", price: 599, from: true, added: "2026-09-23", v: "polaroid", p: "sand", m: "📖", t: "Our Scrapbook", s: "Photos · Notes · Songs" },
  { id: "ws02", cat: "websites", occ: "Memory Timeline", name: "Memory Lane Timeline", price: 799, from: true, added: "2026-10-11", v: "timeline", p: "peach", m: "⏳", t: "Memory Lane", s: "Every moment in order" },
  { id: "ws03", cat: "websites", occ: "Celebration Page", name: "Celebration Page", price: 699, from: true, added: "2026-08-13", v: "browser", p: "coral", m: "🎊", t: "Let's Celebrate", s: "Your own web page" },
  { id: "ws04", cat: "websites", occ: "Invitation Website", name: "Custom Invitation Website", price: 899, from: true, added: "2026-09-07", v: "browser", p: "blush", m: "💌", t: "You're Invited", s: "A page for your guests" },
  { id: "ws05", cat: "websites", occ: "Wedding Website", name: "Wedding Website", price: 999, from: true, added: "2026-10-15", v: "browser", p: "cream", m: "💒", t: "Aarav & Meera", s: "Our wedding website" },
  { id: "ws06", cat: "websites", occ: "Surprise Website", name: "Birthday Surprise Website", price: 499, from: true, added: "2026-07-02", v: "ribbon", p: "rose", m: "🎁", t: "Surprise!", s: "A page just for them" }
];

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = (id) => TEMPLATES.find(t => t.id === id);
const langsOf = (t) => (t.l || "en hi").split(" ").map(c => LANG_CODES[c]);
const priceText = (t) => (t.from ? "From " : "") + "₹" + t.price.toLocaleString("en-IN");
const mailto = (subject, body) => `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

// Warns in the browser console (F12) if a price breaks the rules
function validatePrices() {
  TEMPLATES.forEach(t => {
    if (t.cat === "wedding" && t.price > CONFIG.weddingMax) console.warn(`[WishTale] Wedding price above ₹${CONFIG.weddingMax}: ${t.id} ${t.name}`);
    if (!t.from && t.price > 299) console.warn(`[WishTale] Price above ₹299: ${t.id} ${t.name}`);
  });
}

/* =====================================================================
   SAMPLE DESIGN (CSS artwork) used by cards, preview, checkout and hero.
   If a template has an "img", that image is shown instead.
   ===================================================================== */
function artHTML(t, o = {}) {
  if (t.img) return `<img class="art-img" src="${esc(t.img)}" alt="${esc(t.name)}" loading="lazy">`;
  const p = PALETTES[t.p] || PALETTES.blush;
  const style = `--a:${p.a};--b:${p.b};--i:${p.i};--x:${p.x};--d:${p.d}`;
  const aria = o.label ? `role="img" aria-label="${esc(t.name)} design preview"` : `aria-hidden="true"`;
  const corners = t.v === "floral" ? ["tl", "tr", "bl", "br"].map(c => `<span class="cn ${c}">${t.m}</span>`).join("") : "";
  return `<div class="art v-${esc(t.v)}" style="${style}" ${aria}>${corners}
    <div class="art-c">
      <span class="art-m">${t.m}</span>
      <small class="art-k">${esc(t.occ)}</small>
      <strong class="art-t">${esc(o.title || t.t)}</strong>
      <span class="art-s">${esc(t.s)}</span>
      ${o.phrase ? `<em class="art-p">${esc(o.phrase)}</em>` : ""}
    </div></div>`;
}

/* =====================================================================
   CARD MARKUP: every card is built from this one function.
   ===================================================================== */
function cardHTML(t) {
  return `
  <article class="card" data-template-id="${esc(t.id)}">
    <div class="art-box" data-action="preview">${artHTML(t)}</div>
    <div class="card-body">
      <span class="tag">${esc(t.occ)}</span>
      <h3>${esc(t.name)}</h3>
      <div class="card-foot">
        <div class="card-price-row">
          <span class="price">${priceText(t)}</span>
          ${t.offerBadge ? `<span class="offer-badge" title="Visual demo badge; price remains unchanged" aria-label="${esc(t.offerBadge)} - visual demo only; displayed price unchanged">${esc(t.offerBadge)}</span>` : ""}
        </div>
        <div class="actions">
          <button type="button" class="btn btn-small btn-ghost" data-action="preview" aria-label="Preview ${esc(t.name)}">Preview</button>
          <button type="button" class="btn btn-small" data-action="buy" aria-label="Buy ${esc(t.name)} now">Buy Now</button>
        </div>
      </div>
    </div>
  </article>`;
}

/* ---------- Catalogue: category + search + sort + "show more" ---------- */
const state = { cat: "all", q: "", sort: "recommended", limit: CONFIG.pageSize };
const grid = $("#grid");

function matchesSearch(t, q) {
  if (!q) return true;
  const hay = [t.name, t.occ, CATEGORIES[t.cat].label, ...langsOf(t)].join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
}

function sortList(list, mode) {
  const out = [...list]; // "recommended" keeps the order written in TEMPLATES
  if (mode === "low") out.sort((a, b) => a.price - b.price);
  else if (mode === "high") out.sort((a, b) => b.price - a.price);
  else if (mode === "newest") out.sort((a, b) => b.added.localeCompare(a.added));
  return out;
}

function renderCatalogue() {
  const all = sortList(TEMPLATES.filter(t => (state.cat === "all" || t.cat === state.cat) && matchesSearch(t, state.q)), state.sort);
  const shown = all.slice(0, state.limit);
  grid.innerHTML = shown.map(cardHTML).join("");
  $("#empty").hidden = all.length > 0;
  $("#more").hidden = all.length <= shown.length;
}

function setCategory(cat) {
  state.cat = cat; state.limit = CONFIG.pageSize;
  $$("#filters .chip").forEach(c => {
    const on = c.dataset.filter === cat;
    c.classList.toggle("active", on);
    c.setAttribute("aria-pressed", on);
  });
  renderCatalogue();
}

$("#filters").addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) setCategory(c.dataset.filter); });
$("#search").addEventListener("input", e => { state.q = e.target.value.trim(); state.limit = CONFIG.pageSize; renderCatalogue(); });
$("#sort").addEventListener("change", e => { state.sort = e.target.value; state.limit = CONFIG.pageSize; renderCatalogue(); });
$("#more").addEventListener("click", () => { state.limit += CONFIG.pageSize; renderCatalogue(); });
$("#reset-filters").addEventListener("click", () => {
  state.q = ""; state.sort = "recommended";
  $("#search").value = ""; $("#sort").value = "recommended";
  setCategory("all");
});
$$(".occ").forEach(tile => tile.addEventListener("click", () => setCategory(tile.dataset.cat)));

// One click handler for the cards (works for mouse and touch)
grid.addEventListener("click", e => {
  const hit = e.target.closest("[data-action]");
  if (!hit) return;
  const t = byId(hit.closest(".card").dataset.templateId);
  if (!t) return;
  if (hit.dataset.action === "preview") openPreview(t); else openCheckout(t);
});

/* =====================================================================
   PREVIEW MODAL: shows the selected design or its interactive demo larger.
   ===================================================================== */
const dialog = $("#preview");
const pv = { t: null, lang: "English", device: "phone" };
const previewFrame = $("#pv-frame");

function installTemplateWatermark() {
  if (previewFrame.hidden || !pv.t?.demoUrl) return;

  try {
    const previewDocument = previewFrame.contentDocument;
    const expectedUrl = new URL(pv.t.demoUrl, document.baseURI).href;
    if (!previewDocument || previewFrame.contentWindow.location.href !== expectedUrl) return;
    if (previewDocument.getElementById("wishtale-template-watermark")) return;

    const style = previewDocument.createElement("style");
    style.id = "wishtale-template-watermark-style";
    style.textContent = `
      #wishtale-template-watermark {
        position: fixed !important;
        z-index: 2147483647 !important;
        right: max(10px, env(safe-area-inset-right, 0px)) !important;
        bottom: max(10px, env(safe-area-inset-bottom, 0px)) !important;
        display: grid !important;
        gap: 2px !important;
        max-width: calc(100vw - 20px) !important;
        padding: 6px 9px !important;
        border: 1px solid rgba(255, 255, 255, .2) !important;
        border-radius: 7px !important;
        background: rgba(20, 12, 16, .78) !important;
        color: #fff !important;
        font: 500 10px/1.3 system-ui, sans-serif !important;
        letter-spacing: .02em !important;
        text-align: right !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, .55) !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, .2) !important;
        backdrop-filter: blur(6px) !important;
        pointer-events: none !important;
        user-select: none !important;
      }
      #wishtale-template-watermark span:last-child {
        color: rgba(255, 255, 255, .78) !important;
        font-size: 9px !important;
      }
    `;
    previewDocument.head.appendChild(style);

    const watermark = previewDocument.createElement("div");
    watermark.id = "wishtale-template-watermark";
    watermark.setAttribute("role", "note");
    watermark.setAttribute("aria-label", "Made with WishTale. Watermark removed after purchase.");
    watermark.innerHTML = "<span>Made with WishTale</span><span>Watermark removed after purchase</span>";
    previewDocument.body.appendChild(watermark);
  } catch (error) {
    console.error("[WishTale preview] Could not add the template watermark:", error);
  }
}

previewFrame.addEventListener("load", installTemplateWatermark);

function lockScroll() { document.body.style.overflow = "hidden"; }
function openDialog(d) { lockScroll(); if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); }
$$("dialog").forEach(d => {
  d.addEventListener("close", () => {
    if (d === dialog) {
      $("#pv-frame").removeAttribute("src");
      $("#pv-frame").hidden = true;
      $("#pv-art").hidden = false;
      dialog.classList.remove("proposal-preview");
    }
    if (!$$("dialog[open]").length) document.body.style.overflow = "";
  });
  d.addEventListener("click", e => { if (e.target === d) d.close(); });
});

function renderPreview() {
  const t = pv.t;
  const hasExperience = Boolean(t.demoUrl);
  $("#pv-art").hidden = hasExperience;
  $("#pv-frame").hidden = !hasExperience;
  if (!hasExperience) {
    const phrase = (PHRASES[pv.lang] || PHRASES.English)[INVITE_CATS.includes(t.cat) ? "invite" : "love"];
    $("#pv-art").innerHTML = artHTML(t, { title: $("#pv-input").value.trim(), phrase, label: true });
    const art = $("#pv-art .art");
    if (art) art.setAttribute("dir", pv.lang === "Urdu" ? "rtl" : "ltr");
  }
  $$("[data-proposal-control]").forEach(control => { control.hidden = hasExperience; });
  const dev = $("#pv-device");
  dev.classList.toggle("is-phone", pv.device === "phone");
  dev.classList.toggle("is-desktop", pv.device === "desktop");
  $$("[data-device]").forEach(b => {
    const on = b.dataset.device === pv.device;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
  });
}

function openPreview(t) {
  pv.t = t; pv.device = "phone"; pv.lang = langsOf(t)[0];
  $("#pv-tag").textContent = CATEGORIES[t.cat].label + " · " + t.occ;
  $("#pv-title").textContent = t.name;
  $("#pv-price").textContent = priceText(t);
  $("#pv-blurb").textContent = t.description || "Add your own names, date and message to make this design yours.";
  $("#pv-lang").innerHTML = langsOf(t).map(l => `<option>${esc(l)}</option>`).join("");
  $("#pv-input").value = "";
  $("#pv-input").placeholder = t.t;
  dialog.classList.toggle("proposal-preview", Boolean(t.demoUrl));
  if (t.demoUrl) $("#pv-frame").src = t.demoUrl;
  else $("#pv-frame").removeAttribute("src");
  renderPreview();
  openDialog(dialog);
}

$("#pv-close").addEventListener("click", () => dialog.close());
$("#pv-dismiss").addEventListener("click", () => dialog.close());
$("#pv-lang").addEventListener("change", e => { pv.lang = e.target.value; renderPreview(); });
$("#pv-input").addEventListener("input", renderPreview);
$$("[data-device]").forEach(b => b.addEventListener("click", () => { pv.device = b.dataset.device; renderPreview(); }));
$("#pv-buy").addEventListener("click", () => { const t = pv.t; dialog.close(); openCheckout(t); });

/* =====================================================================
   BUY NOW (summary only). No payment is taken and no order is created.
   FUTURE: replace the step-2 screen with your real checkout or payment call.
   ===================================================================== */
const checkout = $("#checkout");
const co = { t: null, summary: "" };

function clearInvalid(form) { $$(".invalid", form).forEach(el => { el.classList.remove("invalid"); el.removeAttribute("aria-invalid"); }); }

function openCheckout(t) {
  co.t = t;
  $("#co-art").innerHTML = artHTML(t);
  $("#co-occ").textContent = CATEGORIES[t.cat].label + " · " + t.occ;
  $("#co-name").textContent = t.name;
  $("#co-total").textContent = priceText(t);
  $("#co-note").hidden = !t.from;
  $("#co-step1").hidden = false;
  $("#co-step2").hidden = true;
  $("#co-copy-msg").textContent = "";
  $("#co-form").reset();
  clearInvalid($("#co-form"));
  openDialog(checkout);
}

function validate(form) {
  let ok = true;
  $$("[required]", form).forEach(el => {
    const bad = !el.value.trim();
    el.classList.toggle("invalid", bad);
    el.setAttribute("aria-invalid", bad);
    if (bad && ok) { el.focus(); ok = false; }
  });
  return ok;
}

$("#co-form").addEventListener("submit", e => {
  e.preventDefault();
  if (!validate(e.target)) return;
  const d = Object.fromEntries(new FormData(e.target).entries());
  co.summary = [
    `${CONFIG.brand} order summary`,
    `Design: ${co.t.name} (${co.t.occ})`,
    `Price: ${priceText(co.t)}`,
    `Name: ${d.name}`,
    `Contact: ${d.contact}`,
    `Occasion date: ${d.date || "Not set yet"}`,
    `Notes: ${d.notes || "None"}`
  ].join("\n");
  $("#co-who").textContent = d.name;
  $("#co-summary").textContent = co.summary;
  $("#co-mail").href = mailto(`${CONFIG.brand} order: ${co.t.name}`, co.summary);
  $("#co-step1").hidden = true;
  $("#co-step2").hidden = false;
  $("#co-step2 h3").focus?.();
});
$("#co-close").addEventListener("click", () => checkout.close());
$("#co-back").addEventListener("click", () => { checkout.close(); $("#templates").scrollIntoView(); });

/* ---------- Copy helper ---------- */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch {}
    ta.remove();
    return ok;
  }
}
async function copyWithMessage(text, msgEl) {
  msgEl.textContent = (await copyText(text)) ? "Copied!" : "Select the text to copy it.";
}
$("#co-copy").addEventListener("click", () => copyWithMessage(co.summary, $("#co-copy-msg")));

/* =====================================================================
   CUSTOM WEBSITE REQUEST FORM: builds a summary and an email link.
   FUTURE: send this data to your own backend instead.
   ===================================================================== */
const reqForm = $("#request-form");
let reqSummary = "";
reqForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!validate(reqForm)) return;
  const d = Object.fromEntries(new FormData(reqForm).entries());
  reqSummary = [
    `${CONFIG.brand} custom website request`,
    `Name: ${d.name}`,
    `Contact: ${d.contact}`,
    `Looking for: ${d.type}`,
    `Occasion date: ${d.date || "Not set yet"}`,
    `Idea: ${d.details}`
  ].join("\n");
  $("#req-summary").textContent = reqSummary;
  $("#req-mail").href = mailto(`${CONFIG.brand} custom website request`, reqSummary);
  $("#req-copy-msg").textContent = "";
  $("#req-out").hidden = false;
  $("#req-out").scrollIntoView({ block: "nearest" });
});
$("#req-copy").addEventListener("click", () => copyWithMessage(reqSummary, $("#req-copy-msg")));

// Clear the red border as soon as someone types
document.addEventListener("input", e => {
  const el = e.target;
  if (el.classList && el.classList.contains("invalid")) { el.classList.remove("invalid"); el.removeAttribute("aria-invalid"); }
});

/* ---------- Mobile navigation ---------- */
const toggle = $(".nav-toggle");
const menu = $("#menu");
function closeMenu() { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
$$("a", menu).forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); toggle.focus(); } });
window.addEventListener("resize", () => { if (window.innerWidth > 1060) closeMenu(); });

/* ---------- Entrance animations ---------- */
const items = $$(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
} else {
  items.forEach(el => el.classList.add("in"));
}

/* ---------- Start-up ---------- */
$$("[data-config]").forEach(el => { el.textContent = CONFIG[el.dataset.config]; });
$("#year").textContent = new Date().getFullYear();
[["hero-a", "w01"], ["hero-b", "l02"], ["hero-c", "fe01"]].forEach(([id, tid]) => { $("#" + id).innerHTML = artHTML(byId(tid)); });
validatePrices();
renderCatalogue();

/* =====================================================================
   FUTURE UPGRADES (not built yet)
   Each template has a unique id: use it for live previews, personalisation,
   uploads, shareable links, accounts, payments, order tracking and RSVP.
   openCheckout() and the form handlers above are where those would connect.
   TEMPLATES can later be loaded from a JSON file or an API.
   ===================================================================== */