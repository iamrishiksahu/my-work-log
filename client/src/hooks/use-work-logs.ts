import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateWorkLogRequest, type UpdateWorkLogRequest } from "@shared/routes";
import { InsertComponent } from "@shared/schema";

// GET /api/logs
export function useWorkLogs() {
  return useQuery({
    queryKey: [api.workLogs.list.path],
    queryFn: async () => {
      const res = await fetch(api.workLogs.list.path);
      if (!res.ok) throw new Error("Failed to fetch work logs");
      return api.workLogs.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/logs/:id
export function useWorkLog(id: string) {
  return useQuery({
    queryKey: [api.workLogs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.workLogs.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch work log");
      return api.workLogs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/logs
export function useCreateWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkLogRequest) => {
      const res = await fetch(api.workLogs.create.path, {
        method: api.workLogs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.workLogs.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create work log");
      }
      return api.workLogs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workLogs.list.path] });
    },
  });
}

// PUT /api/logs/:id
export function useUpdateWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateWorkLogRequest) => {
      const url = buildUrl(api.workLogs.update.path, { id });
      const res = await fetch(url, {
        method: api.workLogs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.workLogs.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to update work log");
      }
      return api.workLogs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workLogs.list.path] });
    },
  });
}

export function useComponents() {
  return useQuery({
    queryKey: [api.components.list.path],
    queryFn: async () => {
      const res = await fetch(api.components.list.path);
      if (!res.ok) throw new Error("Failed to fetch components");
      return api.components.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertComponent) => {
      const res = await fetch(api.components.create.path, {
        method: api.components.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.components.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create component");
      }
      return api.components.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.components.list.path] });
    },
  });
}

// DELETE /api/logs/:id
export function useDeleteWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.workLogs.delete.path, { id });
      const res = await fetch(url, { method: api.workLogs.delete.method });
      
      if (!res.ok && res.status !== 404) {
        throw new Error("Failed to delete work log");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workLogs.list.path] });
    },
  });
}

// POST /api/upload
export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(api.upload.create.path, {
        method: api.upload.create.method,
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }
      return api.upload.create.responses[200].parse(await res.json());
    },
  });
}
