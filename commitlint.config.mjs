/** @type {import('@commitlint/types').UserConfig} */
export default {
    extends: [],
    plugins: ["commitlint-plugin-gitmoji"],
    rules: {
        // enforce an emoji from gitmoji at the start
        "gitmoji-rule": [2, "always"],
        // (optional) require a conventional type after the emoji, e.g. "✨ feat: ...":
        // 'type-enum': [2, 'always', ['feat','fix','chore','docs','refactor','test','perf','build','ci','revert']]
    },
};
