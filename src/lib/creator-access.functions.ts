import { createServerFn } from "@tanstack/react-start";
import { requireCreatorIdentity } from './creator-auth';
import { z } from 'zod';

export const creatorAccessStatus = createServerFn({ method: "GET" }).middleware([requireCreatorIdentity]).handler(async ({ context }) => {
  const { readCreatorAccessStatus } = await import("./creator-access.server");
  return readCreatorAccessStatus(context.userId);
});

export const unlockCreator = createServerFn({ method: "POST" })
  .middleware([requireCreatorIdentity])
  .inputValidator(z.object({ code: z.string().min(1).max(256) }))
  .handler(async ({ data, context }) => {
    const { verifyCreatorCode } = await import("./creator-access.server");
    return verifyCreatorCode(data.code, context.userId);
  });

export const lockCreator = createServerFn({ method: "POST" }).handler(async () => {
  const { clearCreatorCookie } = await import("./creator-access.server");
  clearCreatorCookie();
  return { granted: false };
});
