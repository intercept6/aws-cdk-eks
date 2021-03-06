module.exports = {
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    plugins: ["@typescript-eslint"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module"
    },
    rules: {
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "no-unused-vars": "off",
        "no-undef": "off"
    }
};
