import { getPackageJson } from "./generate.ts";
import {
  create,
  officialAddons,
  installAddon,
  type AddonMap,
  type OptionMap,
} from "sv";

const addonMap = Object.fromEntries(
  officialAddons.map((addon) => [addon.id, addon]),
) as AddonMap;

const svelte = async (
  name: string,
  {
    template = "minimal",
    addons = {},
  }: { template?: string; addons?: OptionMap<AddonMap> },
) => {
  await getPackageJson(
    name,
    `Generated with \`sv create --template ${template}\` and addons ${JSON.stringify(addons)}`,
    async (dir) => {
      create(dir, {
        name,
        template,
        types: "typescript",
      });
      await installAddon({
        cwd: dir,
        addons: Object.fromEntries(
          Object.keys(addons).map((addon) => [addon, addonMap[addon]]),
        ),
        options: addons,
      });
    },
  );
};

const configs = {
  "svelte-basic": {
    addons: {
      vitest: {
        usage: "unit",
      },
    },
  },
};

export default Object.entries(configs).map(
  ([name, config]) =>
    () =>
      svelte(name, config),
);
