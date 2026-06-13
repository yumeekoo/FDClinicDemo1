"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getVisitsQueueAction } from "@/actions/visits";

export function useRealtimeQueue(branchId: string | null) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    if (!branchId) return;
    try {
      const res = await getVisitsQueueAction();
      if (res.success) {
        setQueue(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải hàng đợi khám");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (!branchId) {
      setQueue([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchQueue();

    const supabase = createClient();
    const channelName = `visits-queue-${branchId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "visits",
          filter: `branch_id=eq.${branchId}`,
        },
        () => {
          // Re-fetch queue when any visit is created, updated or deleted
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, fetchQueue]);

  return { queue, loading, error, refetch: fetchQueue };
}
