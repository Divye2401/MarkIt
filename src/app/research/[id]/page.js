/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchResearchProject,
  updateResearchProject,
} from "../../../utils/Frontend/ResearchHelpers";
import { fetchBookmarks } from "../../../utils/Frontend/BookmarkHelpers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import {
  ArrowLeft,
  Target,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Brain,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Plus,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function ResearchProjectPage() {
  const router = useRouter();
  const { id: projectId } = useParams();
  const queryClient = useQueryClient();

  // Modal state
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);

  // Fetch research project with analysis

  const {
    data: project,
    isFetching,

    error,
  } = useQuery({
    queryKey: ["research-project", projectId],
    queryFn: () => {
      return fetchResearchProject(projectId);
    },
    // Explicitly override ALL refetch settings
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // Fetch all bookmarks for selection (only when modal is open)
  const { data: allBookmarks = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    enabled: showAddBookmarkModal,
  });

  // Filter available bookmarks (exclude ones already in the project)
  const availableBookmarks = allBookmarks.filter(
    (bookmark) => !project?.bookmark_ids?.includes(bookmark.id)
  );

  // Filter bookmarks based on search
  const filteredBookmarks = availableBookmarks.filter(
    (bookmark) =>
      bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleBookmarkToggle = (bookmarkId) => {
    setSelectedBookmarks((prev) =>
      prev.includes(bookmarkId)
        ? prev.filter((id) => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleAddBookmarks = async () => {
    if (selectedBookmarks.length === 0) {
      toast.error("Please select at least one bookmark");
      return;
    }

    if (
      selectedBookmarks.length + project.bookmark_ids.length >
      project.required_sources
    ) {
      toast.error(
        "You cannot add more bookmarks than the required number of sources"
      );
      return;
    }

    try {
      const updatedBookmarkIds = [
        ...(project.bookmark_ids || []),
        ...selectedBookmarks,
      ];

      await updateResearchProject(projectId, {
        bookmark_ids: updatedBookmarkIds,
      });

      // Invalidate and refetch the research project
      queryClient.invalidateQueries(["research-project", projectId]);

      toast.success(
        `Added ${selectedBookmarks.length} bookmark(s) to research project`
      );
      setShowAddBookmarkModal(false);
      setSelectedBookmarks([]);
      setSearchQuery("");
    } catch (error) {
      toast.error("Failed to add bookmarks to research project");
      console.error("Error adding bookmarks:", error);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      const updatedBookmarkIds = (project.bookmark_ids || []).filter(
        (id) => id !== bookmarkId
      );

      await updateResearchProject(projectId, {
        bookmark_ids: updatedBookmarkIds,
      });

      // Invalidate and refetch the research project
      queryClient.invalidateQueries(["research-project", projectId]);

      toast.success("Bookmark removed from research project");
    } catch (error) {
      toast.error("Failed to remove bookmark from research project");
      console.error("Error removing bookmark:", error);
    }
  };

  if (isFetching && !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-zinc-400">
            Loading research project and generating AI analysis...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project Not Found
          </h1>
          <p className="text-zinc-400 mb-4">
            The research project you&apos;re looking for doesn&apos;t exist or
            you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push("/bookmark")}>
            Back to Bookmarks
          </Button>
        </div>
      </div>
    );
  }

  const analysis = project.analysis;
  const progress = analysis?.progress;
  const argumentAnalysis = analysis?.argumentAnalysis;
  const researchPlan = analysis?.researchPlan;
  const gaps = analysis?.gaps;
  const methodology = analysis?.methodology;
  const timeline = analysis?.timeline;
  const sourcesBreakdown = analysis?.sourcesBreakdown;
  const strengths = analysis?.strengths;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
          alt="research background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/85 to-zinc-800/70" />
      </div>

      {/* Loading Overlay for Refetching */}
      {isFetching && (
        <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-zinc-400">Updating research analysis...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-zinc-200">
              {project.title}
            </h1>
            <p className="text-zinc-400 mt-1">
              {project.subject_area && `${project.subject_area} • `}
              {project.bookmarks?.length || 0} sources •
              {project.due_date &&
                ` Due: ${new Date(project.due_date).toLocaleDateString()}`}
            </p>
          </div>
          <Button
            onClick={() => setShowAddBookmarkModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Add Bookmarks
          </Button>
        </div>

        {/* Thesis Statement */}
        <Card className="mb-8 bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Target size={20} className="text-purple-400" />
              Thesis Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-zinc-200 font-medium">
              &quot;{project.thesis_statement}&quot;
            </p>
            {project.description && (
              <p className="text-xs text-zinc-400 mt-2">
                {project.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        {progress && (
          <Card className="mb-8 bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl">
            <CardHeader className="pb-0 ">
              <CardTitle className="flex items-center gap-2  ">
                <TrendingUp className="text-green-400" size={20} />
                <span className="text-zinc-200">Research Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 px-3  pt-0 ">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {progress.completionPercentage}%
                  </div>
                  <div className="text-xs text-white">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {progress.qualityScore}/100
                  </div>
                  <div className="text-xs text-white">Quality Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400 capitalize">
                    {progress.readinessLevel}
                  </div>
                  <div className="text-xs text-white">Readiness</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Research Plan */}
          {researchPlan && (
            <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-blue-400" size={20} />
                  <span className="text-zinc-200">Strategic Research Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {researchPlan.immediateNext &&
                  researchPlan.immediateNext.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-400 h-6">
                        <Clock size={16} className="text-red-400" />
                        Immediate Next Steps
                      </h4>
                      <div className="space-y-2">
                        {researchPlan.immediateNext.map((action, index) => (
                          <div key={index} className="p-2.5">
                            <p className="text-white text-xs leading-relaxed">
                              {action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {researchPlan.shortTerm &&
                  researchPlan.shortTerm.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-orange-400 h-6">
                        <Calendar size={16} className="text-orange-400" />
                        Short-term Goals (1-2 weeks)
                      </h4>
                      <div className="space-y-2">
                        {researchPlan.shortTerm.map((goal, index) => (
                          <div key={index} className="p-2.5">
                            <p className="text-white text-xs leading-relaxed">
                              {goal}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {researchPlan.longTerm && researchPlan.longTerm.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-green-400 h-6">
                      <Target size={16} className="text-green-400" />
                      Long-term Goals
                    </h4>
                    <div className="space-y-2">
                      {researchPlan.longTerm.map((goal, index) => (
                        <div key={index} className="p-2.5">
                          <p className="text-white text-xs leading-relaxed">
                            {goal}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {researchPlan.searchTerms &&
                  researchPlan.searchTerms.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-400 h-6 flex items-center">
                        Suggested Search Terms:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {researchPlan.searchTerms.map((term, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-900/20 text-white rounded-full text-xs border border-blue-200 dark:border-blue-800"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Research Gaps */}
          {gaps && (
            <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-orange-400" size={20} />
                  <span className="text-zinc-200">Research Gaps</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gaps.critical && gaps.critical.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-400 h-6">
                      <AlertTriangle size={16} />
                      Critical Gaps
                    </h4>
                    <div className="space-y-2">
                      {gaps.critical.map((gap, index) => (
                        <div key={index} className="p-3">
                          <p className="text-white text-xs leading-relaxed">
                            {gap}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gaps.important && gaps.important.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-orange-400 h-6">
                      <Clock size={16} />
                      Important Gaps
                    </h4>
                    <div className="space-y-2">
                      {gaps.important.map((gap, index) => (
                        <div key={index} className="p-3">
                          <p className="text-white text-xs leading-relaxed">
                            {gap}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gaps["nice-to-have"] && gaps["nice-to-have"].length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-blue-400 h-6">
                      <Lightbulb size={16} />
                      Nice-to-Have
                    </h4>
                    <div className="space-y-2">
                      {gaps["nice-to-have"].map((gap, index) => (
                        <div
                          key={index}
                          className=" bg-blue-900/20 p-3 rounded-lg"
                        >
                          <p className="text-white text-xs leading-relaxed">
                            {gap}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 gap-8 mt-12">
          {/* Argument Analysis */}
          {argumentAnalysis && (
            <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="text-indigo-400" size={20} />
                  <span className="text-zinc-200">Argument Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2">
                    <div className="text-lg font-bold text-green-400">
                      {argumentAnalysis.supporting || 0}
                    </div>
                    <div className="text-xs text-white">Supporting</div>
                  </div>
                  <div className="p-2">
                    <div className="text-lg font-bold text-red-400">
                      {argumentAnalysis.opposing || 0}
                    </div>
                    <div className="text-xs text-white">Opposing</div>
                  </div>
                  <div className="p-2">
                    <div className="text-lg font-bold text-yellow-400">
                      {argumentAnalysis.neutral || 0}
                    </div>
                    <div className="text-xs text-white">Neutral</div>
                  </div>
                </div>

                {argumentAnalysis.strongestSupport && (
                  <div className="p-2">
                    <h4 className="font-semibold mb-1 text-green-400 text-sm">
                      Strongest Supporting Evidence:
                    </h4>
                    <p className="text-white text-xs leading-relaxed">
                      {argumentAnalysis.strongestSupport}
                    </p>
                  </div>
                )}

                {argumentAnalysis.weakestPoint && (
                  <div className="p-2">
                    <h4 className="font-semibold mb-1 text-red-400 text-sm">
                      Weakest Point:
                    </h4>
                    <p className="text-white text-xs leading-relaxed">
                      {argumentAnalysis.weakestPoint}
                    </p>
                  </div>
                )}

                {argumentAnalysis.counterArgumentStrengthExplanation && (
                  <div className="p-2">
                    <h4 className="font-semibold mb-1 text-orange-400 text-sm">
                      Counter-argument Analysis{": "}
                      {argumentAnalysis.counterArgumentStrength}
                    </h4>
                    <p className="text-white text-xs leading-relaxed">
                      {argumentAnalysis.counterArgumentStrengthExplanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Methodology & Timeline */}
          <div className="space-y-6">
            {/* Methodology */}
            {methodology && (
              <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="text-purple-400" size={20} />
                    <span className="text-zinc-200">Methodology</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {methodology.suggestedApproach && (
                    <div>
                      <h4 className="font-semibold mb-2 text-purple-400 h-6 flex items-center">
                        Suggested Approach:
                      </h4>
                      <p className="text-white text-xs leading-relaxed">
                        {methodology.suggestedApproach}
                      </p>
                    </div>
                  )}

                  {methodology.citationStyle && (
                    <div>
                      <h4 className="font-semibold mb-2 text-purple-400 h-6 flex items-center">
                        Citation Style:
                      </h4>
                      <p className="text-white text-xs leading-relaxed">
                        {methodology.citationStyle}
                      </p>
                    </div>
                  )}

                  {methodology.organizationTips &&
                    methodology.organizationTips.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-purple-400 h-6 flex items-center">
                          Organization Tips:
                        </h4>
                        <div className="space-y-2">
                          {methodology.organizationTips.map((tip, index) => (
                            <div
                              key={index}
                              className="bg-purple-900/20 p-3 rounded-lg"
                            >
                              <p className="text-white text-xs leading-relaxed">
                                {tip}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            {timeline && (
              <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="text-indigo-400" size={20} />
                    <span className="text-zinc-200">Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timeline.urgency && (
                    <div>
                      <h4 className="font-semibold mb-2 text-indigo-400 h-6 flex items-center">
                        Urgency: {timeline.urgency.split(" ")[0].toUpperCase()}
                      </h4>
                      <div className="p-3">
                        <p className="text-white text-xs leading-relaxed">
                          {timeline.urgency}
                        </p>
                      </div>
                    </div>
                  )}

                  {timeline.weeklyGoals && timeline.weeklyGoals.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-indigo-400 h-6 flex items-center">
                        Weekly Goals:
                      </h4>
                      <div className="space-y-2">
                        {timeline.weeklyGoals.map((goal, index) => (
                          <div key={index} className="p-3">
                            <p className="text-white text-xs leading-relaxed">
                              <strong>Week {index + 1}:</strong> {goal}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {timeline.milestones && timeline.milestones.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-indigo-400 h-6 flex items-center">
                        Milestones:
                      </h4>
                      <div className="space-y-2">
                        {timeline.milestones.map((milestone, index) => (
                          <div
                            key={index}
                            className="bg-indigo-900/20 p-3 rounded-lg"
                          >
                            <p className="text-white text-xs leading-relaxed">
                              {milestone}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Sources Breakdown */}
          {sourcesBreakdown && (
            <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-green-400" size={20} />
                  <span className="text-zinc-200">Sources Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3">
                    <div className="text-xl font-bold text-green-400">
                      {sourcesBreakdown.recent || 0}
                    </div>
                    <div className="text-xs text-green-400">Recent (2022+)</div>
                  </div>
                  <div className="text-center p-3">
                    <div className="text-xl font-bold text-purple-400">
                      {sourcesBreakdown.peerReviewed || 0}
                    </div>
                    <div className="text-xs text-purple-400">Peer Reviewed</div>
                  </div>
                  <div className="text-center p-3">
                    <div className="text-xl font-bold text-red-400">
                      {sourcesBreakdown.primary || 0}
                    </div>
                    <div className="text-xs text-red-400">Primary</div>
                  </div>
                  <div className="text-center p-3">
                    <div className="text-xl font-bold text-yellow-400">
                      {sourcesBreakdown.secondary || 0}
                    </div>
                    <div className="text-xs text-yellow-400">Secondary</div>
                  </div>
                </div>

                {sourcesBreakdown.credibilityScore && (
                  <div className="text-center p-3  rounded-lg">
                    <div className="text-3xl font-bold text-gray-300">
                      {sourcesBreakdown.credibilityScore}/100
                    </div>
                    <div className="text-xs text-white">
                      Overall Credibility Score
                    </div>
                  </div>
                )}

                {sourcesBreakdown.qualityAnalysis && (
                  <div className="p-3">
                    <h4 className="font-semibold mb-2 text-green-400 h-6 flex items-center">
                      Quality Analysis:
                    </h4>
                    <p className="text-white text-xs leading-relaxed">
                      {sourcesBreakdown.qualityAnalysis}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {strengths && strengths.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-zinc-200">Research Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {strengths.map((strength, index) => (
                  <div key={index} className="p-3">
                    <p className="text-white text-xs leading-relaxed">
                      {strength}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bookmarks Section */}
        {project.bookmarks && project.bookmarks.length > 0 && (
          <Card className="mt-12 bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-blue-400" size={20} />
                <span className="text-zinc-200">
                  Research Sources ({project.bookmarks.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {project.bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-zinc-800 border border-zinc-600/40 rounded-lg p-3 hover:bg-zinc-900 focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm hover:shadow-lg relative group"
                  >
                    {/* Delete Button */}
                    <Button
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 hover:bg-red-800/20"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>

                    <h4 className="font-semibold text-sm text-zinc-200 mb-1 leading-tight pr-6 ">
                      {bookmark.title}
                    </h4>

                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {bookmark.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {bookmark.tags.length > 2 && (
                          <span className="text-xs text-zinc-500">
                            +{bookmark.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 focus:ring-1 focus:ring-blue-500 rounded truncate block"
                    >
                      {bookmark.url}
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Bookmark Modal */}
        <Dialog
          open={showAddBookmarkModal}
          onOpenChange={setShowAddBookmarkModal}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="text-blue-600" size={20} />
                Add Bookmarks to Research Project
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookmarks by title, summary, or tags..."
                  className="pl-10"
                />
              </div>

              {/* Selection Info */}
              {selectedBookmarks.length > 0 && (
                <div className="card-subtle-muted p-3 rounded-lg">
                  <p className="text-blue-400 text-xs">
                    {selectedBookmarks.length} bookmark(s) selected
                  </p>
                </div>
              )}

              {/* Bookmarks Grid */}
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400">
                    {availableBookmarks.length === 0
                      ? "All your bookmarks are already in this research project!"
                      : "No bookmarks found matching your search."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedBookmarks.includes(bookmark.id)
                          ? "border-blue-500 card-subtle-muted"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                      onClick={() => handleBookmarkToggle(bookmark.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                            selectedBookmarks.includes(bookmark.id)
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedBookmarks.includes(bookmark.id) && (
                            <CheckCircle className="text-white" size={12} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {bookmark.title}
                          </h3>

                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {bookmark.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-gray-100 dark:bg-gray-800 text-zinc-400 px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {bookmark.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{bookmark.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddBookmarkModal(false);
                    setSelectedBookmarks([]);
                    setSearchQuery("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddBookmarks}
                  disabled={selectedBookmarks.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add{" "}
                  {selectedBookmarks.length > 0 &&
                    `${selectedBookmarks.length} `}
                  Bookmark{selectedBookmarks.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
