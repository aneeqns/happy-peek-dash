import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCreatorDirectory } from "./creator-directory.functions";
import { useAuth } from './auth';

export function useCreatorDirectory() {
  const { user, mode, effectiveRole } = useAuth();
  const fn = useServerFn(getCreatorDirectory);
  return useQuery({ queryKey: ["creator-directory", user?.id], queryFn: () => fn(), enabled: mode === 'real' && effectiveRole === 'creator' && Boolean(user?.id), refetchInterval: 60_000 });
}
