import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookmarkClusters } from "@/utils/Frontend/BookmarkHelpers";
import { useMemo } from "react";
import { createPoints } from "./[id]/createPoints";
import h337 from "heatmap.js";
import { useTheme } from "@/utils/Providers/ThemeProvider";

export default function BookmarkClusterMap({ bookmarks }) {
  const heatmapRef = useRef(null);
  const containerRef = useRef(null);
  const [labelPositions, setLabelPositions] = useState([]);
  const { theme } = useTheme();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookmark-clusters"],
    queryFn: fetchBookmarkClusters,
    enabled: bookmarks.length > 0,
    refetchOnWindowFocus: false,
  });

  const updateHeatmap = () => {
    if (!containerRef.current || !data?.clusters) return;

    // Get container dimensions
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    if (!width || !height) return; // Don't create heatmap if container not sized

    // Clear previous heatmap instance
    if (heatmapRef.current) {
      heatmapRef.current.setData({ data: [] });
    }

    // Create heatmap instance with theme-based colors
    const gradient =
      theme === "light"
        ? {
            ".2": "#3b82f6", // Blue for light mode
            ".4": "#1d4ed8", // Darker blue
            ".6": "#1e40af", // Even darker blue
            ".8": "#1e3a8a", // Navy blue
            1: "#1e293b", // Dark slate
          }
        : {
            ".2": "#4f46e5", // Primary color - low intensity
            ".4": "#6366f1", // Primary bright
            ".6": "#8b5cf6", // AI accent
            ".8": "#a855f7", // Purple
            1: "#c026d3", // Magenta - high intensity
          };

    heatmapRef.current = h337.create({
      container: containerRef.current,
      radius: Math.min(width, height) * 0.9, // Smaller, more defined clusters
      maxOpacity: 0.8,
      minOpacity: 0.3,
      blur: 0.2, // Much less blur for crisp edges
      gradient,
    });

    const max = Math.max(...data.clusters.map((c) => c.bookmarks.length));
    const points = createPoints(max, data, width, height);

    // Set data for heatmap
    heatmapRef.current.setData({
      max,
      data: points,
    });

    // Save label positions for overlay
    setLabelPositions(points.filter((p) => p.label));
  };

  useEffect(() => {
    updateHeatmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.clusters, theme]);

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
    <div className="mt-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Cluster Distribution Map - Separate Card */}
      <div className="flex-1 min-w-0 lg:w-[65%] bg-surface rounded-lg shadow p-6 border border-border">
        <h3 className="text-heading-md text-foreground mb-4">
          Cluster Distribution
        </h3>
        <div
          className={`w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden relative border-2 border-border shadow-sm ${
            theme === "light" ? "bg-gray-100" : "bg-surface"
          }`}
          style={{ height: "400px", minHeight: "400px" }}
        >
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{ width: "100%", height: "100%" }}
          />
          {labelPositions.map((pt, idx) => (
            <div
              className="absolute w-16 h-16 cursor-pointer hover:bg-white/1 group"
              key={idx}
              style={{
                left: pt.x,
                top: pt.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="hidden group-hover:block absolute bg-white/90 px-2 py-1 rounded shadow-lg"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#222",
                  fontWeight: "bold",
                  fontSize: 10,
                  textShadow: "0 1px 4px #fff, 0 0 8px #fff",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                <div>{pt.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bookmark Categories - Separate Card */}
      <div className="w-full lg:w-[35%] bg-surface rounded-lg shadow p-6 border border-border">
        <h3 className="text-heading-md text-foreground mb-4">
          Bookmark Categories
        </h3>
        <div className="h-[300px] sm:h-[400px] bg-surface-elevated rounded-lg border border-border flex flex-col">
          {/* Header */}
          <div className="px-4 py-2 bg-surface border-b border-border flex items-center">
            <div className="flex-1 text-heading-sm text-foreground">
              Category
            </div>
            <div className="w-20 text-right text-heading-sm text-foreground">
              Bookmarks
            </div>
          </div>
          {/* Scrollable rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-border flex flex-col">
            {data.clusters.map((cluster, idx) => (
              <div
                key={idx}
                className="flex items-center px-4 hover:bg-surface transition flex-1 min-h-[44px] cursor-pointer"
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
    </div>
  );
}
