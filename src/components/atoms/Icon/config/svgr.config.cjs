const template = require("./svgr-template.cjs");

module.exports = {
  icon: true,
  typescript: true,
  template,
  prettierConfig: {
    parser: "typescript",
  },
  ignoreExisting: true,
};
