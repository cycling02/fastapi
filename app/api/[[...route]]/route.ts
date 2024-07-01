import { Redis } from "@upstash/redis";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { handle } from "hono/vercel";
export const runtime = "edge";

type Envconfig = {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};
const app = new Hono().basePath("/api");

app.get("/search",async (c) => {
  try{
    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } =
      env<Envconfig>(c);
    const start = performance.now();

    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });
    const query = c.req.query("q")?.toUpperCase();

    if (!query) {
      return c.json(
        {
          message: "Invalid search query",
        },
        {
          status: 400,
        }
      );
    }
    const res = [];
    const rank = await redis.zrank("terms", query);
    if (rank !== null && rank !== undefined) {
      const temp = await redis.zrange<string[]>("terms", rank, rank + 100);
      for (const el of temp) {
        if (!el.startsWith(query)) {
          break;
        }
        if (el.endsWith("*")) {
          res.push(el.substring(0, el.length - 1));
        }
      }
    }
    const end = performance.now();
    return c.json({
      results: res,
      duration: end - start,
    });
  }
  catch(e){
    console.error(e);
    return c.json({
      results: [],
     message:'something went wrong'
    },{status:500});
  }
});

export const GET = handle(app);
export default app as never;