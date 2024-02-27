const template = require("./svgr-template.cjs");
const indexTemplate = require("./svgr-index.cjs");

module.exports = {
  icon: true,
  typescript: true,
  template,
  indexTemplate,
  prettierConfig: {
    parser: "typescript",
  },
  ignoreExisting: true,
};
