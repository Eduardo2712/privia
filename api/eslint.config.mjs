// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["eslint.config.mjs", ".eslintrc.js"]
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            },
            sourceType: "module",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                project: "tsconfig.json",
                allowDefaultProject: true
            }
        },
        plugins: {
            import: await import("eslint-plugin-import")
        }
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "import/no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["src/*"],
                            message: 'Importações com "src/" são proibidas. Use importações relativas ou aliases (@shared, @modules).'
                        }
                    ]
                }
            ]
        }
    }
);

