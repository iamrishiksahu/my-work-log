import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkLogSchema, type InsertWorkLog, type WorkLog } from "@shared/schema";
import { useCreateWorkLog, useUpdateWorkLog, useUploadImage } from "@/hooks/use-work-logs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loader2, Upload, X, Save, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WorkLogFormProps {
  initialData?: WorkLog;
  onSuccess: () => void;
  onCancel: () => void;
}

export function WorkLogForm({ initialData, onSuccess, onCancel }: WorkLogFormProps) {
  const { toast } = useToast();
  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateWorkLog();
  const uploadMutation = useUploadImage();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsertWorkLog>({
    resolver: zodResolver(insertWorkLogSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      impact: initialData.impact || "",
      hoursSpent: initialData.hoursSpent,
      issues: initialData.issues || "",
      iterations: initialData.iterations,
      failures: initialData.failures || "",
      metrics: initialData.metrics || "",
      images: initialData.images || [],
    } : {
      title: "",
      description: "",
      impact: "",
      hoursSpent: 0,
      issues: "",
      iterations: 0,
      failures: "",
      metrics: "",
      images: [],
    },
  });

  const onSubmit = async (data: InsertWorkLog) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, ...data });
        toast({ title: "Updated", description: "Work log updated successfully." });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Created", description: "New work log entry added." });
      }
      onSuccess();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive" 
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const file = files[0];
      const result = await uploadMutation.mutateAsync(file);
      const currentImages = form.getValues("images") || [];
      form.setValue("images", [...currentImages, result.url]);
      toast({ title: "Success", description: "Image uploaded" });
    } catch (error) {
      toast({ title: "Upload Failed", description: "Could not upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Core Info</h3>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What are you working on?" {...field} className="bg-white/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hoursSpent"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Hours Spent</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="0" {...field} className="bg-white/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the work done..." 
                        className="resize-none min-h-[120px] bg-white/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
              <h3 className="text-sm font-bold text-accent mb-3 uppercase tracking-wider">Outcomes</h3>
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What value did this create?" 
                        className="resize-none min-h-[80px] bg-white/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metrics"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Key Metrics</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Latency reduced by 20ms" {...field} className="bg-white/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
              <h3 className="text-sm font-bold text-orange-600 mb-3 uppercase tracking-wider">Challenges</h3>
              <FormField
                control={form.control}
                name="issues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issues Faced</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What blockers or problems arose?" 
                        className="resize-none min-h-[80px] bg-white/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="iterations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iterations</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} className="bg-white/50" />
                      </FormControl>
                      <FormDescription>How many attempts/versions?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="failures"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Failures / Lessons</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What didn't work?" 
                        className="resize-none min-h-[80px] bg-white/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-muted p-4 rounded-xl border border-border">
              <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Attachments
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {form.watch("images")?.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary/20 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-primary mb-2" />
                      <p className="text-xs text-muted-foreground">Click to upload image</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm p-4 -mx-4 -mb-4 border-t border-border mt-auto rounded-b-xl z-10">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {initialData ? "Update Log" : "Save Log"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
