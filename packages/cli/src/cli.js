#!/usr/bin/env node

import * as fs from "node:fs";
import * as consumers from "node:stream/consumers";
import { parseArgs } from "node:util";

import { configSchema } from "cc.jqgl.app/config";
import deepmerge from "deepmerge";
import z from "zod";

/** @returns {string} */
function displayHelp() {
  const help = `
DESCRIPTION
\t serve\t start the server with the provided config
\t\t --config\t config is the json configuration file

\t dumpconfig
\t\t Dumps the config to stdout
`;
  return help;
}

function dumpConfigCommand() {
  const jsonSchema = z.toJSONSchema(configSchema);
  process.stdout.write(JSON.stringify(jsonSchema, null, 2) + "\n");
  process.exit(0);
}

/**
 * @param {{ config?: string[] }} options
 */
async function startCommand(options = {}) {
  if (!options.config) throw new Error(`no config file provided`);

  const configs = await Promise.all(
    (options.config ?? []).map(async (file) => {
      const input$ = fs.createReadStream(file, "utf-8");
      return consumers.json(input$);
    }),
  );
  const config = deepmerge.all(configs);

  process.env.TZ = "Etc/UTC";

  const { register } = await import("node:module");
  register(`@opentelemetry/instrumentation/hook.mjs`, import.meta.resolve("."));

  await import("cc.jqgl.app").then(async ({ AppModule }) => AppModule.listen(config));
}

async function main() {
  const args = parseArgs({
    args: process.argv,
    allowNegative: false,
    allowPositionals: true,
    options: {
      help: { short: "h", type: "boolean", default: false, multiple: false },
      config: { type: "string", multiple: true },
    },
  });

  if (args.values.help) {
    process.stdout.write(displayHelp());
    process.exit(0);
  }

  if (args.positionals.includes("dumpconfig")) {
    dumpConfigCommand();
  } else if (args.positionals.includes("serve")) {
    await startCommand(args.values);
  } else {
    process.stdout.write(displayHelp());
    process.exit(1);
  }
}

main();
