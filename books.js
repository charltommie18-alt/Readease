// =============================================
// ReadEase - Fixed Book Database & Search v2.0
// Fixes Error 40 (CORS) + old Gutenberg URLs
// =============================================

// Pre-loaded book database with stable Gutenberg URLs
const preloadedBooksDB = [
  // --- CHILDREN (14) ---
  { id: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", category: "children" },
  { id: 16, title: "Peter Pan", author: "J.M. Barrie", category: "children" },
  { id: 55, title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", category: "children" },
  { id: 19994, title: "Aesop's Fables", author: "Aesop", category: "children" },
  { id: 2591, title: "Grimm's Fairy Tales", author: "Brothers Grimm", category: "children" },
  { id: 1513, title: "The Adventures of Tom Sawyer", author: "Mark Twain", category: "children" },
  { id: 2781, title: "The Wind in the Willows", author: "Kenneth Grahame", category: "children" },
  { id: 236, title: "The Jungle Book", author: "Rudyard Kipling", category: "children" },
  { id: 1489, title: "Heidi", author: "Johanna Spyri", category: "children" },
  { id: 19033, title: "The Tale of Peter Rabbit", author: "Beatrix Potter", category: "children" },
  { id: 1952, title: "The Yellow Fairy Book", author: "Andrew Lang", category: "children" },
  { id: 3103, title: "Anne of Green Gables", author: "L.M. Montgomery", category: "children" },
  { id: 76, title: "Adventures of Huckleberry Finn", author: "Mark Twain", category: "children" },
  { id: 120, title: "Treasure Island", author: "Robert Louis Stevenson", category: "children" },

  // --- CLASSICS / NOVELS (12) ---
  { id: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", category: "classics" },
  { id: 345, title: "Dracula", author: "Bram Stoker", category: "classics" },
  { id: 84, title: "Frankenstein", author: "Mary Shelley", category: "classics" },
  { id: 1342, title: "Pride and Prejudice", author: "Jane Austen", category: "classics" },
  { id: 2600, title: "War and Peace", author: "Leo Tolstoy", category: "classics" },
  { id: 2701, title: "Moby Dick", author: "Herman Melville", category: "classics" },
  { id: 98, title: "A Tale of Two Cities", author: "Charles Dickens", category: "classics" },
  { id: 43, title: "The Strange Case of Dr Jekyll and Mr Hyde", author: "Robert Louis Stevenson", category: "classics" },
  { id: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", category: "classics" },
  { id: 1400, title: "Great Expectations", author: "Charles Dickens", category: "classics" },
  { id: 1184, title: "The Count of Monte Cristo", author: "Alexandre Dumas", category: "classics" },
  { id: 74, title: "The Adventures of Tom Sawyer", author: "Mark Twain", category: "classics" },

  // --- ADVENTURE ---
  { id: 521, title: "Robinson Crusoe", author: "Daniel Defoe", category: "adventure" },
  { id: 4217, title: "The Three Musketeers", author: "Alexandre Dumas", category: "adventure" },
  { id: 36, title: "The War of the Worlds", author: "H.G. Wells", category: "adventure" },
  { id: 35, title: "The Time Machine", author: "H.G. Wells", category: "adventure" },
].map(b => ({
 ...b,
  // NEW stable format - Gutenberg changed their structure
  url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.txt`,
  urlFallback: `https://www.gutenberg.org/files/${b.id}/${b.id}-0.txt`,
  source: "Project Gutenberg"
}));

// Updated list of FREE legal sources for your settings page
const FREE_BOOK_SOURCES = [
  { name: "Gutendex API (Gutenberg JSON)", api: "https://gutendex.com/books?search={query}", cors: true },
  { name: "Open Library", api: "https://openlibrary.org/search.json?q={query}&limit=20", cors: true },
  { name: "Project Gutenberg", url: "https://www.gutenberg.org/", cors: false },
  { name: "Standard Ebooks (cleaned)", url: "https://standardebooks.org/ebooks", cors: false },
  { name: "Internet Archive", url: "https://archive.org/details/texts", cors: true },
  { name: "Children's Bookshelf - Gutenberg", url: "https://www.gutenberg.org/ebooks/bookshelf/429", cors: false }
];

// --- FIX FOR ERROR 40: Robust Download ---
async function downloadBook(url, title, author) {
  const resultsDiv = document.getElementById('search-results');

  // Show loading
  const loadingId = 'downloading-' + Date.now();
  const loadingDiv = document.createElement('div');
  loadingDiv.id = loadingId;
  loadingDiv.innerHTML = `<div style="text-align:center;padding:15px;background:#e0f2fe;border-radius:8px;margin:10px 0">📥 Downloading <b>${title}</b>... Please wait</div>`;
  document.body.appendChild(loadingDiv);

  // Try direct, then 2 public CORS proxies
  const urlsToTry = [
    url,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  // Also try fallback URL if exists
  if (url.includes('/cache/epub/')) {
    const id = url.match(/\/(\d+)\//)?.[1] || url.match(/pg(\d+)\.txt/)?.[1];
    if (id) urlsToTry.push(`https://www.gutenberg.org/files/${id}/${id}-0.txt`);
  }

  for (const tryUrl of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(tryUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;
      let text = await res.text();
      if (text.length < 1000 || text.includes('<html')) continue; // Error page

      // Clean Gutenberg header/footer
      const startMarker = text.indexOf("*** START OF");
      const endMarker = text.indexOf("*** END OF");
      if (startMarker!== -1 && endMarker!== -1) {
        text = text.substring(text.indexOf("\n", startMarker) + 1, endMarker).trim();
      }

      // SUCCESS - Save it (adapt to your storage)
      console.log(`Success: ${title} ${text.length} chars`);
      localStorage.setItem('readease_currentBook', JSON.stringify({ title, author, content: text, downloadedAt: new Date().toISOString() }));

      // Call your reader function if you have one
      if (typeof openReader === 'function') openReader(title, text);
      else alert(`✅ Downloaded: ${title}\nReady to read!`);

      document.getElementById(loadingId)?.remove();
      return text;

    } catch (e) {
      console.warn(`Failed ${tryUrl}:`, e.message);
      continue;
    }
  }

  document.getElementById(loadingId)?.remove();
  alert(`❌ Download failed (Error 40). Gutenberg is blocking browser requests.\n\nFix: The app now tries CORS proxies, but for 100% reliability you should add a small Cloudflare Worker proxy. Check your internet and try again.`);
  return null;
}

// --- FIXED SEARCH with 3 layers ---
async function searchBooks() {
  const input = document.getElementById('search-box');
  if (!input) return;

  const q = input.value.trim().toLowerCase();
  if (!q) {
    alert('Enter search term (e.g., alice, sherlock, oz, pride)');
    return;
  }

  const resultsDiv = document.getElementById('search-results');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = '<div style="text-align:center;padding:20px">🔍 Searching free libraries...</div>';

  let filteredResults = [];

  // Layer 1: Gutendex API (CORS allowed)
  try {
    const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();

    for (const book of (data.results || []).slice(0, 20)) {
      // Check category if needed
      if (typeof currentCategory!== 'undefined' && currentCategory!== 'all') {
        const keywords = typeof categories!== 'undefined'? categories[currentCategory] || [] : [];
        if (keywords.length > 0) {
          const titleLower = (book.title || '').toLowerCase();
          const authorLower = (book.authors?.[0]?.name || '').toLowerCase();
          const matchesCat = keywords.some(k => titleLower.includes(k) || authorLower.includes(k));
          // Don't skip if no keywords match - let it show, better than no results
        }
      }

      const url = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'] || book.formats['text/plain; charset=us-ascii'];
      if (!url) continue;

      filteredResults.push({
        title: book.title,
        author: book.authors?.[0]?.name || 'Unknown',
        url: url,
        source: 'Gutendex'
      });
    }
  } catch (err) {
    console.log('Gutendex unavailable, using local DB');
  }

  // Layer 2: Local DB fallback (always works offline)
  if (filteredResults.length === 0) {
    const dbResults = preloadedBooksDB.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
      const matchesCategory = typeof currentCategory === 'undefined' || currentCategory === 'all' || book.category === currentCategory;
      return matchesSearch && matchesCategory;
    });
    filteredResults = dbResults.map(b => ({ title: b.title, author: b.author, url: b.url, urlFallback: b.urlFallback, source: 'preloaded' }));
  }

  // Layer 3: If still nothing, show all books for category
  if (filteredResults.length === 0) {
    const allCategoryBooks = preloadedBooksDB.filter(book =>
      typeof currentCategory === 'undefined' || currentCategory === 'all' || book.category === currentCategory
    ).slice(0, 10);
    resultsDiv.innerHTML = `<div style="text-align:center;padding:15px;color:#666">No exact match for "${q}". Showing popular books:</div>`;
    filteredResults = allCategoryBooks;
  } else {
    resultsDiv.innerHTML = '';
  }

  // Render
  filteredResults.forEach(book => {
    const div = document.createElement('div');
    div.className = 'book-card';
    div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e5e7eb;border-radius:10px;margin:8px 0;background:white';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'book-info';
    infoDiv.innerHTML = `<div class="book-title" style="font-weight:600">${book.title}</div><div class="book-author" style="color:#6b7280;font-size:14px">${book.author}</div><div class="book-type" style="font-size:12px;color:#9ca3af">Free • ${book.source || 'Project Gutenberg'}</div>`;

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-success';
    downloadBtn.style.cssText = 'background:#10b981;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer';
    downloadBtn.innerText = 'Download';
    downloadBtn.onclick = function() {
      downloadBook(book.url || book.urlFallback, book.title, book.author);
    };

    div.appendChild(infoDiv);
    div.appendChild(downloadBtn);
    resultsDiv.appendChild(div);
  });
   }
