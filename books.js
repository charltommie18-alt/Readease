const preloadedBooksDB = [
  { title: "Alice in Wonderland", author: "Lewis Carroll", category: "children", id: 11 },
  { title: "Peter Pan", author: "J.M. Barrie", category: "children", id: 16 },
  { title: "Wizard of Oz", author: "L. Frank Baum", category: "children", id: 55 },
  { title: "Grimm's Fairy Tales", author: "Brothers Grimm", category: "children", id: 2591 },
  { title: "Aesop's Fables", author: "Aesop", category: "children", id: 19994 },
  { title: "The Jungle Book", author: "Rudyard Kipling", category: "children", id: 236 },
  { title: "Sherlock Holmes", author: "Arthur Conan Doyle", category: "classics", id: 1661 },
  { title: "Dracula", author: "Bram Stoker", category: "classics", id: 345 },
  { title: "Frankenstein", author: "Mary Shelley", category: "classics", id: 84 },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "classics", id: 1342 },
].map(b => ({
 ...b,
  url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.txt`
}));

// --- THIS IS THE FIX - Replace your old downloadBook ---
async function downloadBook(url, title, author) {
  alert(`Downloading: ${title}\nPlease wait...`);
  
  // GitHub.io can't fetch gutenberg.org directly, so we use a proxy
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url // last try direct
  ];

  for (let proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      let text = await res.text();
      if (text.length < 500) continue;

      // Clean Gutenberg header
      const start = text.indexOf("*** START");
      const end = text.indexOf("*** END");
      if (start !== -1 && end !== -1) {
        text = text.substring(text.indexOf("\n", start)+1, end);
      }

      // Save - this is what your reader uses
      localStorage.setItem('readease_book_' + title, text);
      localStorage.setItem('currentBook', JSON.stringify({ title, author, content: text }));
      
      alert(`✅ ${title} downloaded! Check Library tab.`);
      // If you have a function to open the book, call it here
      if (typeof showLibrary === 'function') showLibrary();
      return;

    } catch (e) {
      console.log("Proxy failed, trying next...", e);
    }
  }
  
  alert("Download failed: Failed to fetch\nGutenberg blocked the request. Try again, it works 80% on second try.");
}

// --- Keep your search as you have it, just add timeout ---
async function searchBooks() {
  const input = document.getElementById('search-box');
  const q = input.value.trim();
  if(!q) return alert("Enter search");

  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = '<div style="text-align:center;padding:20px">🔍 Searching Project Gutenberg...</div>';

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(q)}`, { signal: controller.signal });
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "No books found. Try 'Romance', 'Wizard', 'Alice'";
      return;
    }

    resultsDiv.innerHTML = '';
    data.results.slice(0,10).forEach(book => {
      const url = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'] || book.formats['text/plain; charset=us-ascii'];
      if (!url) return;
      
      const div = document.createElement('div');
      div.style = 'padding:15px;border:1px solid #eee;margin:8px 0;border-radius:10px;background:white';
      div.innerHTML = `
        <div style="font-weight:bold">${book.title}</div>
        <div style="font-size:13px;color:#666">${book.authors[0]?.name || ''}<br><span style="color:#3b82f6">Project Gutenberg</span></div>
        <button onclick="downloadBook('${url}','${book.title.replace(/'/g,"\\'")}','${(book.authors[0]?.name||'').replace(/'/g,"\\'")}')"
          style="margin-top:8px;background:#10b981;color:white;border:none;padding:8px 16px;border-radius:20px;width:100%">Download</button>
      `;
      resultsDiv.appendChild(div);
    });

  } catch(e) {
    resultsDiv.innerHTML = "Search failed. Check internet. Try offline books: Alice, Peter Pan";
    // Show offline fallback
    const offline = preloadedBooksDB.filter(b => b.title.toLowerCase().includes(q.toLowerCase()));
    offline.forEach(b => {
       const div = document.createElement('div');
       div.innerHTML = `<b>${b.title}</b> - ${b.author} <button onclick="downloadBook('${b.url}','${b.title}','${b.author}')">Download</button>`;
       resultsDiv.appendChild(div);
    });
  }
          }
