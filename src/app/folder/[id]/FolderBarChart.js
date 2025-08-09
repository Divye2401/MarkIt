import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function getReadingTimeBuckets(bookmarks) {
  const buckets = [
    { name: "0-5 min", count: 0 },
    { name: "5-10 min", count: 0 },
    { name: "10-20 min", count: 0 },
    { name: "20+ min", count: 0 },
  ];
  bookmarks.forEach((b) => {
    const t = b.reading_time || 0;
    if (t <= 5) buckets[0].count++;
    else if (t <= 10) buckets[1].count++;
    else if (t <= 20) buckets[2].count++;
    else buckets[3].count++;
  });
  return buckets;
}

export default function FolderBarChart({ bookmarks }) {
  const data = getReadingTimeBuckets(bookmarks);
  const hasData = data.some((bucket) => bucket.count > 0);
  return (
    <div className="w-full">
      <h4 className="text-heading-sm text-surface mb-2 text-center">
        Reading Time Distribution
      </h4>
      {hasData ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Bookmarks" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-40 flex items-center justify-center text-body text-foreground-muted">
          No reading time data
        </div>
      )}
    </div>
  );
}
