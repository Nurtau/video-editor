const path = require("path");

function indexTemplate(paths) {
  return paths
    .map(({ path: filePath }) => {
      return path.basename(filePath, path.extname(filePath));
    })
    .map((basename) => {
      return `export * from './${basename}'`;
    })
    .join("\n");
}

module.exports = indexTemplate;
