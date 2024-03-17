const svgrComponentTemplate = (variables, { tpl }) => {
  const componentName = variables.componentName.replace(/Svg/, "");

  const result = tpl`
  import type { SVGProps } from "react";

  ${variables.interfaces}

  export function ${componentName}(${variables.props}) {
    return ${variables.jsx};
  }
  `;
  return result;
};

module.exports = svgrComponentTemplate;
