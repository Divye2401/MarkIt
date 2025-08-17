import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookmarkClusters } from "@/utils/Frontend/BookmarkHelpers";
import { useTheme } from "@/utils/Providers/ThemeProvider";

export default function BookmarkClusterMap({ bookmarks }) {
  const { theme } = useTheme();

  // Calculate content type stats
  const contentTypeStats = useMemo(() => {
    if (!bookmarks || bookmarks.length === 0) return [];

    const typeMap = {};

    bookmarks.forEach((bookmark) => {
      const type = bookmark.content_type || "Unknown";
      if (!typeMap[type]) {
        typeMap[type] = { totalTime: 0, count: 0 };
      }
      typeMap[type].totalTime += bookmark.reading_time || 0;
      typeMap[type].count += 1;
    });

    const results = [];
    for (const type in typeMap) {
      const stats = typeMap[type];
      const avgTime = stats.count > 0 ? stats.totalTime / stats.count : 0;
      results.push({
        type: type,
        avgDuration: avgTime.toFixed(1),
        count: stats.count,
      });
    }

    results.sort((a, b) => b.avgDuration - a.avgDuration);
    return results;
  }, [bookmarks]);

  // Create a dynamic query key based on the actual bookmarks
  const bookmarkIds = bookmarks
    .map((b) => b.id)
    .sort()
    .join(",");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookmark-clusters", bookmarkIds],
    queryFn: () => fetchBookmarkClusters(bookmarks),
    enabled: bookmarks.length > 0,
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading clusters...</p>
        </div>
      </div>
    );
  if (isError || !data)
    return (
      <div className="text-center py-8 text-body text-error">
        Error loading clusters. Try adding more bookmarks.
      </div>
    );

  return (
    <div className="mt-4 space-y-3">
      {/* Grid Layout - 2 rows x 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Row 1, Col 1: Content Type vs Duration Chart */}
        <div className="bg-surface rounded-xl p-3 border border-border/50 dark:border-b-5 dark:border-b-gray-200">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Content Type vs Duration
          </h3>
          {contentTypeStats.length > 0 ? (
            <div className="space-y-2">
              {contentTypeStats.map((item, idx) => {
                const maxDuration = Math.max(
                  ...contentTypeStats.map((s) => parseFloat(s.avgDuration))
                );
                const widthPercentage =
                  maxDuration > 0
                    ? (parseFloat(item.avgDuration) / maxDuration) * 100
                    : 0;

                return (
                  <div key={item.type} className="flex items-center gap-3">
                    <div className="w-16 text-xs font-medium text-foreground text-right">
                      {item.type}
                    </div>
                    <div className="flex-1 relative">
                      <div className="w-full bg-surface-elevated rounded-full h-4 border border-border/20">
                        <div
                          className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                          style={{
                            width: `${Math.max(widthPercentage, 8)}%`,
                            background:
                              "linear-gradient(to right, var(--button-color), color-mix(in srgb, var(--button-color) 60%, transparent))",
                          }}
                        >
                          <span className="text-xs font-semibold text-primary-foreground">
                            {item.avgDuration}min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-8 text-xs text-foreground-secondary text-center">
                      {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-foreground-secondary">
              No content type data available
            </div>
          )}
        </div>

        {/* Row 1, Col 2: Bookmark Statistics */}
        <div className="bg-surface rounded-xl p-2 border border-border/50 dark:border-b-5 dark:border-b-gray-200">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Statistics
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {bookmarks.length}
              </div>
              <div className="text-xs text-foreground-secondary">Bookmarks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {data?.clusters?.length || 0}
              </div>
              <div className="text-xs text-foreground-secondary">
                Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {contentTypeStats.reduce((acc, stat) => acc + stat.count, 0)}
              </div>
              <div className="text-xs text-foreground-secondary">Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {contentTypeStats.length > 0
                  ? (
                      contentTypeStats.reduce(
                        (acc, stat) =>
                          acc + parseFloat(stat.avgDuration) * stat.count,
                        0
                      ) /
                      contentTypeStats.reduce(
                        (acc, stat) => acc + stat.count,
                        0
                      )
                    ).toFixed(1)
                  : "0"}
                min
              </div>
              <div className="text-xs text-foreground-secondary">
                Avg. Duration
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Combined Categories Bar Chart - spans both columns */}
        <div className="lg:col-span-2 bg-surface rounded-xl p-4 flex flex-col border border-border/50 dark:border-b-5 dark:border-b-gray-200">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">
            Cluster Map
          </h3>
          <div className="overflow-hidden">
            {data?.clusters && data.clusters.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.clusters.map((cluster, idx) => {
                  const colors = [
                    "#850c85",
                    "#850c85",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#06b6d4",
                    "#f97316",
                    "#84cc16",
                    "#ec4899",
                    "#6366f1",
                  ];
                  const color = colors[idx % colors.length];
                  const maxBookmarks = Math.max(
                    ...data.clusters.map((c) => c.bookmarks.length)
                  );
                  const widthPercentage =
                    (cluster.bookmarks.length / maxBookmarks) * 100;

                  return (
                    <div key={idx} className="flex items-center gap-4 group">
                      {/* Category name */}
                      <div className="w-32 text-sm font-medium text-foreground text-right flex-shrink-0">
                        {cluster.label}
                      </div>

                      {/* Bar container */}
                      <div className="flex-1 relative">
                        <div className="w-full bg-surface-elevated rounded-full h-5 border border-border/20 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-between px-3 group-hover:brightness-110"
                            style={{
                              width: `${Math.max(widthPercentage, 10)}%`,
                              background:
                                "linear-gradient(to right, var(--button-color), color-mix(in srgb, var(--button-color) 60%, transparent))",
                            }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {cluster.bookmarks.length}
                            </span>
                            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Percentage */}
                      <div className="w-12 text-xs text-foreground-secondary text-center flex-shrink-0">
                        {(
                          (cluster.bookmarks.length / bookmarks.length) *
                          100
                        ).toFixed(0)}
                        %
                      </div>

                      {/* YouTube button */}
                      <button
                        className="w-8 h-8 rounded-full bg-red-500 hover:bg-purple-600 transition-colors flex items-center justify-center text-white flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
                            cluster.label
                          )}`;
                          window.open(
                            youtubeUrl,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                        title={`Search YouTube for "${cluster.label}"`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 flex items-center justify-center text-foreground-secondary">
                No categories available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
