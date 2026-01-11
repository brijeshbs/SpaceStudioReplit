import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertLayout } from "@shared/schema";

export function useLayouts(floorplanId: number) {
  return useQuery({
    queryKey: [api.layouts.list.path, floorplanId],
    queryFn: async () => {
      const url = buildUrl(api.layouts.list.path, { floorplanId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch layouts");
      return api.layouts.list.responses[200].parse(await res.json());
    },
    enabled: !!floorplanId,
  });
}

export function useLayout(id: number) {
  return useQuery({
    queryKey: [api.layouts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.layouts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch layout");
      return api.layouts.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useGenerateLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ floorplanId, name, preferences }: { floorplanId: number, name: string, preferences?: any }) => {
      const url = buildUrl(api.layouts.generate.path, { floorplanId });
      const res = await fetch(url, {
        method: api.layouts.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, preferences }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to generate layout");
      return api.layouts.generate.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.layouts.list.path, data.floorplanId] });
    },
  });
}

export function useUpdateLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertLayout>) => {
      const url = buildUrl(api.layouts.update.path, { id });
      const res = await fetch(url, {
        method: api.layouts.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update layout");
      return api.layouts.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.layouts.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.layouts.list.path, data.floorplanId] });
    },
  });
}
