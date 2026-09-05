/**
 * ReadEase – optional helpers / preloaded catalogue
 * Main search + download logic lives in index.html
 * (Gutendex API + Project Gutenberg with CORS proxies)
 */

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
  { title: "Moby Dick", author: "Herman Melville", category: "classics", id: 2701 },
  { title: "Great Expectations", author: "Charles Dickens", category: "classics", id: 1400 },
  { title: "Jane Eyre", author: "Charlotte Brontë", category: "classics", id: 1260 },
  { title: "Wuthering Heights", author: "Emily Brontë", category: "classics", id: 768 },
  { title: "The Picture of Dorian Gray", author: "Oscar Wilde", category: "classics", id: 174 },
  { title: "A Tale of Two Cities", author: "Charles Dickens", category: "classics", id: 98 },
  { title: "The Adventures of Tom Sawyer", author: "Mark Twain", category: "adventure", id: 74 },
  { title: "Adventures of Huckleberry Finn", author: "Mark Twain", category: "adventure", id: 76 },
  { title: "Treasure Island", author: "Robert Louis Stevenson", category: "adventure", id: 120 },
  { title: "The Call of the Wild", author: "Jack London", category: "adventure", id: 215 },
].map(b => ({
  ...b,
  url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.txt`
}));
