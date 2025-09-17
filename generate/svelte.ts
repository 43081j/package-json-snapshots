import { getPackageJson } from "./generate.ts";
import {
  create,
  officialAddons,
  installAddon,
  type AddonMap,
  type OptionMap,
} from "sv";

type TemplateType = Parameters<typeof create>[1]["template"];
type LanguageType = Parameters<typeof create>[1]["types"];

type Config = {
  template?: TemplateType;
  types?: LanguageType;
  addons?: OptionMap<AddonMap>;
};

const addonMap = Object.fromEntries(
  officialAddons.map((addon) => [addon.id, addon]),
) as AddonMap;

const svelte = async (
  name: string,
  { template = "minimal", types = "typescript", addons = {} }: Config,
) => {
  await getPackageJson(
    name,
    `Generated with \`sv create --template ${template}\` and addons ${JSON.stringify(addons)}`,
    async (dir) => {
      create(dir, {
        name,
        template,
        types,
      });
      await installAddon({
        cwd: dir,
        addons: Object.fromEntries(
          Object.entries(addonMap).filter(([addon]) =>
            Object.keys(addons).includes(addon),
          ),
        ),
        options: addons,
      });
    },
  );
};

const configs: Record<string, Config> = {
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
