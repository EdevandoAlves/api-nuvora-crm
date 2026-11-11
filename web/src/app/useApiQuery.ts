import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

export function useApiQuery<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setData(await api<T>(path));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os dados.",
      );
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
