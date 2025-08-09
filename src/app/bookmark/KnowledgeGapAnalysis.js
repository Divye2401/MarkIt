"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchKnowledgeGaps,
  getPriorityColor,
  getCategoryIcon,
} from "../../utils/Frontend/KnowledgeHelpers";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

export default function KnowledgeGapAnalysis() {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: analysis,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["knowledge-gaps"],
    queryFn: fetchKnowledgeGaps,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <span className="font-medium">AI Analysis Failed</span>
        </div>
        <p className="text-red-600 text-sm mt-1">
          {analysis?.message || error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              My Learning Gaps
            </h3>
            <p className="text-gray-600 text-sm">
              AI analysis of my bookmark patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh analysis"
          >
            <RefreshCw
              size={16}
              className={isRefetching ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            {isExpanded ? "Collapse" : "View Details"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">
            Analyzing what I should learn next...
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* My Strengths */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={16} />
                <span className="font-medium text-green-800">My Strengths</span>
              </div>
              <div className="space-y-1">
                {analysis?.strengths?.slice(0, 3).map((strength, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* Things to Learn */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-orange-600" size={16} />
                <span className="font-medium text-orange-800">
                  Things to Learn
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {analysis?.gaps?.length || 0}
              </div>
              <div className="text-xs text-orange-600">areas to explore</div>
            </div>

            {/* Analysis Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="text-blue-600" size={16} />
                <span className="font-medium text-blue-800">Based on</span>
              </div>
              <div className="text-sm text-blue-700">
                {analysis?.metadata?.totalBookmarks || 0} bookmarks I have saved
              </div>
              <div className="text-xs text-blue-600">
                {analysis?.metadata?.analyzedAt &&
                  new Date(analysis.metadata.analyzedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Detailed View */}
          {isExpanded && (
            <div className="space-y-6 border-t pt-6">
              {/* What I Should Learn */}
              {analysis?.gaps && analysis.gaps.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-orange-600" />
                    What I Should Learn Next
                  </h4>
                  <div className="space-y-3">
                    {analysis.gaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 ${getPriorityColor(
                          gap.priority
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {getCategoryIcon(gap.category)}
                              </span>
                              <h5 className="font-medium">{gap.topic}</h5>
                              <span
                                className={`text-xs px-2 py-1 rounded uppercase font-semibold`}
                              >
                                {gap.priority}
                              </span>
                            </div>
                            <p className="text-sm opacity-90">{gap.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What I Should Do */}
              {analysis?.recommendations &&
                analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb size={16} className="text-blue-600" />
                      What I Should Do Next
                    </h4>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3"
                        >
                          <div className="text-blue-600 mt-0.5">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                          </div>
                          <p className="text-blue-800 text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* What I'm Already Into */}
              {analysis?.metadata?.topTopics && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    What Im Already Into
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.metadata.topTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {topic.tag} ({topic.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {analysis?.message && (
            <div className="text-center py-6 text-gray-600">
              <Brain size={32} className="mx-auto mb-2 text-gray-400" />
              <p>{analysis.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
