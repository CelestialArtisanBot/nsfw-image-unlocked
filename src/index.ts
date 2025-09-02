export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve HTML front-end
    if (request.headers.get("accept")?.includes("text/html")) {
      return new Response(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>AI Image Generator</title>
          <style>
            body { display:flex; flex-direction:column; align-items:center; font-family:sans-serif; margin-top:50px; }
            img { max-width:90vw; max-height:70vh; margin:20px 0; }
            textarea { width: 60vw; height: 100px; }
            button { padding:10px 20px; font-size:16px; cursor:pointer; margin-top:10px; }
          </style>
        </head>
        <body>
          <textarea id="prompt" placeholder="Type your prompt here...">A high-resolution, full 3D rendering of a legendary character...</textarea>
          <button id="generate-btn">Generate</button>
          <img id="ai-img" src="" alt="Generated Image"/>
          <script>
            const btn = document.getElementById('generate-btn');
            const img = document.getElementById('ai-img');
            const promptInput = document.getElementById('prompt');

            btn.onclick = async () => {
              const prompt = promptInput.value;
              const response = await fetch('/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
              });
              const blob = await response.blob();
              img.src = URL.createObjectURL(blob);
            };
          </script>
        </body>
        </html>
        `,
        { headers: { "content-type": "text/html" } }
      );
    }

    // Endpoint to generate image
    if (url.pathname === "/image" && request.method === "POST") {
      const { prompt } = await request.json();
      const inputs = { prompt };

      const response = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs
      );

      return new Response(response, {
        headers: {
          "content-type": "image/png",
          "x-lore-status": "rendered",
          "x-glyph": "🧿",
          "x-origin": "core-render-shard",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
