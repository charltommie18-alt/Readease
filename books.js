// Simple fixed book list - ReadEase
const preloadedBooksDB = [
  { title: "Alice in Wonderland", author: "Lewis Carroll", category: "children", id: 11 },
  { title: "Peter Pan", author: "J.M. Barrie", category: "children", id: 16 },
  { title: "Wizard of Oz", author: "L. Frank Baum", category: "children", id: 55 },
  { title: "Grimm's Fairy Tales", author: "Brothers Grimm", category: "children", id: 2591 },
  { title: "Aesop's Fables", author: "Aesop", category: "children", id: 19994 },
  { title: "The Jungle Book", author: "Rudyard Kipling", category: "children", id: 236 },
  { title: "Wind in the Willows", author: "Kenneth Grahame", category: "children", id: 2781 },
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

// Simple download that fixes Error 40
async function downloadBook(url, title, author) {
  try {
    // Try with proxy to fix CORS Error 40
    let fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    let res = await fetch(fetchUrl);
    let text = await res.text();

    // Clean Gutenberg header
    let start = text.indexOf("*** START");
    let end = text.indexOf("*** END");
    if (start!== -1 && end!== -1) {
      text = text.substring(text.indexOf("\n", start)+1, end);
    }

    alert("Downloaded: " + title);
    localStorage.setItem('currentBook', text);
    // add your own open reader code here
    return text;
  } catch(e) {
    alert("Failed to download. Check internet.");
  }
}

// Simple search
async function searchBooks() {
  const q = document.getElementById('search-box').value.toLowerCase().trim();
  const resultsDiv = document.getElementById('search-results');
  if(!q) return alert('Enter search term');

  resultsDiv.innerHTML = 'Searching...';
  let results = [];

  // Try API first
  try {
    const r = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(q)}`);
    const data = await r.json();
    results = (data.results || []).slice(0,10).map(b => ({
      title: b.title,
      author: b.authors[0]?.name || 'Unknown',
      url: b.formats['text/plain; charset=utf-8'] || b.formats['text/plain']
    })).filter(b => b.url);
  } catch(e){}

  // Fallback to local list if API fails
  if(results.length === 0){
    results = preloadedBooksDB.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  }

  if(results.length === 0){
    resultsDiv.innerHTML = 'No books found. Try: alice, peter, dracula';
    return;
  }

  resultsDiv.innerHTML = '';
  results.forEach(book => {
    const div = document.createElement('div');
    div.style = 'border:1px solid #ddd;padding:10px;margin:8px 0;display:flex;justify-content:space-between;border-radius:8px';
    div.innerHTML = `<div><b>${book.title}</b><br><small>${book.author}</small></div>`;
    const btn = document.createElement('button');
    btn.innerText = 'Download';
    btn.onclick = () => downloadBook(book.url, book.title, book.author);
    div.appendChild(btn);
    resultsDiv.appendChild(div);
  });
      }
