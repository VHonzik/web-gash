import { GashImp } from "./GashImp";
import ICommand, { AutoCompleteResult, ParsingResult } from "./ICommand";
import IKeyword, { IKeywordGroup } from "./IKeyword";

const mockCommandName: string = 'mock';

// const parsingSuccess: ParsingResult = {
//   success: true,
//   command: mockCommandName,
// };

// const autoCompletionSuccess: AutoCompleteResult = {
//   type: AutoCompleteResultType.SingleMatchFound,
//   fixedValue: mockCommandName,
// };

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
})