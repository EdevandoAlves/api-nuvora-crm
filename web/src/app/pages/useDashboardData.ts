import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { isOpenStage } from "../format";
import type {
  DashboardActivity,
  DashboardSummary,
  DashboardTrendPoint,
  Deal,
  Paginated,
  Task,
} from "../types";

export type DashboardData = {
  summary: DashboardSummary;
  activity: DashboardActivity[];
  trend: DashboardTrendPoint[];
  tasks: Task[];
  topDeals: Deal[];
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summary, activity, trend, tasksPage, dealsPage] =
        await Promise.all([
          api<DashboardSummary>("/dashboard/summary"),
          api<DashboardActivity[]>("/dashboard/activity?limit=5"),
          api<DashboardTrendPoint[]>("/dashboard/trend?weeks=8"),
          api<Paginated<Task>>(
            "/tasks?status=PENDING&limit=6&sortBy=dueDate&sortOrder=ASC",
          ),
          api<Paginated<Deal>>(
            "/deals?limit=20&sortBy=value&sortOrder=DESC",
          ),
        ]);

      setData({
        summary,
        activity,
        trend,
        tasks: tasksPage.data,
        topDeals: dealsPage.data.filter((deal) => isOpenStage(deal.stage)).slice(0, 4),
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar o dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
