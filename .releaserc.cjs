const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(
  path.resolve(__dirname, "scripts/changelog-template.hbs"),
  "utf8",
);
const commitTemplate = fs.readFileSync(
  path.resolve(__dirname, "scripts/changelog-commit.hbs"),
  "utf8",
);

module.exports = {
  branches: ["master"],
  tagFormat: "v${version}",
  plugins: [
    ["semantic-release-gitmoji", {
      // map emojis to semver
      releaseRules: {
        major: [":boom:", "💥"],
        minor: [":sparkles:", "✨"],
        patch: [":bug:", "🐛", ":ambulance:", "🚑️", ":lock:", "🔒️"],
      },
      // custom notes that mimic gitmoji-changelog style
      releaseNotes: {
        template,
        partials: { commit: commitTemplate },
        helpers: {
          // {{merge commits 'sparkles' 'bug'}} -> single merged array
          merge(commits, ...args) {
            const keys = args.slice(0, -1);
            return keys.flatMap((k) => commits[k] || []);
          },
          // {{#if (any commits 'sparkles' 'bug')}} ...
          any(commits, ...args) {
            const keys = args.slice(0, -1);
            return keys.some((k) => (commits[k] || []).length > 0);
          },
          // {{short hash}}
          short(hash) {
            return String(hash || "").slice(0, 7);
          },
        },
      },
    }],
    // writes the generated notes into CHANGELOG.md
    ["@semantic-release/changelog", {
      changelogFile: "CHANGELOG.md",
      changelogTitle: "# Changelog\n\n",
    }],
    ["@semantic-release/npm", { npmPublish: false }],
    ["@semantic-release/git", {
      assets: ["CHANGELOG.md", "package.json"],
      message:
        "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
    }],
    ["@semantic-release/github", { assets: [] }],
  ],
};
