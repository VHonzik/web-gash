import { GashImp } from "./GashImp";
import ICommand, { AutoCompleteResult, AutoCompleteResultType, ParsingFailureReason, ParsingResult } from "./ICommand";
import IKeyword, { IKeywordGroup } from "./IKeyword";

const mockCommandName: string = 'mock';

class MockCommand implements ICommand {
  name: string = mockCommandName;

  parse: jest.Mock<ParsingResult, [string]> = jest.fn<ParsingResult, [string]>();
  autocomplete: jest.Mock<AutoCompleteResult, [string]> = jest.fn<AutoCompleteResult, [string]>();

  printManPage: jest.Mock<void, []> = jest.fn<void, []>();
  available: jest.Mock<boolean, []> = jest.fn<boolean, []>();
}

const mockKeywordName: string = 'mockKeyword';

class MockKeyword implements IKeyword {
  name: jest.Mock<string, []> = jest.fn<string, []>(() => mockKeywordName);
  printManPage: jest.Mock<void, []> = jest.fn<void, []>();
}

const mockKeywordGroupName: string = 'mockKeywordGroup';

class MockKeywordGroup implements IKeywordGroup {
  placeholderName: string = mockKeywordGroupName;
  color: string = '#FF0000';
  colorName: string = 'red';
}

describe('GashImpl', function() {
  it('registers default commands if specified', function() {
    const gash: GashImp = new GashImp();
    gash.init(true);
    expect(gash.commands).toHaveLength(2);
    expect(gash.commands[0].name).toBe('list');
    expect(gash.commands[1].name).toBe('man');

    const gashDefault: GashImp = new GashImp();
    gashDefault.init();
    expect(gashDefault.commands).toHaveLength(2);
    expect(gashDefault.commands[0].name).toBe('list');
    expect(gashDefault.commands[1].name).toBe('man');

    const gashFalse: GashImp = new GashImp();
    gashFalse.init(false);
    expect(gashFalse.commands).toHaveLength(0);
  });
  it('registers a custom command and expect man/list impl to see it', function() {
    const gash: GashImp = new GashImp();
    const mockCommand = new MockCommand();
    gash.init(false);
    gash.registerCommand(mockCommand);
    expect(gash.commands).toHaveLength(1);
    expect(gash.commands[0].name).toBe(mockCommandName);

    gash.findAndWriteCommandMan(mockCommandName);
    expect(mockCommand.printManPage.mock.calls.length).toBe(1);
    mockCommand.available.mockReturnValueOnce(true);
    const availableCommands = gash.getAvailableCommands();
    expect(availableCommands).toHaveLength(1);
    expect(mockCommand.available.mock.calls.length).toBe(1);
  });
  it('registers a custom keyword and expect man impl to see it', function() {
    const gash: GashImp = new GashImp();
    const mockKeyword = new MockKeyword();
    gash.init(false);
    gash.registerKeyword(mockKeyword);
    expect(gash.keywords).toHaveLength(1);
    expect(gash.keywords[0].name()).toBe(mockKeywordName);
    expect(mockKeyword.name.mock.calls.length).toBe(1);

    gash.findAndWriteKeywordMan(mockKeywordName);
    expect(mockKeyword.printManPage.mock.calls.length).toBe(1);
  });
  it('registers a custom keyword group', function() {
    const gash: GashImp = new GashImp();
    const mockKeywordGroup = new MockKeywordGroup();
    gash.init(false);
    gash.registerKeywordGroup(mockKeywordGroup);
    expect(gash.keywordGroups).toHaveLength(1);
    expect(gash.keywordGroups[0].placeholderName).toBe(mockKeywordGroupName);
  });
  it('should call commands parse method in the order of registration', function() {
    const gash: GashImp = new GashImp();
    const mockCommandA = new MockCommand();
    const mockCommandB = new MockCommand();
    gash.init(false);
    gash.registerCommand(mockCommandA);
    gash.registerCommand(mockCommandB);

    mockCommandA.parse.mockReturnValueOnce({ success: false, failureReason: ParsingFailureReason.WrongCommand });
    mockCommandB.parse.mockReturnValueOnce({ success: false, failureReason: ParsingFailureReason.WrongCommand });

    gash.parseLineCommands('foo');

    expect(mockCommandA.parse.mock.calls.length).toBe(1);
    expect(mockCommandB.parse.mock.calls.length).toBe(1);

    expect(mockCommandA.parse.mock.invocationCallOrder[0]).toBeLessThan(mockCommandB.parse.mock.invocationCallOrder[0]);
  });
  it('should call commands autocomplete method in the order of registration', function() {
    const gash: GashImp = new GashImp();
    const mockCommandA = new MockCommand();
    const mockCommandB = new MockCommand();
    gash.init(false);
    gash.registerCommand(mockCommandA);
    gash.registerCommand(mockCommandB);

    mockCommandA.autocomplete.mockReturnValueOnce({ type: AutoCompleteResultType.NotMatching, fixedValue: '' });
    mockCommandB.autocomplete.mockReturnValueOnce({ type: AutoCompleteResultType.NotMatching, fixedValue: '' });

    gash.tryAutocomplete('foo');

    expect(mockCommandA.autocomplete.mock.calls.length).toBe(1);
    expect(mockCommandB.autocomplete.mock.calls.length).toBe(1);

    expect(mockCommandA.autocomplete.mock.invocationCallOrder[0]).toBeLessThan(mockCommandB.autocomplete.mock.invocationCallOrder[0]);
  });
  it('handles keyboard input events', function() {
    const gash: GashImp = new GashImp();
    gash.init(false);

    // Should start empty
    expect(gash.preCursorInput()).toBe('');
    expect(gash.postCursorInput()).toBe('');

    // Typing 'f' key: 'f' -> cursor
    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'f'}));
    expect(gash.preCursorInput()).toBe('f');
    expect(gash.postCursorInput()).toBe('');

    // Typing 'o' key: 'f' -> 'o' -> cursor
    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'o'}));
    expect(gash.preCursorInput()).toBe('fo');
    expect(gash.postCursorInput()).toBe('');

    // Typing left arrow key: 'f' -> cursor -> 'o'
    gash.keyDown(new KeyboardEvent('lAKeyboardPress', {key: 'ArrowLeft'}));
    expect(gash.preCursorInput()).toBe('f');
    expect(gash.postCursorInput()).toBe('o');

    // Typing delete key: 'f' -> cursor
    gash.keyDown(new KeyboardEvent('delKeyboardPress', {key: 'Delete'}));
    expect(gash.preCursorInput()).toBe('f');
    expect(gash.postCursorInput()).toBe('');

    // Typing backspace key: empty
    gash.keyDown(new KeyboardEvent('backSKeyboardPress', {key: 'Backspace'}));
    expect(gash.preCursorInput()).toBe('');
    expect(gash.postCursorInput()).toBe('');
  });
  it('handles command history', function() {
    const gash: GashImp = new GashImp();
    gash.init(false);

    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'f'}));
    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'o'}));
    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'o'}));
    gash.keyDown(new KeyboardEvent('enterKeyboardPress', {key: 'Enter'}));

    // Should be empty after submitting input
    expect(gash.preCursorInput()).toBe('');
    expect(gash.postCursorInput()).toBe('');

    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'b'}));
    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'a'}));
    gash.keyDown(new KeyboardEvent('fKeyboardPress', {key: 'r'}));

    // Should be bar
    expect(gash.preCursorInput()).toBe('bar');
    expect(gash.postCursorInput()).toBe('');

    gash.keyDown(new KeyboardEvent('arrowUpKeyboardPress', {key: 'ArrowUp'}));

    // Input should be replaced by previous line
    expect(gash.preCursorInput()).toBe('foo');
    expect(gash.postCursorInput()).toBe('');

    gash.keyDown(new KeyboardEvent('arrowDownKeyboardPress', {key: 'ArrowDown'}));

    // Active input should be remembered and possible to return to
    expect(gash.preCursorInput()).toBe('bar');
    expect(gash.postCursorInput()).toBe('');
  });
  it('prefers already matching auto-completion over single match', function() {
    const gash: GashImp = new GashImp();
    gash.init(false);

    const mockCommandA = new MockCommand();
    const mockCommandB = new MockCommand();

    gash.registerCommand(mockCommandA);
    gash.registerCommand(mockCommandB);

    mockCommandA.autocomplete.mockReturnValueOnce({ type: AutoCompleteResultType.AlreadyMatching, fixedValue: 'foo' });
    mockCommandB.autocomplete.mockReturnValueOnce({ type: AutoCompleteResultType.SingleMatchFound, fixedValue: 'foobar' });

    const result = gash.tryAutocomplete('foo');

    expect(mockCommandA.autocomplete.mock.calls.length).toBe(1);
    expect(mockCommandB.autocomplete.mock.calls.length).toBe(1);

    expect(result.type).toBe(AutoCompleteResultType.AlreadyMatching);
  });
  it('calls onTerminalMounted when triggered', function() {
    const callback: jest.Mock<void, []> = jest.fn<void, []>();

    const gash: GashImp = new GashImp();
    gash.init(false);
    gash.onTerminalMounted(callback);

    gash.outputMounted();

    expect(callback.mock.calls.length).toBe(1);
  });
});