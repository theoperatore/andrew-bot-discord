import { Parser } from 'src/parser';

export function createHelp(parser: Parser) {
  return async function help() {
    return `Available commands:\n\n${parser.formatCommands()}`;
  };
}
