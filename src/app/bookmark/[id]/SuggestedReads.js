import React from "react";

export default function SuggestedReads({ suggestedResults }) {
  return (
    <div className="mt-6 mb-2 border-t border-zinc-700 pt-4">
      <div className="text-sm font-semibold text-zinc-300 mb-1">
        Suggested Reads
      </div>
      <ul className="list-disc ml-6 text-blue-300 text-sm">
        {Array.isArray(suggestedResults) && suggestedResults.length > 0 ? (
          suggestedResults.map((item, idx) => (
            <li key={idx} className="mb-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline text-blue-400"
              >
                {item.title}
              </a>
              <div className="text-zinc-400">{item.description}</div>
            </li>
          ))
        ) : (
          <li>Loading...</li>
        )}
      </ul>
    </div>
  );
}
