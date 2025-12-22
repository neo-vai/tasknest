import { auth } from "@/auth";
import { addClient, removeClient } from "@/lib/sse-manager";

let clientCounter = 0;

const KEEP_ALIVE_INTERVAL = 15_000;

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const clientId = String(++clientCounter);

      const keepAliveTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
        }
      }, KEEP_ALIVE_INTERVAL);

      addClient(clientId, {
        id: clientId,
        write: (data: string) => controller.enqueue(encoder.encode(data)),
        close: () => controller.close(),
      });

      req.signal.addEventListener("abort", () => {
        clearInterval(keepAliveTimer);
        removeClient(clientId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}