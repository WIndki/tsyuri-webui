import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import next from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * Flat ESLint config.
 *
 * `eslint-config-next@16` ships **native flat configs** as arrays, so this file composes them
 * directly rather than shimming a legacy config through `FlatCompat` — which makes ESLint 9's
 * validator choke on the plugin objects' circular references.
 *
 * `core-web-vitals` and `typescript` are spread in addition to the base preset because they are
 * what register the `@typescript-eslint` and accessibility plugins that the project rules below
 * reference. The base preset alone does not.
 *
 * Block order matters: flat config applies every matching block in sequence and the last one wins,
 * so the relaxation for `scripts/` is declared at the end.
 */

const projectRoot = dirname(fileURLToPath(import.meta.url));

const eslintConfig = [
    // Build output, dependencies and working directories are never linted.
    {
        ignores: [
            ".next/**",
            "out/**",
            "node_modules/**",
            ".worktrees/**",
            ".scratch/**",
            ".screenshots/**",
            "next-env.d.ts",
        ],
    },

    ...next,
    ...coreWebVitals,
    ...typescript,

    {
        name: "tsyuri/project-rules",
        files: ["**/*.{ts,tsx,mjs}"],
        languageOptions: {
            parserOptions: {
                // Type-aware rules are not enabled, but the project root is still needed for
                // `eslint.config.mjs` to resolve consistently under the flat config cache.
                tsconfigRootDir: projectRoot,
            },
        },
        rules: {
            // Logging must be deliberate. v1 accumulated 50+ stray `console.log` calls, one at the
            // top of nearly every component, which is why its render behaviour was opaque.
            "no-console": ["warn", { allow: ["warn", "error"] }],

            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],

            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],

            // Guards against the antd v5 -> v6 API removals this migration is exposed to.
            "no-restricted-syntax": [
                "error",
                {
                    selector: "JSXAttribute[name.name='overlay']",
                    message:
                        "antd v6 replaced the `overlay` prop with `menu` on Dropdown/Tooltip-style components.",
                },
                {
                    selector: "JSXAttribute[name.name='dropdownRender']",
                    message: "antd v6 renamed `dropdownRender` to `popupRender`.",
                },
                {
                    selector: "MemberExpression[object.name='Collapse'][property.name='Panel']",
                    message:
                        "antd v6 removed Collapse.Panel. Pass `items={[{ key, label, children }]}` instead.",
                },
                {
                    selector: "MemberExpression[object.name='Collapse'][property.name='PanelGroup']",
                    message:
                        "antd v6 removed Collapse.PanelGroup. Collapse accepts `items` directly.",
                },
            ],
        },
    },

    {
        // The browser-driven checks report their results to a terminal; printing is the point.
        name: "tsyuri/scripts",
        files: ["scripts/**/*.mjs", "scripts/*.mjs"],
        rules: {
            "no-console": "off",
        },
    },
];

export default eslintConfig;
