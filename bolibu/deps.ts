/**
 * All remote imports.
 */

export type {
  BuildOptions,
  Loader,
  Plugin,
} from "https://deno.land/x/esbuild@v0.17.18/mod.d.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.17.18/mod.js";

import {
  createGenerator,
  type UserConfig,
} from "https://esm.sh/v122/@unocss/core@0.51.8";
import presetUno from "https://esm.sh/v122/@unocss/preset-uno@0.51.8";
import presetIcons from "https://esm.sh/v122/@unocss/preset-icons@0.51.8/browser.mjs";

import * as cache from "https://deno.land/x/deno_cache@0.4.1/mod.ts";

import * as path from "https://deno.land/std@0.186.0/path/mod.ts";
import * as server from "https://deno.land/std@0.186.0/http/server.ts";
export { serveDir } from "https://deno.land/std@0.186.0/http/file_server.ts";
import * as sse from "https://deno.land/std@0.186.0/http/server_sent_event.ts";
export { walk } from "https://deno.land/std@0.186.0/fs/walk.ts";
export { debounce } from "https://deno.land/std@0.186.0/async/debounce.ts";

const unocss = {
  createGenerator,
  presetUno,
  presetIcons,
};

export { cache, esbuild, path, server, sse, unocss, UserConfig };
