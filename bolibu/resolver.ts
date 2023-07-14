import { cache, Loader, path, Plugin } from "./deps.ts";

/** Plugin to resolve remote modules */
export function withHttpPlugin({
  cacher,
  importMap,
}: {
  cacher: cache.Loader;
  importMap: Record<string, string>;
}): Plugin {
  return {
    name: "http",
    setup(build) {
      for (const [alias, url] of Object.entries(importMap)) {
        // Intercept aliases from the import map.

        if (alias.endsWith("/")) {
          if (!url.endsWith("/")) {
            throw new Error(
              `Invalid target address "${url}" for package specifier "${alias}".` +
                ` Package address targets must end with "/"`,
            );
          }

          // E.g { "preact/": "https://esm.sh/preact@10.13.2/" }
          // import for "preact/hooks" should resolve to "https://esm.sh/preact@10.13.2/hooks"

          // Filter matching starting with
          const filter = new RegExp(`^${alias}`);

          if (url.startsWith("https://")) {
            build.onResolve({ filter }, (args) => {
              // Find trailing path (e.g "hooks" from "preact/")
              const subpath = args.path.substring(alias.length);
              return {
                path: url + subpath,
                namespace: "http-url",
              };
            });
          } else {
            // Resolve local file (relative import)
            build.onResolve({ filter }, (args) => {
              // Find trailing path (e.g "hooks" from "preact/")
              const subpath = args.path.substring(alias.length);

              if (args.importer.startsWith("https://")) {
                // Importing from a URL
                const found = new URL(url + subpath, args.importer).toString();
                return {
                  path: found,
                  namespace: "http-url",
                };
              } else {
                // Importing from a local file
                const found = path.join(
                  path.dirname(args.importer),
                  url + subpath,
                );
                return { path: found };
              }
            });
          }
        } else {
          // Exact match
          const filter = new RegExp(`^${alias}$`);

          if (url.startsWith("https://")) {
            build.onResolve({ filter }, (_args) => ({
              path: url,
              namespace: "http-url",
            }));
          } else {
            // Resolve local file
            build.onResolve({ filter }, (args) => {
              if (args.importer.startsWith("https://")) {
                // Importing from a URL
                const found = new URL(url, args.importer).toString();
                return {
                  path: found,
                  namespace: "http-url",
                };
              } else {
                // Importing from a local file
                const found = path.join(path.dirname(args.importer), url);
                return { path: found };
              }
            });
          }
        }
      }

      // Intercept import paths starting with "https:" so
      // esbuild doesn't attempt to map them to a file system location.
      build.onResolve({ filter: /^https:\/\// }, (args) => ({
        path: args.path,
        namespace: "http-url",
      }));

      // We also want to intercept all import paths inside downloaded
      // files and resolve them against the original URL. All of these
      // files will be in the "http-url" namespace. Make sure to keep
      // the newly resolved URL in the "http-url" namespace so imports
      // inside it will also be resolved as URLs recursively.
      build.onResolve({ filter: /.*/, namespace: "http-url" }, (args) => ({
        path: new URL(args.path, args.importer).toString(),
        namespace: "http-url",
      }));

      // When a URL is loaded, we want to actually download the content
      // from the internet.
      build.onLoad({ filter: /.*/, namespace: "http-url" }, async (args) => {
        const res = await cacher.load(args.path);
        if (res?.kind == "module") {
          const ext = path.extname(new URL(args.path).pathname);
          return {
            contents: res.content,
            loader: guessLoader(ext),
          };
        }

        throw new Error("Unsupported cache response: " + res);
      });
    },
  };
}

function guessLoader(ext: string): Loader | undefined {
  switch (ext) {
    case ".ts":
      return "ts";
    case ".tsx":
      return "tsx";
  }
}
