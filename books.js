// ReadEase - Offline First - Never gets stuck on Gutenberg
const preloadedBooksDB = [
  { title: "Alice in Wonderland", author: "Lewis Carroll", category: "children", id: 11 },
  { title: "Peter Pan", author: "J.M. Barrie", category: "children", id: 16 },
  { title: "Wizard of Oz", author: "L. Frank Baum", category: "children", id: 55 },
  { title: "Grimm's Fairy Tales", author: "Brothers Grimm", category: "children", id: 2591 },
  { title: "Aesop's Fables", author: "Aesop", category: "children", id: 19994 },
  { title: "The Jungle Book", author: "Rudyard Kipling", category: "children", id: 236 },
  { title: "Heidi", author: "Johanna Spyri", category: "children", id: 1489 },
  { title: "Sherlock Holmes", author: "Arthur Conan Doyle", category: "classics", id: 1661 },
  { title: "Dracula", author: "Bram Stoker", category: "classics", id: 345 },
  { title: "Frankenstein", author: "Mary Shelley", category: "classics", id: 84 },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "classics", id: 1342 },
  { title: "Treasure Island", author: "Robert Louis Stevenson", category: "adventure", id: 120 },
  { title: "Robinson Crusoe", author: "Daniel Defoe", category: "adventure", id: 521 },
  { title: "Huckleberry Finn", author: "Mark Twain", category: "adventure", id: 76 },
].map(b => ({
 ...b,
  url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.txt`
}));

// 1. Download - uses proxy so it doesn't get blocked
async function downloadBook(url, title, author) {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error("proxy failed");

    let text = await res.text();
    // Remove Gutenberg header/footer
    const s = text.indexOf("*** START");
    const e = text.indexOf("*** END");
    if (s!== -1 && e!== -1) text = text.substring(text.indexOf("\n", s)+1, e);

    localStorage.setItem('currentBook', text);
    localStorage.setItem('currentTitle', title);
    alert("✅ Downloaded: " + title);
    // if you have reader page: location.href = "reader.html"
  } catch (err) {
    alert("❌ Can't reach Gutenberg right now. Trying direct link...\n" + url);
    window.open(url, '_blank'); // Open in new tab as last resort
  }
}

// 2. Search - NEVER WAITS for Gutenberg
async function searchBooks() {
  const input = document.getElementById('search-box');
  const resultsDiv = document.getElementById('search-results');
  const q = input.value.toLowerCase().trim();
  if (!q) return alert("Type something like 'alice' or 'peter'");

  // A) Show local results INSTANTLY - so app never looks stuck
  let localResults = preloadedBooksDB.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q)
  );

  renderResults(localResults, `Showing ${localResults.length} offline books for "${q}"`);

  // B) Try online in background WITHOUT blocking
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000); // 4 sec timeout - if no answer, forget it

    const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(q)}`, { signal: controller.signal });
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const onlineResults = data.results.slice(0, 10).map(b => ({
        title: b.title,
        author: b.authors[0]?.name || "Unknown",
        url: b.formats['text/plain; charset=utf-8'] || b.formats['text/plain']
      })).filter(b => b.url);

      if (onlineResults.length > 0) {
        renderResults([...localResults,...onlineResults], `Found ${onlineResults.length} online + ${localResults.length} offline`);
      }
    }
  } catch (e) {
    console.log("Online search skipped, using offline only");
    // Do nothing - user already has local results
  }
}

function renderResults(books, message) {
  const resultsDiv = document.getElementById('search-results');
  if (books.length === 0) {
    resultsDiv.innerHTML = `<p style="padding:20px;text-align:center">No books for that word. Try: alice, peter, dracula, treasure</p>`;
    return;
  }

  let html = `<p style="color:#666;font-size:13px;padding:5px">${message}</p>`;
  books.forEach(book => {
    html += `
      <div style="border:1px solid #ddd;padding:12px;margin:8px 0;border-radius:10px;display:flex;justify-content:space-between;align-items:center;background:white">
        <div><b>${book.title}</b><br><small style="color:#666">${book.author}</small></div>
        <button onclick="downloadBook('${book.url}','${book.title.replace(/'/g, "\\'")}','${book.author.replace(/'/g, "\\'")}')"
          style="background:#10b981;color:white;border:none;padding:8px 14px;border-radius:6px;cursor:pointer">Download</button>
      </div>
    `;
  });
  resultsDiv.innerHTML = html;
  }
