import { Parser } from '.';

const noop = () => Promise.resolve('');

test('Can format help text', () => {
  const parser = new Parser();
  parser.setCommand('help', 'should format the help text', noop);

  expect(parser.formatCommands()).toBe(`should format the help text\n`);
});

test('Gives back the correct command', () => {
  const parser = new Parser();
  parser.setCommand('help', 'should format the help text', noop);
  parser.setCommand('whoami', 'tells me who i am', () =>
    Promise.resolve('this text')
  );

  expect(parser.parse('!help')).toBe(noop);
});

test('Handles multi words correctly', () => {
  const parser = new Parser();
  parser.setCommand('dnd', 'a thing', noop);

  expect(parser.parse('!dnd a wraith')).toBe(noop);
});

test('Only matches commands at the beginning of the text', () => {
  const parser = new Parser();
  parser.setCommand('dnd', 'a thing', noop);

  expect(parser.parse('!dnd a wraith')).toBe(noop);
  expect(parser.parse('send me !dnd stuff')).toBeUndefined();
});

test('Returns undefined when null or empty string is passed', () => {
  const parser = new Parser();
  parser.setCommand('dnd', 'a thing', noop);

  expect(parser.parse('')).toBeUndefined();
  expect(parser.parse(null)).toBeUndefined();
});
