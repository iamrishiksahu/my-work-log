import { WorkLog } from "@shared/schema";
import { format } from "date-fns";
import { Clock, AlertTriangle, RefreshCw, BarChart2, Edit2, Trash2, Calendar, Target, Layers, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useDeleteWorkLog } from "@/hooks/use-work-logs";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { WorkLogForm } from "./WorkLogForm";

interface WorkLogCardProps {
  log: WorkLog;
}

export function WorkLogCard({ log }: WorkLogCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteMutation = useDeleteWorkLog();
  const { toast } = useToast();

  const impactLevel = log.impactLevel || "medium";
  const impactLabel = {
    low: "Low Impact",
    medium: "Medium Impact",
    high: "High Impact",
    very_high: "Very High Impact",
  }[impactLevel] || "Medium Impact";

  const impactBadgeClass = {
    low: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    medium: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    high: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    very_high: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
  }[impactLevel] || "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(log.id);
      toast({ title: "Deleted", description: "Work log removed successfully." });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Could not delete log", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="group relative bg-card border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(log.date), "EEE, MMM d, yyyy")}
            <span className="text-border">|</span>
            <Clock className="w-3 h-3" />
            {log.hoursSpent}h
            {log.component && (
              <>
                <span className="text-border">|</span>
                <Layers className="w-3 h-3" />
                {log.component}
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {log.title}
          </h3>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sheet open={isEditing} onOpenChange={setIsEditing}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Edit2 className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
              <SheetHeader className="mb-6">
                <SheetTitle>Edit Work Log</SheetTitle>
              </SheetHeader>
              <WorkLogForm 
                initialData={log} 
                onSuccess={() => setIsEditing(false)} 
                onCancel={() => setIsEditing(false)} 
              />
            </SheetContent>
          </Sheet>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this log?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your work log entry.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {log.description}
      </p>

      {/* Attachments preview if any */}
      {log.images && log.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {log.images.map((url, i) => (
            <img 
              key={i} 
              src={url} 
              alt="Work attachment" 
              className="h-16 w-16 object-cover rounded-md border border-border hover:scale-105 transition-transform cursor-pointer" 
              onClick={() => window.open(url, '_blank')}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
        {log.iterations > 0 && (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
            <RefreshCw className="w-3 h-3 mr-1" />
            {log.iterations} Iterations
          </Badge>
        )}
        
        {log.issues && (
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Issues Found
          </Badge>
        )}
        
        {log.metrics && (
          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
            <BarChart2 className="w-3 h-3 mr-1" />
            Metrics
          </Badge>
        )}

      {log.impact && (
        <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
          <Target className="w-3 h-3 mr-1" />
          Impact noted
        </Badge>
      )}

      {log.component && (
        <Badge variant="secondary" className="bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200">
          <Layers className="w-3 h-3 mr-1" />
          {log.component}
        </Badge>
      )}

      <Badge variant="secondary" className={impactBadgeClass}>
        <Flame className="w-3 h-3 mr-1" />
        {impactLabel}
      </Badge>
      </div>
    </div>
  );
}
