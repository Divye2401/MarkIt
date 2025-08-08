import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBookmarkClusters } from "@/utils/Frontend/BookmarkHelpers";
import { useMemo } from "react";
import { createPoints } from "./[id]/createPoints";
import h337 from "heatmap.js";

export default function BookmarkClusterMap({ bookmarks }) {
  const heatmapRef = useRef(null);
  const containerRef = useRef(null);
  const [labelPositions, setLabelPositions] = useState([]);

  const bookmarkKey = useMemo(
    () =>
      bookmarks
        .map((b) => b.id)
        .sort()
        .join(","),
    [bookmarks]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookmark-clusters", bookmarkKey],
    queryFn: fetchBookmarkClusters,
    enabled: bookmarks.length > 0,
    refetchOnWindowFocus: false,
  });

  const updateHeatmap = useCallback(() => {
    if (!containerRef.current || !data?.clusters) return;

    // Get container dimensions
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    if (!width || !height) return; // Don't create heatmap if container not sized

    // Clear previous heatmap instance
    if (heatmapRef.current) {
      heatmapRef.current.setData({ data: [] });
    }

    // Create heatmap instance
    heatmapRef.current = h337.create({
      container: containerRef.current,
      radius: Math.min(width, height) * 0.15, // Responsive radius
      maxOpacity: 0.95,
      minOpacity: 0.1,
      blur: 0.55,
      gradient: {
        ".1": "#ffe29a",
        ".4": "#ffd166",
        ".7": "#f46036",
        1: "#d7263d",
      },
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
  }, [data, setLabelPositions]);

  useEffect(() => {
    updateHeatmap(); //for initial render
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      updateHeatmap();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [data?.clusters, updateHeatmap]);

  if (isLoading) return <div>Loading clusters...</div>;
  if (isError || !data) return <div>Error loading clusters.</div>;

  return (
    <div className="mt-8 space-y-6">
      {/* Responsive Container */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {/* Flex Container - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Heatmap Container - Full width on mobile, 65% on desktop */}
          <div className="flex-1 min-w-0 lg:w-[65%]">
            <h3 className="text-lg font-semibold mb-4">Cluster Distribution</h3>
            <div className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden relative bg-gradient-to-br from-blue-900 via-blue-600 to-green-300">
              <div ref={containerRef} className="absolute inset-0" />
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

          {/* Categories Table - Full width on mobile, 35% on desktop */}
          <div className="flex-1 lg:w-[35%] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Bookmark Categories</h3>
            <div className="overflow-x-auto flex-1">
              <table className="min-w-[250px] w-full border border-gray-300 rounded text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Bookmarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clusters.map((cluster, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {cluster.label}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {cluster.bookmarks.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
