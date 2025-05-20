import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: ["**/*"], // 忽略所有文件
        rules: {
            // 禁用所有规则
            // 这将全局覆盖所有检查
        },
    },
    ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
