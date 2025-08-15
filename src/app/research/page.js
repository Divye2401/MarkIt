"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchBookmarks } from "../../utils/Frontend/BookmarkHelpers";
import { createResearchProject } from "../../utils/Frontend/ResearchHelpers";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import {
  ArrowLeft,
  Search,
  Calendar,
  Target,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function CreateResearchPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Project Details, 2: Select Bookmarks, 3: Review

  // Form state
  const [projectTitle, setProjectTitle] = useState("");
  const [thesisStatement, setThesisStatement] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [requiredSources, setRequiredSources] = useState(10);
  const [description, setDescription] = useState("");
  const [subjectArea, setSubjectArea] = useState("");

  // Bookmark selection state
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch bookmarks for selection
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    enabled: step === 2, // Only fetch when needed
  });

  // Filter bookmarks based on search
  const filteredBookmarks = bookmarks.filter(
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

  const handleCreateProject = async () => {
    try {
      const projectData = {
        title: projectTitle,
        thesis_statement: thesisStatement,
        due_date: dueDate || null,
        required_sources: requiredSources,
        description,
        subject_area: subjectArea,
        selected_bookmarks: selectedBookmarks,
      };

      console.log("Creating research project:", projectData);

      const result = await createResearchProject(projectData);

      if (result.success) {
        toast.success("Research project created!");
        router.push(`/research/${result.project.id}`);
      } else {
        throw new Error(result.error || "Failed to create project");
      }
    } catch (error) {
      toast.error("Failed to create research project");
      console.error("Creation error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-200">
              🔬 Create Research Project
            </h1>
            <p className="text-zinc-400 mt-1">
              Organize your bookmarks into a structured research workflow
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNum
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-16 h-1 mx-4 transition-colors ${
                      step > stepNum ? "bg-purple-600" : "bg-zinc-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Project Details */}
        {step === 1 && (
          <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-purple-400" size={20} />
                <span className="text-zinc-200">Project Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-400 mb-2">
                  Project Title *
                </label>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Climate Change Economics Research"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-400 mb-2">
                  Thesis Statement *
                </label>
                <Textarea
                  value={thesisStatement}
                  onChange={(e) => setThesisStatement(e.target.value)}
                  placeholder="e.g., Carbon taxes are more effective than cap-and-trade systems for reducing emissions"
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-400 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full "
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-400 mb-2">
                    Required Sources
                  </label>
                  <Input
                    type="number"
                    value={requiredSources}
                    onChange={(e) =>
                      setRequiredSources(parseInt(e.target.value))
                    }
                    min="1"
                    max="100"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-400 mb-2">
                  Subject Area
                </label>
                <Input
                  value={subjectArea}
                  onChange={(e) => setSubjectArea(e.target.value)}
                  placeholder="e.g., Environmental Economics, Psychology, Computer Science"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-400 mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your research project..."
                  className="w-full"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!projectTitle || !thesisStatement}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Next: Select Bookmarks
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Bookmarks */}
        {step === 2 && (
          <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-purple-400" size={20} />
                <span className="text-zinc-200">Select Bookmarks</span>
                <span className="text-sm font-normal text-purple-400">
                  ({selectedBookmarks.length} selected)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                  size={20}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookmarks by title, summary, or tags..."
                  className="pl-10"
                />
              </div>

              {/* Bookmark Grid */}
              {bookmarksLoading ? (
                <div className="text-center py-8">
                  <div className="text-zinc-400">Loading bookmarks...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedBookmarks.includes(bookmark.id)
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-zinc-600 hover:border-purple-400 bg-zinc-800"
                      }`}
                      onClick={() => handleBookmarkToggle(bookmark.id)}
                    >
                      <div className="flex items-start gap-3 ">
                        <div
                          className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center mt-1 ${
                            selectedBookmarks.includes(bookmark.id)
                              ? "border-purple-500 bg-purple-500"
                              : "border-zinc-400"
                          }`}
                        >
                          {selectedBookmarks.includes(bookmark.id) && (
                            <CheckCircle className="text-white" size={12} />
                          )}
                        </div>
                        <div className=" min-w-0">
                          <h3 className="font-medium text-zinc-200 truncate">
                            {bookmark.title}
                          </h3>
                          {bookmark.summary && (
                            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                              {bookmark.summary}
                            </p>
                          )}
                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {bookmark.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {bookmark.tags.length > 3 && (
                                <span className="text-xs text-zinc-500">
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

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedBookmarks.length === 0}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Review & Create
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Create */}
        {step === 3 && (
          <Card className="bg-zinc-900 border-zinc-700 text-zinc-200 rounded-xl shadow-2xl hover:shadow-zinc-800/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-purple-400" size={20} />
                <span className="text-zinc-200">Review & Create</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Summary */}
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-semibold text-zinc-200 mb-2">
                  {projectTitle}
                </h3>
                <p className="text-zinc-300 mb-3">{thesisStatement}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-purple-400">Due Date:</span>
                    <br />
                    <span className="text-zinc-200">
                      {dueDate || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400">Required Sources:</span>
                    <br />
                    <span className="text-zinc-200">{requiredSources}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Selected Bookmarks:</span>
                    <br />
                    <span className="text-zinc-200">
                      {selectedBookmarks.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400">Subject Area:</span>
                    <br />
                    <span className="text-zinc-200">
                      {subjectArea || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateProject}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  🚀 Create Research Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
