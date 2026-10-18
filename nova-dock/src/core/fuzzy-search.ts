/**
 * High-performance Fuzzy Search and Ranking Algorithm for Raycast-style Command Palette
 */

export interface FuzzyResult<T> {
  item: T;
  score: number;
  matches?: [number, number][]; // Highlight ranges
}

export function fuzzyScore(target: string, query: string): number {
  if (!query) return 1;
  const t = target.toLowerCase();
  const q = query.toLowerCase();

  // Exact match bonus
  if (t === q) return 1000;
  // Prefix match bonus
  if (t.startsWith(q)) return 500 + (100 - t.length);
  // Word boundary match bonus (e.g. "cc" matches "Command Center")
  const words = t.split(/[\s-_/]+/);
  if (words.some(w => w.startsWith(q))) return 350;

  // Substring match
  const idx = t.indexOf(q);
  if (idx !== -1) return 200 - idx;

  // Subsequence match with character distance scoring
  let score = 0;
  let qIdx = 0;
  let prevIdx = -1;

  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      // Proximity bonus: consecutive characters score higher
      if (prevIdx !== -1 && i === prevIdx + 1) {
        score += 20;
      } else {
        score += 5;
      }
      prevIdx = i;
      qIdx++;
    }
  }

  // All query characters must match in order
  if (qIdx === q.length) {
    return score + Math.max(0, 50 - t.length);
  }

  return 0;
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  keyExtractor: (item: T) => string[],
  threshold: number = 5
): FuzzyResult<T>[] {
  if (!query.trim()) {
    return items.map(item => ({ item, score: 1 }));
  }

  const results: FuzzyResult<T>[] = [];

  for (const item of items) {
    const keys = keyExtractor(item);
    let bestScore = 0;

    for (const key of keys) {
      const s = fuzzyScore(key, query);
      if (s > bestScore) {
        bestScore = s;
      }
    }

    if (bestScore >= threshold) {
      results.push({ item, score: bestScore });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
