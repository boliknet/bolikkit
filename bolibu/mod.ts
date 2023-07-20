import {
  BuildOptions,
  cache,
  esbuild,
  path,
  Plugin,
  unocss,
  UserConfig,
  walk,
} from "./deps.ts";
import { withHttpPlugin } from "./resolver.ts";
import { supportedPrimaryColors } from "./colors.ts";

export { esbuild };

const {
  createGenerator,
  presetIcons,
  presetUno,
} = unocss;

type ThemeMode = "light" | "dark" | "automatic" | "attribute-based";

export { type ThemeMode };

export async function withUnoCSSPlugin({
  projectDir,
  primaryColor,
  themeMode,
}: {
  /** Directory to bundle */
  projectDir: string;
  primaryColor?: string;
  themeMode: ThemeMode;
}): Promise<Plugin> {
  /** Directory where this file is located */
  const baseDir = path.dirname((new URL(import.meta.url)).pathname);

  // These are slightly modified Tailwind CSS preflight styles. (see reset file's top comment for details)
  const tailwindPreflight = await Deno.readTextFile(
    path.join(baseDir, "unocss-reset.css"),
  );

  if (!primaryColor) {
    primaryColor = supportedPrimaryColors.blue;
  }

  const unoConfig: UserConfig = {
    theme: {
      // Default colors: https://github.com/unocss/unocss/blob/main/packages/preset-mini/src/_theme/colors.ts
      colors: {
        primary: "rgba(var(--bk-color), %alpha)",
      },
    },
    presets: [
      presetUno({
        dark: (themeMode == "automatic")
          // Automicatic (media-query based)
          ? "media"
          : ({
            // By default we specify the mode using an attribute mode-dark or mode-light.
            // But during build time we allow to override the default mode.
            dark: themeMode == "dark" ? ":host" : ":host([mode-dark])",
            light: themeMode == "light" ? ":host" : ":host([mode-light])",
          }),
      }),
      presetIcons({
        scale: 1.2,
        cdn: "https://esm.sh/",
      }),
    ],
    preflights: [{
      getCSS: () => tailwindPreflight,
    }, {
      // Define default CSS variables
      getCSS: () =>
        `:host {
--bk-color: ${primaryColor};
}`,
    }],
  };
  const uno = createGenerator(unoConfig);

  return {
    name: "UnoCSS",
    setup(build) {
      build.onLoad(
        { filter: /uno\.css\.js$/, namespace: "file" },
        async () => {
          const classes = new Set<string>();

          // Scan all local files
          for await (
            const fileRef of walk(projectDir, {
              includeDirs: false,
              exts: [".ts", ".tsx", ".js", ".jsx"],
              skip: [/node_modules/, /\dist\//],
            })
          ) {
            // Process the file to find matched class names
            const content = await Deno.readTextFile(fileRef.path);
            const { matched } = await uno.generate(content, {
              id: fileRef.path,
            });

            for (const match of matched) {
              classes.add(match);
            }
          }

          // Process all found class names and minify CSS
          const c = await uno.generate(classes);
          const css = c.getLayers();
          const minified = await esbuild.transform(css, {
            loader: "css",
            minify: true,
          });

          return {
            contents: minified.code,
            loader: "text",
          };
        },
      );
    },
  };
}

export function withFileOverrides(overrides: Record<string, string>): Plugin {
  return {
    name: "FileOverride",
    setup(build) {
      for (const [fileName, code] of Object.entries(overrides)) {
        const name = fileName.replace(".", "\.");
        const filter = new RegExp(`${name}$`);

        // TODO: add on resolve with custom namespace
        // TODO: disallow remote imports and imports outside of project dir from this file

        build.onLoad(
          { filter, namespace: "file" },
          (args) => {
            console.log("Overriding", args.path, "with", code);
            return {
              contents: code,
            };
          },
        );
      }
    },
  };
}

export function buildOptions({
  projectDir,
  outFile,
  plugins,
  sourcemap,
}: {
  /** Directory to bundle */
  projectDir: string;
  outFile: string;
  plugins: Plugin[];
  sourcemap?: "linked" | "inline";
}): BuildOptions {
  const denoFile = Deno.readTextFileSync(path.join(projectDir, "deno.json"));
  const denoJson = JSON.parse(denoFile);
  const denoJsxImportSource = denoJson.compilerOptions?.jsxImportSource;
  const cacher = cache.createCache();

  let jsxImportSource: string | undefined = undefined;
  if (denoJsxImportSource) {
    jsxImportSource = denoJson.imports[denoJsxImportSource];

    if (!jsxImportSource) {
      throw new Error(
        "Failed to resolve jsxImportSource from import map:" +
          ` jsxImportSource=${denoJsxImportSource}` +
          `, importMap=${JSON.stringify(denoJson.imports)}`,
      );
    }
  }

  return {
    bundle: true,
    minify: true,
    entryPoints: [path.join(projectDir, "main.ts")],
    outfile: outFile,
    loader: {
      ".ts": "ts",
      ".css": "text",
      ".css.js": "text",
      ".svg": "text",
    },
    sourcemap: sourcemap ?? "linked",
    jsx: "automatic",
    jsxImportSource,
    plugins: [
      ...plugins,
      withHttpPlugin({
        cacher,
        importMap: denoJson.imports,
      }),
    ],
    target: "es2020",
  };
}
