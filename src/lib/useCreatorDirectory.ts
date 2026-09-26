import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCreatorDirectory } from "./creator-directory.functions";

export function useCreatorDirectory() {
  const fn = useServerFn(getCreatorDirectory);
  return useQuery({ queryKey: ["creator-directory"], queryFn: () => fn(), refetchInterval: 60_000 });
}
