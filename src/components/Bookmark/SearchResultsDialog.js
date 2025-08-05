import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function SearchResultsDialog({
  open,
  onOpenChange,
  searchResults,
  addingId,
  handleAddSuggested,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[60vw] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Semantic Search Results</DialogTitle>
          <DialogDescription>
            Here are the results for your query. You can add suggested links to
            your bookmarks.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-6 px-1">
          {searchResults && (
            <>
              {/* Our Links */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Bookmarks</h3>
                <div className="space-y-3">
                  {searchResults.ourLinks &&
                  searchResults.ourLinks.length > 0 ? (
                    searchResults.ourLinks.map((link) => (
                      <div
                        key={link.url}
                        className="bg-gray-50 rounded-lg p-4 border flex flex-col gap-1"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-semibold hover:underline text-base"
                        >
                          {link.title}
                        </a>
                        <div className="text-gray-700 text-sm">
                          {link.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">
                      No relevant bookmarks found.
                    </div>
                  )}
                </div>
              </div>
              {/* Suggested Links */}
              <div>
                <h3 className="text-lg font-semibold mt-6 mb-2">
                  AI Suggested Links
                </h3>
                <div className="space-y-3">
                  {searchResults.suggestedLinks &&
                  searchResults.suggestedLinks.length > 0 ? (
                    searchResults.suggestedLinks.map((link) => (
                      <div
                        key={link.url}
                        className="bg-blue-50 rounded-lg p-4 border flex flex-col gap-1 relative"
                      >
                        <div className="flex items-center gap-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-800 font-semibold hover:underline text-base"
                          >
                            {link.title}
                          </a>
                          <Button
                            size="icon"
                            variant="outline"
                            className="ml-auto border-blue-400 text-blue-600 hover:bg-blue-100"
                            onClick={() => handleAddSuggested(link)}
                            disabled={addingId === link.url}
                          >
                            {addingId === link.url ? (
                              <span className="animate-spin">+</span>
                            ) : (
                              <span className="text-2xl leading-none">+</span>
                            )}
                          </Button>
                        </div>
                        <div className="text-gray-700 text-sm mt-1">
                          {link.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No suggestions found.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
