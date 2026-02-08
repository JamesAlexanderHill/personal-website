export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle contact form POST
    if (url.pathname === "/api/contact" && request.method === "POST") {
      try {
        const formData = (await request.json()) as ContactFormData;

        // TODO: Send email or save to database
        console.log("Contact form data:", formData);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Serve Astro static files
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

// Type definitions
interface Env {
  ASSETS: Fetcher;
  // Add other environment bindings here (KV, D1, etc.)
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
