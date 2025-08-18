"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchKnowledgeGaps,
  getPriorityColor,
  getCategoryIcon,
} from "../../utils/Frontend/KnowledgeHelpers";
import { useTheme } from "../../utils/Providers/ThemeProvider";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

export default function KnowledgeGapAnalysis({ bookmarks }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const bookmarkIds = bookmarks.map((b) => b.id);

  const {
    data: analysis,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["knowledge-gaps", bookmarkIds],
    queryFn: () => fetchKnowledgeGaps(bookmarkIds),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  if (error) {
    return (
      <div className="bg-error/10 border border-error/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle size={20} />
          <span className="text-heading-sm">AI Analysis Failed</span>
        </div>
        <p className="text-error text-body-sm mt-1">
          {analysis?.message || error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-error hover:text-error/80 text-body-sm underline transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-border/50 dark:border-b-white dark:border-b-3 dark:border-t-1 dark:border-t-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-ai-accent/20 rounded-lg">
            <Brain className="text-ai-accent" size={24} />
          </div>
          <div>
            <h3 className="text-heading-md text-ai-accent">My Learning Gaps</h3>
            <p className="text-body-lg text-gray-600 dark:text-ai-accent">
              AI analysis of my bookmark patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 text-foreground hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors disabled:opacity-50"
            title="Refresh analysis"
          >
            <RefreshCw
              size={16}
              className={isRefetching ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-body-sm bg-ai-accent/10 text-gray-600 dark:text-white rounded-lg hover:bg-ai-accent/20 transition-colors"
          >
            {isExpanded ? "Collapse" : "View Details"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ai-accent"></div>
          <span className="ml-3 text-body text-gray-600 dark:text-white">
            Analyzing what I should learn next...
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:mb-10">
            {/* My Strengths */}
            <div
              className={`${
                theme === "dark" ? "" : "bg-success/10 border border-success/20"
              } rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle
                  className={`${
                    theme === "dark" ? "text-success" : "text-success"
                  }`}
                  size={16}
                />
                <span
                  className={`text-heading-md ${
                    theme === "dark" ? "text-success" : "text-success"
                  }`}
                >
                  My Strengths
                </span>
              </div>
              <div className="space-y-1">
                {analysis?.strengths?.slice(0, 3).map((strength, idx) => (
                  <span
                    key={idx}
                    className={`inline-block ${
                      theme === "dark"
                        ? "bg-success/60 text-white"
                        : "bg-success/20 text-gray-600"
                    } text-sm px-2 py-1 rounded mr-1 mb-1`}
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* Things to Learn */}
            <div
              className={`${
                theme === "dark" ? "" : "bg-warning/10 border border-warning/20"
              } rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp
                  className={`${
                    theme === "dark" ? "text-warning" : "text-warning"
                  }`}
                  size={16}
                />
                <span
                  className={`text-heading-md ${
                    theme === "dark" ? "text-warning" : "text-warning"
                  }`}
                >
                  Things to Learn
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`text-heading-xl ${
                    theme === "dark" ? "text-warning" : "text-warning"
                  }`}
                >
                  {analysis?.gaps?.length || 0}
                </div>
                <span
                  className={`text-md ${
                    theme === "dark" ? "text-warning" : "text-gray-600"
                  }`}
                >
                  areas to explore
                </span>
              </div>
            </div>

            {/* Analysis Info */}
            <div
              className={`${
                theme === "dark" ? "" : "bg-primary/10 border border-primary/20"
              } rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain
                  className={`${
                    theme === "dark" ? "text-primary" : "text-primary"
                  }`}
                  size={16}
                />
                <span
                  className={`text-heading-md ${
                    theme === "dark" ? "text-primary" : "text-primary"
                  }`}
                >
                  Total Count
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`text-heading-xl ${
                    theme === "dark" ? "text-primary" : "text-primary"
                  }`}
                >
                  {analysis?.metadata?.totalBookmarks || 0}
                </div>
                <span
                  className={`text-md ${
                    theme === "dark" ? "text-primary" : "text-gray-600"
                  }`}
                >
                  unique bookmarks
                </span>
              </div>
            </div>
          </div>

          {/* Detailed View */}
          {isExpanded && (
            <div className="space-y-6 border-t dark:border-t-white dark:border-t-3  pt-6">
              {/* What I Should Learn */}
              {analysis?.gaps && analysis.gaps.length > 0 && (
                <div>
                  <h4 className="text-heading-md text-warning mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-warning" />
                    What I Should Learn Next
                  </h4>
                  <div className="space-y-3">
                    {analysis.gaps.map((gap, idx) => {
                      // Coordinated blue-purple-teal theme with 70% opacity

                      return (
                        <div
                          key={idx}
                          className={`${
                            theme === "dark"
                              ? `bg-gradient-to-r bg-surface text-white border-b-1 border-b-white`
                              : `border rounded-lg ${getPriorityColor(
                                  gap.priority
                                )}`
                          } rounded-lg p-4`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-lg ${
                                    theme === "dark" ? "text-white/90" : ""
                                  }`}
                                >
                                  {getCategoryIcon(gap.category)}
                                </span>
                                <h5
                                  className={`font-semibold ${
                                    theme === "dark"
                                      ? "text-white"
                                      : "font-medium"
                                  }`}
                                >
                                  {gap.topic}
                                </h5>
                                <span
                                  className={`text-xs px-2 py-1 rounded uppercase font-semibold ${
                                    theme === "dark"
                                      ? `${getPriorityColor(
                                          gap.priority,
                                          true
                                        )} !text-white`
                                      : ""
                                  }`}
                                >
                                  {gap.priority}
                                </span>
                              </div>
                              <p
                                className={`text-sm ${
                                  theme === "dark"
                                    ? "text-white/90"
                                    : "text-gray-600 dark:text-white"
                                }`}
                              >
                                {gap.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What I Should Do */}
              {analysis?.recommendations &&
                analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-heading-md text-primary mb-3 flex items-center gap-2">
                      <Lightbulb size={16} className="text-primary" />
                      What I Should Do Next
                    </h4>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, idx) => {
                        // Coordinated cool theme with 70% opacity

                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 ${
                              theme === "dark"
                                ? ` border-b-1 border-b-white text-white`
                                : "bg-primary/10 border border-primary/20"
                            } rounded-lg p-3`}
                          >
                            <div className="mt-0.5">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  theme === "dark"
                                    ? "bg-white/15 text-white"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </div>
                            <p
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-white/90"
                                  : "text-gray-600 dark:text-white"
                              }`}
                            >
                              {rec}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* What I'm Already Into */}
              {analysis?.metadata?.topTopics && (
                <div>
                  <h4 className="text-heading-md text-success mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    What I&apos;m Already Into
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.metadata.topTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="bg-surface-elevated text-gray-600 dark:text-white px-3 py-1 rounded-full text-body-sm"
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
            <div className="text-center py-6 text-gray-600 dark:text-white">
              <Brain size={32} className="mx-auto mb-2 text-foreground-muted" />
              <p className="text-body">{analysis.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
