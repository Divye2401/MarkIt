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
          <DialogTitle className="text-heading-lg text-foreground">
            Semantic Search Results
          </DialogTitle>
          <DialogDescription className="text-body-sm text-foreground-secondary">
            Here are the results for your query. You can add suggested links to
            your bookmarks.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-6 px-1">
          {searchResults && (
            <>
              {/* Our Links */}
              <div>
                <h3 className="text-heading-md text-foreground mb-2">
                  Your Bookmarks
                </h3>
                <div className="space-y-3">
                  {searchResults.ourLinks &&
                  searchResults.ourLinks.length > 0 ? (
                    searchResults.ourLinks.map((link) => (
                      <div
                        key={link.url}
                        className="bg-surface rounded-lg p-4 border border-border flex flex-col gap-1"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-heading-sm hover:underline transition"
                        >
                          {link.title}
                        </a>
                        <div className="text-body-sm text-foreground-secondary">
                          {link.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-body-sm text-foreground-muted">
                      No relevant bookmarks found.
                    </div>
                  )}
                </div>
              </div>
              {/* Suggested Links */}
              <div>
                <h3 className="text-heading-md text-foreground mt-6 mb-2">
                  AI Suggested Links
                </h3>
                <div className="space-y-3">
                  {searchResults.suggestedLinks &&
                  searchResults.suggestedLinks.length > 0 ? (
                    searchResults.suggestedLinks.map((link) => (
                      <div
                        key={link.url}
                        className="bg-ai-accent/5 rounded-lg p-4 border border-ai-accent/20 flex flex-col gap-1 relative"
                      >
                        <div className="flex items-center gap-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ai-accent text-heading-sm hover:underline transition"
                          >
                            {link.title}
                          </a>
                          <Button
                            size="icon"
                            variant="outline"
                            className="ml-auto border-ai-accent/40 text-ai-accent hover:bg-ai-accent/10 transition"
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
                        <div className="text-body-sm text-foreground-secondary mt-1">
                          {link.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-body-sm text-foreground-muted">
                      No suggestions found.
                    </div>
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
