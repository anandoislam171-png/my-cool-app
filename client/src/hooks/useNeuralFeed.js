import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const useNeuralFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/feed/neural?page=${pageNum}`);
      
      if (pageNum === 1) {
        setPosts(res.data.data);
      } else {
        setPosts(prev => [...prev, ...res.data.data]);
      }
      
      setHasMore(res.data.meta.hasMore);
    } catch (err) {
      console.error("Neural Feed Desync:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, [user?.mode, fetchFeed]); // মোড চেঞ্জ হলে ফিড অটো রিফ্রেশ হবে

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  return { posts, loading, loadMore, hasMore };
};