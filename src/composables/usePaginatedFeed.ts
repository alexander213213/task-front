import { ref, type Ref } from "vue";
import type { Page } from "../services/types";

export type PageFetcher<T extends { id: string }> = (cursor?: string) => Promise<Page<T>>;

/**
 * Hand-rolled infinite list over opaque keyset cursors. The fetcher closes
 * over sort/filter state owned by the caller; call reload() when that state
 * changes. Items dedupe by id so live prepends (F6) never duplicate rows.
 */
export function usePaginatedFeed<T extends { id: string }>(fetcher: PageFetcher<T>) {
  const items = ref([]) as Ref<T[]>;
  const nextCursor = ref<string | null>(null);
  const hasMore = ref(true);
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<string | null>(null);

  function reset(): void {
    items.value = [];
    nextCursor.value = null;
    hasMore.value = true;
    error.value = null;
  }

  function append(tasks: T[]): void {
    const seen = new Set(items.value.map((t) => t.id));
    const fresh = tasks.filter((task) => {
      if (seen.has(task.id)) return false;
      seen.add(task.id);
      return true;
    });
    if (fresh.length > 0) items.value = [...items.value, ...fresh];
  }

  async function loadInitial(): Promise<void> {
    if (loading.value) return;
    reset();
    loading.value = true;
    try {
      const page = await fetcher(undefined);
      append(page.tasks);
      nextCursor.value = page.nextCursor;
      hasMore.value = page.hasNextPage;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load";
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (loading.value || loadingMore.value || !hasMore.value) return;
    loadingMore.value = true;
    try {
      const page = await fetcher(nextCursor.value ?? undefined);
      append(page.tasks);
      nextCursor.value = page.nextCursor;
      hasMore.value = page.hasNextPage;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load more";
    } finally {
      loadingMore.value = false;
    }
  }

  async function reload(): Promise<void> {
    await loadInitial();
  }

  function prepend(task: T): void {
    if (!items.value.some((t) => t.id === task.id)) {
      items.value = [task, ...items.value];
    }
  }

  return {
    items,
    hasMore,
    loading,
    loadingMore,
    error,
    loadInitial,
    loadMore,
    reload,
    reset,
    prepend,
  };
}
