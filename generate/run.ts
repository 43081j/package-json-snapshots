import { writeReadme } from "./generate.ts";

import svelte from "./svelte.ts";

await Promise.all(svelte.map((s) => s()));

await writeReadme();
