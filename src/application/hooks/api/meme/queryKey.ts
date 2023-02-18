export const QUERY_KEYS = {
  getMemeDetailById: (id: string) => ["getMemeDetailById", id],
  getPopularMemes: ["getPopularMemes"],
  getSharedMemes: ["getSharedMemes"],
  getRecentMemes: ["getRecentMemes"],
  getMemesBySort: (sort: string) => ["getMemesByOption", sort],
  getUserFindMemes: ["getUserFindMemes"],
  getMemesByCollectionId: (collectionId: number | null) => ["getMemesByCollectionId", collectionId],
} as const;
