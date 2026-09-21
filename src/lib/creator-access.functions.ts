import { createServerFn } from "@tanstack/react-start";

export const creatorAccessStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { readCreatorAccessStatus } = await import("./creator-access.server");
  return readCreatorAccessStatus();
});

export const unlockCreator = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => ({ code: String(data?.code ?? "") }))
  .handler(async ({ data }) => {
    const { verifyCreatorCode } = await import("./creator-access.server");
    return verifyCreatorCode(data.code);
  });

export const lockCreator = createServerFn({ method: "POST" }).handler(async () => {
  const { clearCreatorCookie } = await import("./creator-access.server");
  clearCreatorCookie();
  return { granted: false };
});
