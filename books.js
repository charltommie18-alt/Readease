/**
 * ReadEase – preloaded free catalogue (public domain only)
 * Copyrighted books (e.g. Fifty Shades) cannot be included.
 */

const preloadedBooksDB = [
  // Bedtime
  { title: "Alice in Wonderland", author: "Lewis Carroll", category: "bedtime", id: 11 },
  { title: "Peter Pan", author: "J.M. Barrie", category: "bedtime", id: 16 },
  { title: "Wizard of Oz", author: "L. Frank Baum", category: "bedtime", id: 55 },
  { title: "Grimm's Fairy Tales", author: "Brothers Grimm", category: "bedtime", id: 2591 },
  { title: "Andersen's Fairy Tales", author: "Hans Christian Andersen", category: "bedtime", id: 1597 },
  { title: "Aesop's Fables", author: "Aesop", category: "bedtime", id: 28 },
  { title: "The Jungle Book", author: "Rudyard Kipling", category: "bedtime", id: 236 },
  { title: "The Wind in the Willows", author: "Kenneth Grahame", category: "bedtime", id: 289 },
  { title: "The Secret Garden", author: "Frances Hodgson Burnett", category: "bedtime", id: 113 },
  { title: "Anne of Green Gables", author: "L. M. Montgomery", category: "bedtime", id: 45 },
  { title: "Little Women", author: "Louisa May Alcott", category: "bedtime", id: 514 },
  { title: "A Christmas Carol", author: "Charles Dickens", category: "bedtime", id: 46 },
  // Classic romance
  { title: "Pride and Prejudice", author: "Jane Austen", category: "romance", id: 1342 },
  { title: "Emma", author: "Jane Austen", category: "romance", id: 158 },
  { title: "Sense and Sensibility", author: "Jane Austen", category: "romance", id: 161 },
  { title: "Persuasion", author: "Jane Austen", category: "romance", id: 105 },
  { title: "Jane Eyre", author: "Charlotte Brontë", category: "romance", id: 1260 },
  { title: "Wuthering Heights", author: "Emily Brontë", category: "romance", id: 768 },
  // Classics
  { title: "Sherlock Holmes", author: "Arthur Conan Doyle", category: "classics", id: 1661 },
  { title: "Dracula", author: "Bram Stoker", category: "classics", id: 345 },
  { title: "Frankenstein", author: "Mary Shelley", category: "classics", id: 84 },
  { title: "Treasure Island", author: "Robert Louis Stevenson", category: "adventure", id: 120 },
  { title: "Moby Dick", author: "Herman Melville", category: "classics", id: 2701 },
  { title: "Great Expectations", author: "Charles Dickens", category: "classics", id: 1400 },
].map(b => ({
  ...b,
  url: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.txt`
}));
