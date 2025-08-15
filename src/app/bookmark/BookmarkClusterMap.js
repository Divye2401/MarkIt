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
      <div className="text-center py-8 text-body text-foreground-secondary">
        Loading clusters...
      </div>
    );
  if (isError || !data)
    return (
      <div className="text-center py-8 text-body text-error">
        Error loading clusters.
      </div>
    );

  return (
    <div className="mt-6 space-y-6">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Row 1, Col 1-2: Content Type vs Duration Chart */}
        <div className="lg:col-span-3 bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-border/50 dark:border-b-1 dark:border-b-white">
          <h3 className="text-heading-md text-foreground mb-4">
            Content Type vs Average Duration
          </h3>
          {contentTypeStats.length > 0 ? (
            <div className="space-y-3">
              {contentTypeStats.map((item, idx) => {
                const maxDuration = Math.max(
                  ...contentTypeStats.map((s) => parseFloat(s.avgDuration))
                );
                const widthPercentage =
                  maxDuration > 0
                    ? (parseFloat(item.avgDuration) / maxDuration) * 100
                    : 0;

                return (
                  <div key={item.type} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-foreground text-right">
                      {item.type}
                    </div>
                    <div className="flex-1 relative">
                      <div className="w-full bg-surface-elevated rounded-full h-6 border border-border/30">
                        <div
                          className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
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
                    <div className="w-12 text-xs text-foreground-secondary text-center">
                      {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-foreground-secondary">
              No content type data available
            </div>
          )}
        </div>

        {/* Row 1-2, Col 3: Bookmark Categories (spans 2 rows) */}
        <div className="lg:row-span-2 bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-border/50 flex flex-col dark:border-r-2 dark:border-r-white">
          <h3 className="text-heading-md text-foreground mb-4 flex-shrink-0">
            Bookmark Categories
          </h3>
          <div className="flex-1 bg-surface-elevated rounded-lg border border-border flex flex-col min-h-0">
            {/* Header */}
            <div className="px-4 py-2 bg-surface border-b border-border flex items-center">
              <div className="flex-1 text-heading-sm text-foreground">
                Category
              </div>
              <div className=" text-right text-heading-sm text-foreground ">
                Bookmarks
              </div>
            </div>
            {/* Scrollable rows */}
            <div className="h-full overflow-y-auto divide-y divide-border flex flex-col">
              {data.clusters.map((cluster, idx) => (
                <div
                  key={idx}
                  className="flex items-center px-4 hover:bg-surface-elevated bg-surface transition flex-1 min-h-[44px] cursor-pointer"
                  onClick={() => {
                    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
                      cluster.label
                    )}`;
                    window.open(googleUrl, "_blank", "noopener,noreferrer");
                  }}
                  title={`Search Google for "${cluster.label}"`}
                >
                  <div className="flex-1 text-body text-foreground">
                    {cluster.label}
                  </div>
                  <div className="w-20 text-right text-body-sm text-foreground-secondary">
                    {cluster.bookmarks.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2, Col 1-2: New Statistics Div */}
        <div className="lg:col-span-2 bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border border-border/50">
          <h3 className="text-heading-md text-foreground mb-4">
            Bookmark Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {bookmarks.length}
              </div>
              <div className="text-sm text-foreground-secondary">
                Total Bookmarks
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {data?.clusters?.length || 0}
              </div>
              <div className="text-sm text-foreground-secondary">
                Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {contentTypeStats.reduce((acc, stat) => acc + stat.count, 0)}
              </div>
              <div className="text-sm text-foreground-secondary">
                Items Analyzed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
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
              <div className="text-sm text-foreground-secondary">
                Avg. Duration
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Cluster Distribution Map */}
        <div className="lg:col-span-2 bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-border/50 dark:border-2 dark:border-white">
          <h3 className="text-heading-md text-foreground mb-4">
            Cluster Distribution
          </h3>
          <div
            className={`w-full h-[400px] rounded-lg overflow-hidden relative border-2 border-border shadow-sm ${
              theme === "light"
                ? "bg-gradient-to-br from-slate-50 to-blue-50"
                : "bg-gradient-to-br from-slate-900 to-blue-900"
            }`}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 600 400"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background grid for reference */}
              <defs>
                <pattern
                  id="grid"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 30 0 L 0 0 0 30"
                    fill="none"
                    stroke={theme === "light" ? "#e2e8f0" : "#334155"}
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Render clusters as clean circles */}
              {data?.clusters?.map((cluster, idx) => {
                const colors = [
                  "#3b82f6",
                  "#10b981",
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

                // Calculate truly random position for each cluster
                const maxBookmarks = Math.max(
                  ...data.clusters.map((c) => c.bookmarks.length)
                );

                // Generate truly random positions (different each time)
                const normalizedX = Math.random();
                const normalizedY = Math.random();
                const sizeVariation = Math.random() * 0.6; // 30% variation

                // Add some organic size variation while keeping proportional to bookmark count
                const baseRadius =
                  10 + (cluster.bookmarks.length / maxBookmarks) * 25; // Smaller base: 10-35px instead of 20-60px
                const finalRadius = baseRadius + sizeVariation * 8; // Smaller variation: ±8px instead of ±15px

                // Calculate position with much wider scatter and minimal padding
                const padding = 25; // Much smaller padding for wider distribution
                const x = padding + Math.abs(normalizedX) * (600 - 2 * padding);
                const y = padding + Math.abs(normalizedY) * (400 - 2 * padding);

                return (
                  <g key={idx}>
                    {/* Outer glow */}
                    <circle
                      cx={x}
                      cy={y}
                      r={finalRadius + 5}
                      fill={color}
                      opacity="0.15"
                      className="animate-pulse"
                    />
                    {/* Main circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={finalRadius}
                      fill={color}
                      opacity="0.8"
                      stroke="white"
                      strokeWidth="2"
                      className="hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => {
                        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
                          cluster.label
                        )}`;
                        window.open(googleUrl, "_blank", "noopener,noreferrer");
                      }}
                    />
                    {/* Center dot */}
                    <circle cx={x} cy={y} r="2" fill="white" opacity="0.9" />
                    {/* Label */}
                    <text
                      x={x}
                      y={y + finalRadius + 15}
                      textAnchor="middle"
                      className="text-xs font-medium fill-current text-foreground"
                      style={{ fontSize: "9px" }}
                    >
                      {cluster.label}
                    </text>
                    <text
                      x={x}
                      y={y + finalRadius + 28}
                      textAnchor="middle"
                      className="text-xs fill-current text-foreground-secondary"
                      style={{ fontSize: "8px" }}
                    >
                      {cluster.bookmarks.length} items
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
