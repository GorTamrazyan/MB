export const CacheTTL = {
  PUBLIC_SERVICE: 600,      // 10 min
  PUBLIC_COMPANY: 600,      // 10 min
  CATEGORY_TREE: 3600,      // 1 hour
  SEARCH_RESULTS: 120,      // 2 min
  USER_PROFILE: 300,        // 5 min
  ORDER: 60,                // 1 min
  ADMIN_STATS: 300,         // 5 min
  SERVICE_LIST: 300,        // 5 min
  COMPANY_LIST: 300,        // 5 min
} as const;
