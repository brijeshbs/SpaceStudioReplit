import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertFloorplan } from "@shared/schema";

export function useFloorplan(id: number) {
  return useQuery({
    queryKey: [api.floorplans.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.floorplans.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch floorplan");
      return api.floorplans.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateFloorplan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...data }: InsertFloorplan & { projectId: number }) => {
      // Note: input schema excludes projectId from body because it's in URL
      // But we need projectId to build the URL
      const url = buildUrl(api.floorplans.create.path, { projectId });
      
      const res = await fetch(url, {
        method: api.floorplans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.floorplans.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create floorplan");
      }
      return api.floorplans.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate the project query to refresh the floorplan list if it were embedded
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, data.projectId] });
    },
  });
}

export function useDetectFeatures() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.floorplans.detect.path, { id });
      const res = await fetch(url, {
        method: api.floorplans.detect.method,
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to detect features");
      return api.floorplans.detect.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.floorplans.get.path, data.id] });
    },
  });
}
