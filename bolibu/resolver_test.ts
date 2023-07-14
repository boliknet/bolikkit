import { asserts, type CacheInfo, type LoadResponse } from "./test_deps.ts";
import { cache, esbuild } from "./deps.ts";
import { withHttpPlugin } from "./resolver.ts";

const { assertStringIncludes } = asserts;

const mainModuleUrl = new URL("https://bolik.localhost/_src/main.ts");
const mainModuleUrlStr = mainModuleUrl.toString();

Deno.test("resolve local deps (no import map)", async () => {
  const cacher: cache.Loader = {
    load(specifier: string): Promise<LoadResponse | undefined> {
      switch (specifier) {
        case mainModuleUrlStr:
          return loadedModule(
            specifier,
            `
import { b } from './b.ts';
export const a: number = b + 1;`,
          );

        case "https://bolik.localhost/_src/b.ts":
          return loadedModule(specifier, `export const b: number = 2;`);
      }

      throw new Error("Specifier not mocked: " + specifier);
    },

    cacheInfo: function (_specifier: string): CacheInfo {
      throw new Error("Function not implemented.");
    },
  };

  const resolver = withHttpPlugin({
    cacher,
    importMap: {},
  });

  const res = await esbuild.build({
    bundle: true,
    write: false,
    target: "esnext",
    plugins: [resolver],
    entryPoints: [mainModuleUrl.toString()],
  });

  const text = res.outputFiles[0].text;
  assertStringIncludes(text, "var b = 2;");
  assertStringIncludes(text, "var a = b + 1;");

  esbuild.stop();
});

Deno.test("resolve local deps (using import map)", async () => {
  const cacher: cache.Loader = {
    load(specifier: string): Promise<LoadResponse | undefined> {
      switch (specifier) {
        case mainModuleUrlStr:
          return loadedModule(
            specifier,
            `
import exact from 'bkit_schemas';
import sub from 'bkit_schemas/sub.ts';
export const a: number = exact + sub;`,
          );

        case "https://bolik.localhost/schemas":
          return loadedModule(specifier, `export default 2`);

        case "https://bolik.localhost/schemas/sub.ts":
          return loadedModule(specifier, `export default 3`);
      }

      throw new Error("Specifier not mocked: " + specifier);
    },

    cacheInfo: function (_specifier: string): CacheInfo {
      throw new Error("Function not implemented.");
    },
  };

  const resolver = withHttpPlugin({
    cacher,
    importMap: {
      // Exact match
      "bkit_schemas": "../schemas",
      // Alias prefix
      "bkit_schemas/": "../schemas/",
    },
  });

  const res = await esbuild.build({
    bundle: true,
    write: false,
    target: "esnext",
    plugins: [resolver],
    entryPoints: [mainModuleUrl.toString()],
  });

  const text = res.outputFiles[0].text;
  assertStringIncludes(text, "var schemas_default = 2;");
  assertStringIncludes(text, "var sub_default = 3;");
  assertStringIncludes(text, "var a = schemas_default + sub_default;");

  esbuild.stop();
});

Deno.test("resolve remote deps (no import map)", async () => {
  const cacher: cache.Loader = {
    load(specifier: string): Promise<LoadResponse | undefined> {
      switch (specifier) {
        case mainModuleUrlStr:
          return loadedModule(
            specifier,
            `
import { b } from 'http://remote.localhost/index.js';
export const a: number = b + 1;`,
          );

        case "http://remote.localhost/index.js":
          return loadedModule(
            specifier,
            `
import c from './c.js';
export const b = 2 + c;`,
          );

        case "http://remote.localhost/c.js":
          return loadedModule(specifier, `export default 3;`);
      }

      throw new Error("Specifier not mocked: " + specifier);
    },

    cacheInfo: function (_specifier: string): CacheInfo {
      throw new Error("Function not implemented.");
    },
  };

  const resolver = withHttpPlugin({
    cacher,
    importMap: {},
  });

  const res = await esbuild.build({
    bundle: true,
    write: false,
    target: "esnext",
    plugins: [resolver],
    entryPoints: [mainModuleUrl.toString()],
  });

  const text = res.outputFiles[0].text;

  assertStringIncludes(text, "var c_default = 3;");
  assertStringIncludes(text, "var b = 2 + c_default;");
  assertStringIncludes(text, "var a = b + 1;");

  esbuild.stop();
});

Deno.test("resolve remote deps (using import map)", async () => {
  const cacher: cache.Loader = {
    load(specifier: string): Promise<LoadResponse | undefined> {
      switch (specifier) {
        case mainModuleUrlStr:
          return loadedModule(
            specifier,
            `
import preact from 'preact';
import hooks from 'preact/hooks';
export const a: string = preact + hooks;`,
          );

        case "https://preact.localhost":
          return loadedModule(
            specifier,
            `
export default 'preact';`,
          );

        case "https://preact.localhost/hooks":
          return loadedModule(
            specifier,
            `
import internal from './internal';
export default 'hooks' + internal;
`,
          );

        case "https://preact.localhost/internal":
          return loadedModule(specifier, `export default 'internal';`);
      }

      throw new Error("Specifier not mocked: " + specifier);
    },

    cacheInfo: function (_specifier: string): CacheInfo {
      throw new Error("Function not implemented.");
    },
  };

  const resolver = withHttpPlugin({
    cacher,
    importMap: {
      "preact": "https://preact.localhost",
      "preact/": "https://preact.localhost/",
    },
  });

  const res = await esbuild.build({
    bundle: true,
    write: false,
    target: "esnext",
    plugins: [resolver],
    entryPoints: [mainModuleUrl.toString()],
  });

  const text = res.outputFiles[0].text;

  assertStringIncludes(text, `var preact_default = "preact";`);
  assertStringIncludes(text, `var internal_default = "internal";`);
  assertStringIncludes(text, `var hooks_default = "hooks" + internal_default;`);
  assertStringIncludes(text, `var a = preact_default + hooks_default;`);

  esbuild.stop();
});

Deno.test("resolve jsx imports", async () => {
  const jsxModuleUrl = new URL("./main.tsx", mainModuleUrl);
  const cacher: cache.Loader = {
    load(specifier: string): Promise<LoadResponse | undefined> {
      switch (specifier) {
        case jsxModuleUrl.toString():
          return loadedModule(
            specifier,
            `
export default function () {
  return <h1>Hello</h1>;
}`,
          );

        case "https://preact.localhost/jsx-runtime":
          return loadedModule(specifier, `export function jsx() {};`);
      }

      throw new Error("Specifier not mocked: " + specifier);
    },

    cacheInfo: function (_specifier: string): CacheInfo {
      throw new Error("Function not implemented.");
    },
  };

  const resolver = withHttpPlugin({
    cacher,
    importMap: {},
  });

  const res = await esbuild.build({
    bundle: true,
    write: false,
    target: "esnext",
    plugins: [resolver],
    entryPoints: [jsxModuleUrl.toString()],
    jsx: "automatic",
    jsxImportSource: "https://preact.localhost",
  });

  const text = res.outputFiles[0].text;

  assertStringIncludes(text, `function jsx() {`);
  assertStringIncludes(text, `function main_default() {`);
  assertStringIncludes(
    text,
    `return /* @__PURE__ */ jsx("h1", { children: "Hello" });`,
  );

  esbuild.stop();
});

Deno.test("fail on invalid source map", async () => {
  const cacher: cache.Loader = {
    load(specifier: string): Promise<LoadResponse | undefined> {
      throw new Error("Specifier not mocked: " + specifier);
    },

    cacheInfo: function (_specifier: string): CacheInfo {
      throw new Error("Function not implemented.");
    },
  };

  const resolver = withHttpPlugin({
    cacher,
    importMap: {
      "alias/": "../parent",
    },
  });

  try {
    await esbuild.build({
      bundle: true,
      write: false,
      target: "esnext",
      plugins: [resolver],
      entryPoints: [mainModuleUrl.toString()],
    });

    throw new Error("Should have thrown earlier");
  } catch (e) {
    assertStringIncludes(
      e.message,
      `Package address targets must end with "/"`,
    );
  }

  esbuild.stop();
});

function loadedModule(
  specifier: string,
  content: string,
): Promise<LoadResponse> {
  return Promise.resolve({
    kind: "module",
    specifier,
    content,
  });
}
