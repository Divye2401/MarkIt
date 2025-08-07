import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

export default function FolderTimeline({ bookmarks }) {
  // Group bookmarks by date
  const dateCounts = {};
  bookmarks.forEach((b) => {
    const date = b.created_at?.slice(0, 10); // 'YYYY-MM-DD'
    if (date) {
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    }
  });

  console.log(dateCounts);
  const values = Object.entries(dateCounts).map(([date, count]) => ({
    date,
    count,
  }));
  // convert object of {date: count} to array of [ [ date, count] ] which then gets converted to array of [{date, count}]

  // Optionally, set a date range
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 2);

  return (
    <div className="w-[80%]">
      <h4 className="text-md font-semibold mb-2 text-center">
        Bookmark Activity
      </h4>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={values}
        classForValue={(value) => {
          if (!value) return "color-empty";
          if (value.count >= 5) return "color-github-4";
          if (value.count >= 3) return "color-github-3";
          if (value.count >= 2) return "color-github-2";
          return "color-github-1";
        }}
        showWeekdayLabels={true}
      />
    </div>
  );
}
