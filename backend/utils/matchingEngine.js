import natural from "natural";

const { TfIdf } = natural;

/**
 * Computes a cosine-similarity-based match score between two users
 * using TF-IDF vectors built from their skillsOffered and skillsRequired arrays.
 * Returns a score between 0 and 100.
 */
export const computeMatchScore = (userA, userB) => {
  const docA = [
    ...(userA.skillsOffered || []),
    ...(userA.skillsRequired || []),
  ]
    .join(" ")
    .toLowerCase()
    .trim();

  const docB = [
    ...(userB.skillsOffered || []),
    ...(userB.skillsRequired || []),
  ]
    .join(" ")
    .toLowerCase()
    .trim();

  if (!docA || !docB) return 0;

  const tfidf = new TfIdf();
  tfidf.addDocument(docA); // index 0 → userA
  tfidf.addDocument(docB); // index 1 → userB

  // Collect all unique terms across both documents
  const terms = new Set();
  tfidf.listTerms(0).forEach((item) => terms.add(item.term));
  tfidf.listTerms(1).forEach((item) => terms.add(item.term));

  if (terms.size === 0) return 0;

  // Build TF-IDF vectors
  const vecA = [];
  const vecB = [];

  for (const term of terms) {
    vecA.push(tfidf.tfidf(term, 0));
    vecB.push(tfidf.tfidf(term, 1));
  }

  // Cosine similarity
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magA === 0 || magB === 0) return 0;

  const similarity = dot / (magA * magB);
  return Math.round(Math.min(similarity, 1) * 100);
};
