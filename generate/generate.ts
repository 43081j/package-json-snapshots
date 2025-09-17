import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";

const ROOT = path.dirname(import.meta.dirname);

export const writeReadme = async (): Promise<void> => {
  const README = path.join(ROOT, "README.md");
  const header = "## Available Package Manifests";
  const contents = (await fs.readFile(README, "utf-8"))
    .split(header)[0]!
    .trim();

  const packages = await Array.fromAsync(
    fs.glob(path.join(ROOT, "*.package.json")),
  );

  const newContents = [
    contents,
    "",
    header,
    "",
    ...packages
      .map((pkg) => path.basename(pkg))
      .map(
        (pkg) =>
          `- [${pkg}](${pkg}) ([graph](https://npmgraph.js.org/?q=https%3A%2F%2Fgithub.com%2F43081j%2Fpackage-json-snapshots%2Fblob%2Fmain%2F${pkg}#deps=devDependencies))`,
      ),
    "",
  ].join("\n");

  await fs.writeFile(README, newContents);
};

export const getPackageJson = async (
  name: string,
  description: string,
  generator: (cwd: string) => Promise<void>,
): Promise<void> => {
  const result = await fs.mkdtempDisposable(os.tmpdir() + path.sep);
  const tmpdir = result.path;
  await generator(tmpdir);
  const pkgJson = JSON.parse(
    await fs.readFile(path.join(tmpdir, "package.json"), "utf-8"),
  );
  await fs.writeFile(
    path.join(ROOT, `${name}.package.json`),
    JSON.stringify(
      {
        name,
        description,
        private: true,
        dependencies: pkgJson.dependencies,
        devDependencies: pkgJson.devDependencies,
      },
      null,
      2,
    ),
  );
};
