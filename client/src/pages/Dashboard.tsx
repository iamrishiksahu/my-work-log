import { useWorkLogs } from "@/hooks/use-work-logs";
import { WorkLogCard } from "@/components/WorkLogCard";
import { WorkLogForm } from "@/components/WorkLogForm";
import { DashboardStats } from "@/components/DashboardStats";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Plus, Search, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: logs, isLoading, error } = useWorkLogs();
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filter logs based on search
  const filteredLogs = logs?.filter(log => 
    log.title.toLowerCase().includes(search.toLowerCase()) || 
    log.description.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-destructive">
        <Terminal className="h-12 w-12 mb-4" />
        <h1 className="text-xl font-bold">Failed to load logs</h1>
        <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-display">WorkLog</h1>
          </div>
          
          <Sheet open={isAdding} onOpenChange={setIsAdding}>
            <SheetTrigger asChild>
              <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Add Log
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-display">New Log Entry</SheetTitle>
                <SheetDescription>
                  Document your work, impact, and learnings. Detailed logs help future you.
                </SheetDescription>
              </SheetHeader>
              <WorkLogForm 
                onSuccess={() => setIsAdding(false)} 
                onCancel={() => setIsAdding(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        {logs && <DashboardStats logs={logs} />}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search logs by title or content..." 
              className="pl-10 bg-white dark:bg-black/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {filteredLogs?.length} entries found
          </div>
        </div>

        {/* Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredLogs && filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <WorkLogCard key={log.id} log={log} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
              <div className="bg-muted inline-flex p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No logs found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                {search ? "Try adjusting your search terms." : "Start documenting your work journey today."}
              </p>
              {!search && (
                <Button onClick={() => setIsAdding(true)} variant="outline">
                  Create First Log
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Icon helper for empty state
function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}
