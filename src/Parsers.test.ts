import { AutoCompleteResult, AutoCompleteResultType, AutoCompleteTextParam, CommandAutoCompleter, CommandParser, ICommand, IKeyword, NumberParameter, ParsingFailureReason, ParsingResult, SingleWordTextParameter, TextParameter } from ".";
import { AutoCompleteKeywords, AutoCompleteNumber, AutoCompleteSingleWordTextParam } from "./Parsers";

class MockCommand implements ICommand {
  name: string;

  parse(): ParsingResult {
    throw new Error("Method not implemented.");
  }
  autocomplete(): AutoCompleteResult {
    throw new Error("Method not implemented.");
  }
  printManPage(): void {
    throw new Error("Method not implemented.");
  }
  available(): boolean {
    return this.availableResult;
  }
  constructor(commandName: string, private availableResult: boolean) {
    this.name = commandName;
  }
}

class MockKeyword implements IKeyword {
  name(): string {
    return this.keywordName;
  }
  printManPage(): void {
    throw new Error("Method not implemented.");
  }
  constructor(private keywordName: string) {
  }
}

const testCommand = new MockCommand('test', true);

describe('CommandParser', function() {
  it('parses valid command', function() {
    const result = CommandParser(testCommand).parse('test');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
  });
  it('handles whitespace prefix of command', function() {
    const result = CommandParser(testCommand).parse(' test');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
  });
  it('handles commands with options', function() {
    const result = CommandParser(testCommand, undefined, [{short: 'a'}, {short: 'b'}, {short: 'c'}, {long: 'force'},  {long: 'bar-word'}]).parse('test -ab --force -c --bar-word');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
    expect(result.options).toHaveLength(5);
    expect(result.options[0]).toBe('a');
    expect(result.options[1]).toBe('b');
    expect(result.options[2]).toBe('force');
    expect(result.options[3]).toBe('c');
    expect(result.options[4]).toBe('bar-word');
  });
  it('fails on empty strings', function() {
    const result = CommandParser(testCommand).parse('');
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe(ParsingFailureReason.WrongCommand);
  });
  it('fails on different command', function() {
    const result = CommandParser(testCommand).parse('bar');
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe(ParsingFailureReason.WrongCommand);
  });
  it('fails on an unrecognized option', function() {
    const result = CommandParser(testCommand, undefined, [{short: 'b'}]).parse('test -a');
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe(ParsingFailureReason.UnrecognizedOption);
  });
  it('handles not used option', function(){
    const result = CommandParser(testCommand, undefined, [{short: 'a'}]).parse('test');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
    expect(result.options).toHaveLength(0);
  });
});

describe('CommandParser with single text param', function() {
  it('parses valid command', function() {
    const result = CommandParser(testCommand, TextParameter()).parse('test foo');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
    expect(result.params).toHaveLength(1);
    expect(result.params[0]).toBe('foo');
  });
  it('handles spaces', function() {
    const result = CommandParser(testCommand, TextParameter()).parse('test  foo bar');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
    expect(result.params).toHaveLength(1);
    expect(result.params[0]).toBe('foo bar');
  });
  it('handles options', function() {
    const result = CommandParser(testCommand, TextParameter(), [{short: 'a'}]).parse('test -a bar');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
    expect(result.params).toHaveLength(1);
    expect(result.params[0]).toBe('bar');
    expect(result.options).toHaveLength(1);
    expect(result.options[0]).toBe('a');
  });
  it('fails missing param', function(){
    const result = CommandParser(testCommand, TextParameter()).parse('test');
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe(ParsingFailureReason.MissingParam);
  });
  it('fails with only option', function(){
    const result = CommandParser(testCommand, TextParameter(), [{short: 'a'}]).parse('test -a');
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe(ParsingFailureReason.MissingParam);
  });
  it('fails number', function(){
    const result = CommandParser(testCommand, TextParameter()).parse('test 10');
    expect(result.success).toBe(false);
    expect(result.failureReason).toBe(ParsingFailureReason.MissingParam);
  });
});

describe('CommandParser with two params', function() {
  it('parses valid command', function() {
    const result = CommandParser(testCommand, NumberParameter().then(TextParameter())).parse('test 0.0 foo');
    expect(result.success).toBe(true);
    expect(result.command).toBe(testCommand.name);
    expect(result.params).toHaveLength(2);
    expect(result.params[0]).toBe('0');
    expect(result.params[1]).toBe('foo');
  });
  it('fails a wrong order', function() {
    const result = CommandParser(testCommand, NumberParameter().then(TextParameter())).parse('test foo 0.0');
    expect(result.success).toBe(false);
    expect(result.command).toBe(testCommand.name);
  });
});

const manCommand = new MockCommand('man', true);

describe('CommandParser man use-case', function() {
  it('parses man man', function() {
    const result = CommandParser(manCommand, SingleWordTextParameter()).parse('man man');
    expect(result.success).toBe(true);
    expect(result.command).toBe(manCommand.name);
    expect(result.params).toHaveLength(1);
    expect(result.params[0]).toBe('man');
  });
  it('parses man list', function() {
    const result = CommandParser(manCommand, SingleWordTextParameter()).parse('man list');
    expect(result.success).toBe(true);
    expect(result.command).toBe(manCommand.name);
    expect(result.params).toHaveLength(1);
    expect(result.params[0]).toBe('list');
  });
  it('fails no command provided', function() {
    const result = CommandParser(manCommand, SingleWordTextParameter()).parse('man');
    expect(result.success).toBe(false);
    expect(result.command).toBe(manCommand.name);
  });
});

const listCommand = new MockCommand('list', true);

describe('CommandParser list use-case', function() {
  it('parses list', function() {
    const result = CommandParser(listCommand).parse('list');
    expect(result.success).toBe(true);
    expect(result.command).toBe(listCommand.name);
  });
});

describe('CommandAutoCompleter', function() {
  it('returns already matching on valid command', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete('test');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test');
  });
  it('auto-completes valid command', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete('te');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test');
  });
  it('handles whitespace before command', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete(' te');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test');
  });
  it('fails on empty string', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete('');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
  });
  it('fails on different command', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete('bar');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
  });
  it('handles short option', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete('test -a');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test -a');
  });
  it('handles long option', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete('test --foo');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test --foo');
  });
  it('must reach the end to consider flags ', function() {
    const result = CommandAutoCompleter(testCommand).autocomplete('te -a');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
    expect(result.fixedValue).toBe('');
  });
});

describe('CommandAutoCompleter with single param', function() {
  it('auto-completes one text parameter', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteTextParam(['bar'])).autocomplete('test b');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test bar');
  });
  it('returns already matching on valid command with one text param', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteTextParam(['bar'])).autocomplete('test bar');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test bar');
  });
  it('auto-completes one text parameter from distinct choices', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteTextParam(['bar', 'foo'])).autocomplete('test b');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test bar');
  });
  it('handles multiple matches with common start', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteTextParam(['fooBar', 'fooFoo'])).autocomplete('test fo');
    expect(result.type).toBe(AutoCompleteResultType.MultipleMatchesFound);
    expect(result.fixedValue).toBe('test foo');
  });
  it('auto-completes one text parameter with flags', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteTextParam(['bar'])).autocomplete('test -a --foo b');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test -a --foo bar');
  });
  it('fails no matches', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteTextParam(['foo', 'bar'])).autocomplete('test lol');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
  });
  it('already matches one integer number parameter', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteNumber()).autocomplete('test 1');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test 1');
  });
  it('already matches one floating number parameter', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteNumber()).autocomplete('test 1.1');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test 1.1');
  });
  it('auto-completes one keyword parameter', function() {
    const mockKeyword = new MockKeyword('foo');
    const result = CommandAutoCompleter(testCommand, AutoCompleteKeywords([mockKeyword])).autocomplete('test f');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test foo');
  });
  it('auto-completes one single-word text parameter', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteSingleWordTextParam(['foo', 'bar'])).autocomplete('test f');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test foo');
  });
  it('fails multi-word with single-word text parameter', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteSingleWordTextParam(['foo', 'bar'])).autocomplete('test foo bar');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test foo');
  });
  it('must reach the end to return single match', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteSingleWordTextParam(['foo'])).autocomplete('te bar');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
    expect(result.fixedValue).toBe('');
  });
});

describe('CommandAutoCompleter with more params', function() {
  it('auto-completes first text param', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteTextParam(['bar']).then(AutoCompleteNumber())).autocomplete('test b');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test bar');
  });
  it('auto-completes second text param', function() {
    const result = CommandAutoCompleter(testCommand, AutoCompleteNumber().then(AutoCompleteTextParam(['bar']))).autocomplete('test 1 b');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('test 1 bar');
  });
  it('already matches complex command', function() {
    const mockKeyword = new MockKeyword('foo');
    const keywords = AutoCompleteKeywords([mockKeyword]);
    const textParams = AutoCompleteSingleWordTextParam(['bar', 'lol']);
    const result = CommandAutoCompleter(testCommand, AutoCompleteNumber().then(textParams).then(keywords)).autocomplete('test 1 bar foo');
    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
    expect(result.fixedValue).toBe('test 1 bar foo');
  });
});

describe('CommandAutoCompleter man use-case', function() {
  it('auto-completes man', function() {
    const result = CommandAutoCompleter(manCommand, AutoCompleteTextParam([manCommand.name, 'list'])).autocomplete('ma');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('man');
  });
  it('auto-completes man man', function() {
    const result = CommandAutoCompleter(manCommand, AutoCompleteTextParam([manCommand.name, 'list'])).autocomplete('man ma');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('man man');
  });
  it('fails list', function() {
    const result = CommandAutoCompleter(manCommand, AutoCompleteTextParam([manCommand.name, 'list'])).autocomplete('li');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
  });
  it('fails unknown command', function() {
    const result = CommandAutoCompleter(manCommand, AutoCompleteTextParam([manCommand.name, 'list'])).autocomplete('man ba');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
  });
});

describe('CommandAutoCompleter list use-case', function() {
  it('auto-completes man', function() {
    const result = CommandAutoCompleter(listCommand).autocomplete('lis');
    expect(result.type).toBe(AutoCompleteResultType.SingleMatchFound);
    expect(result.fixedValue).toBe('list');
  });
  it('fails man', function() {
    const result = CommandAutoCompleter(listCommand).autocomplete('m');
    expect(result.type).toBe(AutoCompleteResultType.NotMatching);
  });
});