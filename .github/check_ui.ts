/** Script to validate UI components */

import { walk } from "https://deno.land/std@0.186.0/fs/walk.ts";
import * as path from "https://deno.land/std@0.186.0/path/mod.ts";

const baseDir = Deno.cwd();

for await (
  const fileRef of walk(path.join(baseDir, "ui"), {
    maxDepth: 3,
    includeDirs: false,
    match: [/schema\.ts$/],
  })
) {
  const dirName = path.dirname(fileRef.path);

  await runDenoCmd({
    msg: "Check fmt",
    args: ["lint", "--ignore=dist"],
    cwd: dirName,
  });

  await runDenoCmd({
    msg: "Lint",
    args: ["lint", "--ignore=dist"],
    cwd: dirName,
  });

  await runDenoCmd({
    msg: "Typecheck",
    args: ["check", "main.ts"],
    cwd: dirName,
  });
}

async function runDenoCmd({
  msg,
  args,
  cwd,
}: {
  msg: string;
  args: string[];
  cwd: string;
}) {
  const cmd = new Deno.Command(Deno.execPath(), {
    args,
    cwd,
  });

  console.log(path.relative(baseDir, cwd), msg);
  const { code, stdout, stderr } = await cmd.output();

  const outText = new TextDecoder().decode(stdout);
  if (outText) {
    console.log(outText);
  }

  if (code != 0) {
    console.error(new TextDecoder().decode(stderr));
    Deno.exit(code);
  }
}
