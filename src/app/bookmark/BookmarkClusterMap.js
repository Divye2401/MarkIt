import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookmarkClusters } from "@/utils/Frontend/BookmarkHelpers";
import { useTheme } from "@/utils/Providers/ThemeProvider";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bubble } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

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

  // Prepare bubble chart data
  const bubbleChartData = useMemo(() => {
    if (!data?.clusters || data.clusters.length === 0) return null;

    const colors = [
      "rgba(133, 12, 133, 0.8)", // Purple
      "rgba(245, 158, 11, 0.8)", // Amber
      "rgba(239, 68, 68, 0.8)", // Red
      "rgba(139, 92, 246, 0.8)", // Violet
      "rgba(6, 182, 212, 0.8)", // Cyan
      "rgba(249, 115, 22, 0.8)", // Orange
      "rgba(132, 204, 22, 0.8)", // Lime
      "rgba(236, 72, 153, 0.8)", // Pink
      "rgba(99, 102, 241, 0.8)", // Indigo
      "rgba(34, 197, 94, 0.8)", // Green
    ];

    return {
      datasets: [
        {
          label: "Bookmark Clusters",
          data: data.clusters.map((cluster, idx) => ({
            x: cluster.daysSinceLastBookmark || 0,
            y: cluster.bookmarksPerWeek || 0,
            r: Math.max(8, Math.min(30, cluster.count * 2)), // Bubble radius
            label: cluster.label,
            count: cluster.count,
            color: colors[idx % colors.length],
          })),
          backgroundColor: data.clusters.map(
            (_, idx) => colors[idx % colors.length]
          ),
          borderColor: data.clusters.map((_, idx) =>
            colors[idx % colors.length].replace("0.8", "1")
          ),
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor:
            theme === "dark"
              ? "rgba(0, 0, 0, 0.8)"
              : "rgba(255, 255, 255, 0.9)",
          titleColor: theme === "dark" ? "#fff" : "#000",
          bodyColor: theme === "dark" ? "#fff" : "#000",
          borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
          borderWidth: 1,
          callbacks: {
            title: (context) => context[0].raw.label,
            label: (context) => [
              `Bookmarks: ${context.raw.count}`,
              `Days since last: ${context.raw.x.toFixed(1)}`,
              `Per week: ${context.raw.y.toFixed(2)}`,
            ],
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Days Since Last Bookmark",
            color: theme === "dark" ? "#9ca3af" : "#6b7280",
          },
          grid: {
            color:
              theme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "#9ca3af" : "#6b7280",
          },
        },
        y: {
          title: {
            display: true,
            text: "Bookmarks Per Week",
            color: theme === "dark" ? "#9ca3af" : "#6b7280",
          },
          grid: {
            color:
              theme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "#9ca3af" : "#6b7280",
          },
        },
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const dataIndex = elements[0].index;
          const cluster = data.clusters[dataIndex];
          if (cluster) {
            const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
              cluster.label
            )}`;
            window.open(youtubeUrl, "_blank", "noopener,noreferrer");
          }
        }
      },
    }),
    [theme, data]
  );

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

        {/* Row 2: Bubble Chart - spans both columns */}
        <div className="lg:col-span-2 bg-surface rounded-xl p-4 flex flex-col border border-border/50 dark:border-b-5 dark:border-b-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex-shrink-0">
              Cluster Activity Map
            </h3>
            <div className="text-xs text-foreground-secondary">
              Click bubbles to search YouTube
            </div>
          </div>

          {bubbleChartData ? (
            <div className="flex-1" style={{ minHeight: "300px" }}>
              <Bubble data={bubbleChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="py-8 flex items-center justify-center text-foreground-secondary">
              No cluster data available
            </div>
          )}

          {/* Legend */}
          {data?.clusters && data.clusters.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/20">
              <div className="text-xs text-foreground-secondary mb-2">
                Clusters:
              </div>
              <div className="flex flex-wrap gap-2">
                {data.clusters.slice(0, 8).map((cluster, idx) => {
                  const colors = [
                    "rgba(133, 12, 133, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(6, 182, 212, 0.8)",
                    "rgba(249, 115, 22, 0.8)",
                    "rgba(132, 204, 22, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                  ];
                  return (
                    <div key={idx} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      ></div>
                      <span className="text-xs text-foreground-secondary">
                        {cluster.label} (
                        {cluster.count || cluster.bookmarks?.length || 0})
                      </span>
                    </div>
                  );
                })}
                {data.clusters.length > 8 && (
                  <span className="text-xs text-foreground-secondary">
                    +{data.clusters.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
