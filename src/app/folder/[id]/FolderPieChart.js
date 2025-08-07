import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#fa8072",
];

function getTagData(bookmarks) {
  const tagCount = {};
  bookmarks.forEach((b) => {
    if (Array.isArray(b.tags)) {
      b.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    }
  });

  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1]) // sort by value descending
    .slice(0, 5) // limit to top 3
    .map(([name, value]) => ({ name, value }));
  return topTags;
}

export default function FolderPieChart({ bookmarks }) {
  const data = getTagData(bookmarks);
  if (!data.length) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-gray-400">
        No tag data
      </div>
    );
  }
  return (
    <div className="w-full">
      <h4 className="text-md font-semibold mb-2 text-center">
        Labeled By Tags
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
