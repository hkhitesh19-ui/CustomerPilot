"use client";

import { useState, useEffect } from 'react';

export function useSystemContent() {
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content) {
          const map: Record<string, string> = {};
          data.content.forEach((item: any) => {
            map[item.key] = item.value;
          });
          setContentMap(map);
        }
      })
      .catch((err) => console.error('Failed to load system content:', err))
      .finally(() => setLoading(false));
  }, []);

  const getContent = (key: string, fallback: string): string => {
    return contentMap[key] !== undefined ? contentMap[key] : fallback;
  };

  return { getContent, contentMap, loading };
}
