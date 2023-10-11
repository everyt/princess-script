
export as namespace princessScript;

export type AST = {
  type: string,
  key: string,
  value: string,
  line: number,
};

export function loadScript(filename: string, filecontent?: string): AST[];