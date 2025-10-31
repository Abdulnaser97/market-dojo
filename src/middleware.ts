import { createMiddleware } from "@solidjs/start/middleware";
import { getPlatformProxy } from "wrangler";

let platformProxy: Awaited<ReturnType<typeof getPlatformProxy>> | null = null;

async function getProxy() {
  if (!platformProxy) {
    platformProxy = await getPlatformProxy();
  }
  return platformProxy;
}

export default createMiddleware({
  onRequest: async (event) => {
    // Only add proxy in development
    if (import.meta.env.DEV) {
      const proxy = await getProxy();

      // @ts-ignore
      event.nativeEvent.context.cloudflare = {
        env: proxy.env,
        cf: proxy.cf,
        ctx: proxy.ctx,
      };
    }
  },
});
