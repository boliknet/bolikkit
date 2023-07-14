import { buildOptions, esbuild, withUnoCSSPlugin } from "./mod.ts";
import { debounce, path, serveDir, server, sse } from "./deps.ts";
import { supportedPrimaryColors } from "./colors.ts";

const {
  ServerSentEvent,
  ServerSentEventStreamTarget,
} = sse;

/** Directory where this file is located */
const baseDir = path.dirname((new URL(import.meta.url)).pathname);

if (Deno.args.length != 1) {
  console.error(`Usage: deno run -A ${baseDir} [dir-to-bundle]`);
  Deno.exit(1);
}

/** Directory to bundle */
const dirArg = Deno.args[0];
let projectDir: string;
if (path.isAbsolute(dirArg)) {
  projectDir = dirArg;
} else {
  projectDir = path.join(Deno.cwd(), dirArg);
}

console.log("baseDir:", baseDir);
console.log("projectDir:", projectDir);

const manifestPath = path.join(projectDir, "deno.json");
const manifest = JSON.parse(await Deno.readTextFile(manifestPath));
if (!manifest.title) {
  throw new Error(`No title export in ${manifestPath}`);
}

const schemaPath = path.join(projectDir, "schema.ts");
const { nodeName } = await import(schemaPath);
if (!nodeName) {
  throw new Error(`No nodeName export in ${schemaPath}`);
}

const ctx = await esbuild.context(buildOptions({
  projectDir,
  outFile: path.join(projectDir, "dist", `${nodeName}.js`),
  plugins: [
    await withUnoCSSPlugin({
      projectDir,
      primaryColor: supportedPrimaryColors.blue,
    }),
  ],
}));

await ctx.rebuild();

const port = parseInt(Deno.env.get("PORT") || "5010", 10);

// Start a local development server
server.serve(handler, {
  hostname: "localhost",
  port,
});

// Watch project directory for changes
const watcher = Deno.watchFs(projectDir);
const fsListeners: FsListener[] = [];
const log = debounce(async (event: Deno.FsEvent) => {
  if (event.kind != "modify") {
    return;
  }

  const modifiedPaths: string[] = [];

  for (const p of event.paths) {
    const relativePath = path.relative(projectDir, p);

    // Ignore dist directory
    if (relativePath.startsWith("dist/")) {
      continue;
    }

    // Watch only JS and TS files
    const ext = path.extname(p);
    switch (ext) {
      case ".ts":
      case ".tsx":
      case ".js":
        modifiedPaths.push(p);
        break;
    }
  }

  if (modifiedPaths.length) {
    // Rebuild
    await ctx.rebuild();

    // Notify listeners
    for (const listener of fsListeners) {
      listener(modifiedPaths);
    }
  }
}, 200);

type FsListener = (modifiedPaths: string[]) => void;

for await (const event of watcher) {
  log(event);
}

watcher.close();

async function handler(req: Request): Promise<Response> {
  const pathname = (new URL(req.url)).pathname;

  // Local development server script
  if (pathname.startsWith("/_dev/page.ts")) {
    const filePath = path.join(baseDir, "dev", "page.ts");
    const body = await Deno.readTextFile(filePath);
    const res = await esbuild.transform(
      body,
      {
        loader: "ts",
        sourcemap: "inline",
        sourcefile: "page.ts",
      },
    );

    return new Response(res.code, {
      headers: resolveContentType(".js"),
    });
  }

  // File watcher updates
  if (pathname.startsWith("/_dev/updates")) {
    const target = new ServerSentEventStreamTarget();
    const listener: FsListener = (modifiedPaths) => {
      target.dispatchEvent(
        new ServerSentEvent("message", {
          data: { event: "modified", paths: modifiedPaths },
        }),
      );
    };

    // Subscribe
    fsListeners.push(listener);

    // Clean up subscription
    target.addEventListener("close", () => {
      const index = fsListeners.indexOf(listener);
      if (index >= 0) {
        fsListeners.splice(index, 1);
      }
    });

    return target.asResponse();
  }

  // Build files
  if (pathname.startsWith("/dist/")) {
    const res = await serveDir(req, {
      fsRoot: projectDir,
      showIndex: false,
      quiet: true,
    });

    // res.headers.set("Cache-Control", "no-cache");

    return res;
  }

  // API calls
  if (pathname.startsWith("/bolik/")) {
    return new Response("not implemented", {
      status: 500,
    });
  }

  // HTML
  if (req.url.endsWith("/")) {
    return new Response(indexHtml(), {
      headers: resolveContentType(".html"),
    });
  }

  return new Response("not found", {
    status: 404,
  });
}

function resolveContentType(p: string): Record<string, string> {
  const wrap = (ct: string) => ({
    "Content-Type": ct,
  });

  if (p.endsWith(".html")) {
    return wrap("text/html");
  }

  if (p.endsWith(".js")) {
    return wrap("text/javascript");
  }

  if (p.endsWith(".js.map")) {
    return wrap("application/json");
  }

  return wrap("text/plain");
}

function indexHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test ${nodeName}</title>
    <style>
     @media (prefers-color-scheme: dark) {
       body {
         background-color: #000;
         color: #f3f3f3;
       }
     }

     .content {
       max-width: 600px;
       margin: 16px auto;
       padding: 0 16px;
     }
    </style>
  </head>
  <body>
    <div class="content">
      <h1>Welcome!</h1>
      <p>This is a test page for "${nodeName}".</p>
      <${nodeName}></${nodeName}>
      <p>This site continues after the component.</p>
    </div>
    <script async src="/_dev/page.ts"></script>
    <script async src="/dist/${nodeName}.js"></script>
  </body>
</html>
`;
}
