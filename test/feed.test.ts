import { describe, expect, it, vi } from "vitest";
import { usePaginatedFeed } from "@/composables/usePaginatedFeed";
import type { Page, Task } from "@/services/types";

function task(id: string): Task {
  return {
    id,
    title: `Job ${id}`,
    description: null,
    reward: 100,
    deadline: new Date(Date.now() + 86_400_000),
    createdAt: new Date(),
    ownerId: "u1",
    status: "OPEN",
  };
}

function page(ids: string[], hasNextPage: boolean, nextCursor: string | null = null): Page<Task> {
  return { tasks: ids.map(task), nextCursor, hasNextPage };
}

describe("usePaginatedFeed", () => {
  it("loads the first page and appends the next", async () => {
    const fetcher = vi
      .fn<[], Promise<Page<Task>>>()
      .mockResolvedValueOnce(page(["a", "b"], true, "c1"))
      .mockResolvedValueOnce(page(["c"], false, null));
    const feed = usePaginatedFeed(fetcher);

    await feed.loadInitial();
    expect(feed.items.value.map((t) => t.id)).toEqual(["a", "b"]);
    expect(feed.hasMore.value).toBe(true);
    expect(feed.loading.value).toBe(false);

    await feed.loadMore();
    expect(fetcher).toHaveBeenLastCalledWith("c1");
    expect(feed.items.value.map((t) => t.id)).toEqual(["a", "b", "c"]);
    expect(feed.hasMore.value).toBe(false);
  });

  it("ignores loadMore while loading or exhausted", async () => {
    const fetcher = vi.fn(async () => page(["a"], false, null));
    const feed = usePaginatedFeed(fetcher);

    await feed.loadInitial();
    await feed.loadMore();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("dedupes by id and reloads cleanly", async () => {
    const fetcher = vi
      .fn<[], Promise<Page<Task>>>()
      .mockResolvedValueOnce(page(["a"], true, "c1"))
      .mockResolvedValueOnce(page(["a", "b"], false, null))
      .mockResolvedValueOnce(page(["z"], false, null));
    const feed = usePaginatedFeed(fetcher);

    await feed.loadInitial();
    await feed.loadMore();
    expect(feed.items.value.map((t) => t.id)).toEqual(["a", "b"]);

    await feed.reload();
    expect(feed.items.value.map((t) => t.id)).toEqual(["z"]);
  });

  it("prepends without duplicating", async () => {
    const fetcher = vi.fn(async () => page(["a"], false, null));
    const feed = usePaginatedFeed(fetcher);
    await feed.loadInitial();

    feed.prepend(task("fresh"));
    feed.prepend(task("fresh"));
    expect(feed.items.value.map((t) => t.id)).toEqual(["fresh", "a"]);
  });

  it("surfaces errors without throwing", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("boom");
    });
    const feed = usePaginatedFeed(fetcher);

    await feed.loadInitial();
    expect(feed.error.value).toBe("boom");
    expect(feed.items.value).toEqual([]);
  });
});
