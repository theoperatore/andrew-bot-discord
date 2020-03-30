import Discord from 'discord.js';

export type Command = (
  rawText: string | null
) => Promise<Discord.MessageEmbed | string>;

export class Parser {
  private delimiter: string;
  private commands: Map<string, Command>;
  private descriptions: Map<string, string>;

  constructor(delimiter: string = '!') {
    this.commands = new Map();
    this.descriptions = new Map();
    this.delimiter = delimiter;
  }

  setCommand(
    commandText: string,
    description: string,
    handler: Command
  ): boolean {
    if (this.commands.has(commandText)) return false;

    this.commands.set(commandText, handler);
    this.descriptions.set(commandText, description);
    return true;
  }

  parse(rawText: string | null): Command | undefined {
    if (!rawText) return;

    for (let entry of this.commands.entries()) {
      const regex = new RegExp(`^${this.delimiter}${entry[0]}`);
      if (rawText.match(regex)) {
        return entry[1];
      }
    }

    return;
  }

  formatCommands(): string {
    let out = '';
    for (let entry of this.descriptions.entries()) {
      out += `${entry[1]}\n`;
    }

    return out;
  }
}
