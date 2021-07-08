import { Colored, cyan600 } from "./components/Colored";
import { AutoCompleteTextParam, CommandAutoCompleter, CommandBodyLikeParse, CommandParser, TextParameter } from "./Parsers";
import ICommand, { AutoCompleteResult, AutoCompleteResultType, ParsingFailureReason, ParsingResult } from "./ICommand";
import IKeyword, { IKeywordGroup } from "./IKeyword";
import { Line } from "./components/Line";
import React, { useEffect, useRef, useState } from "react";
import { createNanoEvents, Emitter, Unsubscribe } from "nanoevents";

/**
 * Main entry point to Gash library.
 */
 interface IGash {
  /**
   * Initialize the Gash library.
   *
   * @remarks
   * Should be called during the application initialization, e.g. in index.tsx or index.js before `ReactDOM.render`.
   *
   * @param registerBuiltInCommands Whether the built-in commands `list` and `man` should be registered on init. Defaults to `true`.
   */
  init(registerBuiltInCommands?: boolean): void;

  /**
   * Register a command to be recognized by Gash.
   *
   * @remarks
   * Commands must be registered in order for them to be parsed after player submits an input, be listed in `list` command output and their manual page displayed when `man` command is called on them.
   *
   * @param command User-created command
   */
   registerCommand(command: ICommand): void;

   /**
    * Register a keyword to be recognized by Gash.
    *
    * @remarks
    * Keywords must be register in order to have their manual page displayed when `man` command is called on them.
    *
    * @param keyword User-created keyword
    */
   registerKeyword(keyword: IKeyword): void;

   /**
    * Register a keyword group to be recognized by Gash.
    *
    * @remarks
    * Keyword groups are displayed in manual page of `man` command (`man man`). See `IKeywordGroup` for more information.
    * @param keywordGroup User-created keyword group
    */
   registerKeywordGroup(keywordGroup: IKeywordGroup): void;

   /**
    * Outputs line to the terminal.
    *
    * @param line React component to add to the terminal. It is recommended to use `<Line>` component.
    */
   writeLine(line: JSX.Element): void;

   /**
    * Outputs a temporary line to the terminal there are meant to be displayed for limited amount of time.
    *
    * @remarks
    * Temporary lines are always displayed below the regular lines.
    * There is a limited number of "slots" for temporary lines, albeit dynamically set, which allows for overwriting existing lines. This is especially useful for animated lines.
    * Temporary lines can be quickly cleared with `Gash.clearTempLines`.
    * Can be paired with `Gash.enableInput(false)` to give an impression of time passing.
    *
    * @param line React component to add to the terminal. It is recommended to use `<Line>` component.
    * @param slot "Row" index to write the line to. If a line with this index was already written before, it is overwritten. Otherwise array holding the temporary lines is extended to encompass the `slot` index and filled with empty lines if necessary.
    */
   writeTempLine(line: JSX.Element, slot: number): void;

   /**
    * Clear all temporary lines, removing them from the terminal.
    */
   clearTempLines(): void;

   /**
    * Enables or disables the input from the user, hiding the input line with prompt and cursor.
    *
    * @remarks
    * The input starts enabled upon Gash initialization.
    * User has no built-in way to re-enabled a disabled input so it is best disabled only temporarily.
    * Can be useful for giving impression on time passing together with animated temporary lines.
    *
    * @param enable Whether to enable the input - `true` or disable it - `false`.
    */
   enableInput(enable: boolean): void;

   /**
    * Writes a standardized manual page for a command.
    *
    * @remarks
    * The output has following structure and is properly formatted.
    *  Manual page for command `command.name()`
    *  NAME
    *    `command.name()`
    *  SYNOPSIS
    *    `synopsisLines`
    *  DESCRIPTION
    *    `descriptionLines`
    *  OPTIONS (if `optionsLines` are provided)
    *    `optionsLines`
    *
    * The built-in commands `man` and `list` use this function.
    *
    * @param command Command to print manual page for. Its `command.name()` will be used as noted above.
    * @param synopsisLines Lines that briefly show the syntax of the command. See built-in commands for examples.
    * @param descriptionLines Lines that describe the command, what it does and any other remarks.
    * @param optionsLines A Line for each possible option that names it and describes what it does.
    */
   writeManPage(command: ICommand, synopsisLines: JSX.Element[], descriptionLines: JSX.Element[], optionsLines?: JSX.Element[]): void;
}

const defaultParsingResultData: ParsingResult = {
  success: false,
  failureReason: ParsingFailureReason.WrongCommand
}

interface Events {
  outputChanged: () => void;
  outputLineAdded: (line: JSX.Element) => void;
  outputTempLineChanged: (slot: number) => void;
  outputTempLinesCleared: () => void;
  inputActiveChanged: (active: boolean) => void;
  inputHandled: () => void;
}

const backspaceKey : string  = 'Backspace';
const deleteKey : string  = 'Delete';
const enterKey : string  = 'Enter';
const downArrowKey : string  = 'ArrowDown';
const leftArrowKey : string  = 'ArrowLeft';
const rightArrowKey : string  = 'ArrowRight';
const tabKey: string = 'Tab';
const upArrowKey : string  = 'ArrowUp';

/**
 * Text styled to look as a built-in commands references
 */
export function CommandColored(props: { children?: React.ReactNode }): JSX.Element {
  return <Colored {...props} foreground={cyan600} />;
}

class GashImp implements IGash {
  public commands: Array<ICommand> = [];
  public keywords: Array<IKeyword> = [];
  public keywordGroups: Array<IKeywordGroup> = [];

  public outputLines: Array<JSX.Element> = [];
  public outputTempLines: Array<JSX.Element> = [];

  public inputActive: boolean = true;

  /* Character buffer */

  private currentCharacterBufferInput: string = '';
  private currentCharacterBufferIndex : number = 0;

  /* Command history */

  private commandHistoryIndex: number = 0;
  private commandHistory: Array<string> = [];
  private historyCalledOnLineYet: boolean = false;

  private emitter: Emitter<Events> = createNanoEvents<Events>();

  init(registerBuiltInCommands?: boolean): void {
    if (registerBuiltInCommands === undefined || registerBuiltInCommands) {
      this.registerCommand(new List());
      this.registerCommand(new Man());
    }
  }

  registerCommand(command: ICommand): void {
    this.commands.push(command);
  }

  registerKeyword(keyword: IKeyword): void {
    this.keywords.push(keyword);
  }

  registerKeywordGroup(keywordGroup: IKeywordGroup): void {
    this.keywordGroups.push(keywordGroup);
  }

  writeLine(line: JSX.Element): void {
    this.outputLines.push(React.cloneElement(line, {key: `line${this.outputLines.length}`}));
    this.emitter.emit('outputLineAdded', this.outputLines[this.outputLines.length-1]);
    this.emitter.emit('outputChanged');
  }

  writeTempLine(line: JSX.Element, slot: number): void {
    while (this.outputTempLines.length-1 < slot) {
      this.outputTempLines.push(<Line key={`tempLine${this.outputTempLines.length}`} />);
    }
    this.outputTempLines[slot] = React.cloneElement(line, {key: `tempLine${slot}`});
    this.emitter.emit('outputTempLineChanged', slot);
    this.emitter.emit('outputChanged');
  }

  clearTempLines(): void {
    this.outputTempLines = [];
    this.emitter.emit('outputTempLinesCleared');
    this.emitter.emit('outputChanged');
  }

  enableInput(enable: boolean): void {
    this.inputActive = enable;
    this.emitter.emit('inputActiveChanged', this.inputActive);
  }

  writeManPage(command: ICommand, synopsisLines: JSX.Element[], descriptionLines: JSX.Element[], optionsLines?: JSX.Element[]): void {
    this.writeLine(<Line systemMessage>Manual page for command <CommandColored>{command.name}</CommandColored></Line>);
    this.writeLine(<Line systemMessage>NAME</Line>);
    this.writeLine(<Line systemMessage tabs={1}>{command.name}</Line>);
    this.writeLine(<Line systemMessage>SYNOPSIS</Line>);
    for (const synopsisLine of synopsisLines) {
      this.writeLine(React.cloneElement(synopsisLine, {tabs: 1}));
    }
    this.writeLine(<Line systemMessage>DESCRIPTION</Line>);
    for (const descriptionLine of descriptionLines) {
      this.writeLine(React.cloneElement(descriptionLine, {tabs: 1}));
    }
    if (optionsLines !== undefined) {
      this.writeLine(<Line systemMessage>OPTIONS</Line>);
      for (const optionLine of optionsLines) {
        this.writeLine(React.cloneElement(optionLine, {tabs: 1}));
      }
    }
    this.writeLine(<Line />);
  }


  public parseLineCommands(line: string) {
    let resultData = defaultParsingResultData;

    for (const command of this.commands) {
      resultData = command.parse(line);
      if (resultData.success || resultData.failureReason !== ParsingFailureReason.WrongCommand) {
        break;
      }
    }

    if (!resultData.success && resultData.failureReason === ParsingFailureReason.WrongCommand) {
      let command = line;
      const commandLikeResult = CommandBodyLikeParse(line);
      if (commandLikeResult.success && commandLikeResult.command !== undefined) {
        command = commandLikeResult.command;
      }
      this.writeLine(<Line systemMessage>Unknown command <CommandColored>{command}</CommandColored></Line>);
      this.writeLine(<Line />);
    } else if (!resultData.success && resultData.failureReason === ParsingFailureReason.MissingParam) {
      this.writeLine(<Line systemMessage>Missing required param(s) for a command. See <CommandColored>man {resultData.command}</CommandColored>.</Line>);
      this.writeLine(<Line />);
    }
  }

  public on<E extends keyof Events>(event: E, callback: Events[E]): Unsubscribe {
    return this.emitter.on(event, callback);
  }

  public findAndWriteCommandMan(commandName: string): boolean {
    for (const command of this.commands) {
      if (commandName === command.name) {
        command.printManPage();
        return true;
      }
    }
    return false;
  }

  public findAndWriteKeywordMan(keywordName: string): boolean {
    for (const keyword of this.keywords) {
      if (keywordName === keyword.name()) {
        keyword.printManPage();
        return true;
      }
    }
    return false;
  }

  /* Autocompletion */

  private processAutocompleteInput(event: KeyboardEvent) : boolean {
    const key = event.key;
    return key === tabKey;
  }

  private tryAutocomplete(line: string): AutoCompleteResult {
    const resultsData: AutoCompleteResult[] = [];

    for (const command of this.commands) {
      resultsData.push(command.autocomplete(line));
    }

    const successes = resultsData.filter(resultData => resultData.type === AutoCompleteResultType.SingleMatchFound || resultData.type === AutoCompleteResultType.MultipleMatchesFound);

    if (successes.length === 1) {
      return successes[0];
    }

    return {type: AutoCompleteResultType.NotMatching, fixedValue: ''};
  }

  /* Character buffer */

  private startCharacterBufferLine(): void {
    this.currentCharacterBufferInput = '';
    this.currentCharacterBufferIndex = 0;
  }

  private processCharacterBufferInput(event: KeyboardEvent) {
    const key = event.key;

    if (key.length === 1 && !event.ctrlKey) {
      if (this.currentCharacterBufferIndex >= this.currentCharacterBufferInput.length) {
        this.currentCharacterBufferInput += event.key;
      } else {
        this.currentCharacterBufferInput = this.currentCharacterBufferInput.slice(0, this.currentCharacterBufferIndex) + event.key + this.currentCharacterBufferInput.slice(this.currentCharacterBufferIndex);
      }
      this.currentCharacterBufferIndex += 1;
    } else if (key === backspaceKey) {
      if (this.currentCharacterBufferInput.length > 0 && this.currentCharacterBufferIndex > 0) {
        this.currentCharacterBufferInput = this.currentCharacterBufferInput.slice(0, this.currentCharacterBufferIndex-1) + this.currentCharacterBufferInput.slice(this.currentCharacterBufferIndex);
        this.currentCharacterBufferIndex -= 1;
      }
    } else if (key === deleteKey) {
      if (this.currentCharacterBufferInput.length > 0 && this.currentCharacterBufferIndex < this.currentCharacterBufferInput.length) {
        this.currentCharacterBufferInput = this.currentCharacterBufferInput.slice(0, this.currentCharacterBufferIndex) + this.currentCharacterBufferInput.slice(this.currentCharacterBufferIndex+1);
      }
    } else if (key === leftArrowKey) {
      this.currentCharacterBufferIndex = Math.max(0, this.currentCharacterBufferIndex-1);
    } else if (key === rightArrowKey) {
      this.currentCharacterBufferIndex = Math.min(this.currentCharacterBufferInput.length, this.currentCharacterBufferIndex+1);
    }
  }

  public preCursorInput(): string {
    return this.sanitize(this.currentCharacterBufferInput.slice(0, this.currentCharacterBufferIndex));
  }

  public postCursorInput(): string {
    return this.sanitize(this.currentCharacterBufferInput.slice(this.currentCharacterBufferIndex));
  }

  private overwriteCharacterBufferLine(line: string) {
    this.currentCharacterBufferInput = line;
    this.currentCharacterBufferIndex = this.currentCharacterBufferInput.length;
  }

  /* Command history */

  private startCommandHistoryLine(): void {
    this.commandHistoryIndex = this.commandHistory.length;
    this.historyCalledOnLineYet = false;
  }

  private addCommandToHistory(line: string) {
    this.commandHistory.push(line);
  }

  private clearLastCommandInHistory() {
    this.commandHistory.pop();
  }

  private processCommandHistoryInput(event: KeyboardEvent) : boolean {
    const key = event.key;
    switch(key) {
      case upArrowKey:
        if(this.commandHistory.length > 0 && this.commandHistoryIndex >= 1) {
          this.commandHistoryIndex--;
        }
        return true;
      case downArrowKey:
        if(this.commandHistory.length > 0 && this.commandHistoryIndex < this.commandHistory.length -1) {
          this.commandHistoryIndex++;
        }
        return true;
      default:
        return false;
    }
  }

  private commandHistoryValid(): boolean {
    return this.commandHistoryIndex >=0 && this.commandHistoryIndex < this.commandHistory.length;
  }

  private getCommandHistory(): string {
    return this.commandHistory[this.commandHistoryIndex];
  }

  /* Input */

  public keyDown(event: KeyboardEvent) {
    if (this.inputActive) {
      if (this.processAutocompleteInput(event)) {
        const resultData = this.tryAutocomplete(this.currentCharacterBufferInput);
        if (resultData.type === AutoCompleteResultType.SingleMatchFound || resultData.type === AutoCompleteResultType.MultipleMatchesFound) {
          this.overwriteCharacterBufferLine(resultData.fixedValue);
        }
        event.preventDefault();
        this.emitter.emit('inputHandled');
      } else if (this.processCommandHistoryInput(event)) {
        if (!this.historyCalledOnLineYet) {
          this.historyCalledOnLineYet = true;
          this.addCommandToHistory(this.currentCharacterBufferInput);
        }
        if (this.commandHistoryValid()) {
          this.overwriteCharacterBufferLine(this.getCommandHistory());
        }
        event.preventDefault();
        this.emitter.emit('inputHandled');
      } else if (event.key === enterKey) {
        this.parseInput();
        this.emitter.emit('inputHandled');
      }
      else {
        this.processCharacterBufferInput(event);
        this.emitter.emit('inputHandled');
      }
    }
  }

  private parseInput() {
    const input = this.currentCharacterBufferInput;
    if (this.historyCalledOnLineYet) {
      this.clearLastCommandInHistory();
    }
    this.addCommandToHistory(input);
    this.startCharacterBufferLine();
    this.startCommandHistoryLine();
    this.parseLineCommands(input);
  }

  private sanitize(text: string) {
    return text.replace(/ /g, '\u00a0');
  }

  public hasInput(): boolean {
    return this.currentCharacterBufferInput.length > 0;
  }

  public clearCurrentLine() {
    this.startCharacterBufferLine();
  }
}

const GashImpl = new GashImp();

/**
 * Main entry point to the Gash library
 */
export const Gash:IGash = GashImpl;

/* Commands */

class Man implements ICommand  {
  public name: string = 'man';

  public constructor() {
  }

  parse(line: string): ParsingResult {
    const commandParserResult = CommandParser(this, TextParameter()).parse(line);
    if (commandParserResult.success) {
      if (!GashImpl.findAndWriteCommandMan(commandParserResult.params[0])) {
        if (!GashImpl.findAndWriteKeywordMan(commandParserResult.params[0])) {
          GashImpl.writeLine(<Line systemMessage>Unrecognized command or keyword '{commandParserResult.params[0]}', cannot display manual page.</Line>);
        }
      }
    }
    return commandParserResult;
  }

  autocomplete(line: string): AutoCompleteResult {
    const words = [...GashImpl.commands.map(command => command.name), ...GashImpl.keywords.map(keyword => keyword.name())];
    return CommandAutoCompleter(this, AutoCompleteTextParam(words)).autocomplete(line);
  }

  printManPage(): void {
    const synopsisLines: JSX.Element[] = [
      <Line><CommandColored>man</CommandColored> <Colored foreground={'black'} background={cyan600}>command</Colored></Line>,
    ];

    let colors: React.ReactNode = <CommandColored>cyan</CommandColored>;
    let keywordColors: React.ReactNode[] = [];

    for (const keywordGroup of GashImpl.keywordGroups) {
      synopsisLines.push(<Line><CommandColored>man</CommandColored> <Colored foreground={'black'} background={keywordGroup.color}>{keywordGroup.placeholderName}</Colored></Line>);
      keywordColors.push(<Colored foreground={keywordGroup.color}>{keywordGroup.colorName}</Colored>);
    }

    if (keywordColors.length > 0) {
      keywordColors = [colors, ...keywordColors];
      colors = keywordColors.reduce((prev, curr) => [prev, ', ', curr]);
    }

    GashImpl.writeManPage(this, synopsisLines, [
      <Line systemMessage>Display a manual page for a command or a game mechanic.</Line>,
      <Line systemMessage>Any text in {keywordColors.length > 0 ? 'these colors': 'this color'}: {colors} can be passed as a parameter.</Line>,
    ]);
  }

  available(): boolean {
    return true;
  }
}

class List implements ICommand {
  public name: string = 'list';

  public constructor() {
  }

  parse(line: string): ParsingResult {
    const result = CommandParser(this).parse(line);
    if (result.success) {
      GashImpl.writeLine(<Line systemMessage>Currently available commands follow. You can use <CommandColored>man</CommandColored> to learn more about them.</Line>);

      for (const command of GashImpl.commands) {
        if (command.available()) {
          GashImpl.writeLine(<Line tabs={1}><CommandColored>{command.name}</CommandColored></Line>);
        }
      }
      GashImpl.writeLine(<Line />);
    }

    return result;
  }

  autocomplete(line: string): AutoCompleteResult {
    return CommandAutoCompleter(this).autocomplete(line);
  }

  printManPage(): void {
    GashImpl.writeManPage(this, [
      <Line><CommandColored>list</CommandColored></Line>
    ], [
      <Line systemMessage>Display list of currently available commands.</Line>
    ]);
  }

  available(): boolean {
    return true;
  }
}

/* Components */

function Output() {
  const [lines, setLines] = useState(new Array<JSX.Element>());
  const [tempLines, setTempLines] = useState(new Array<React.ReactNode>());

  useEffect(() => {
    function onLineAdded(line: JSX.Element) {
      setLines((prevLines) => [...prevLines, line]);
    }
    function onTempLineChanged(slot: number) {
      const changedLineEmptied = GashImpl.outputTempLines.map((line, index) => index === slot ? null : line)
      setTempLines(changedLineEmptied);
      setTempLines([...GashImpl.outputTempLines]);
    }
    function onTempLinesCleared() {
      setTempLines([]);
    }

    const unbind = GashImpl.on('outputLineAdded', onLineAdded);
    const unbindTemp = GashImpl.on('outputTempLineChanged', (slot: number) => onTempLineChanged(slot));
    const unbindTempClear = GashImpl.on('outputTempLinesCleared', () => onTempLinesCleared());

    return function cleanup() {
      unbind();
      unbindTemp();
      unbindTempClear();
    }
  });

  return (
    <div>
      {lines}
      {tempLines}
    </div>
  );
}

// TODO add the content as prop and expose those in terminal component
function Prompt() {
  return <span>$ </span>
}

// TODO expose those in terminal component
interface CursorProps {
  symbol?: string;
  blinkPerSecond?: number;
  underText?: boolean;
}

function Cursor(props: CursorProps) {
  const [visible, setVisible] = useState(true);
  let {symbol, blinkPerSecond, underText } = props;

  if (symbol === undefined) {
    symbol = '_';
  }

  if (blinkPerSecond === undefined) {
    blinkPerSecond = 3;
  }

  if (underText === undefined) {
    underText = false;
  }

  let styles: React.CSSProperties = {
    marginTop: '2px',
    fontWeight: 700
  };

  if (!visible) {
    styles = {...styles, visibility: 'hidden'};
  }

  if (underText) {
    styles = {...styles, position: 'absolute'};
  }

  const blinkDuration = 1000.0 / blinkPerSecond;

  useEffect(() => {
    function handleTimer() {
      setVisible((prevValue) => !prevValue);
    }
    const timer = setTimeout(handleTimer, blinkDuration);

    return function cleanUp() {
      clearInterval(timer);
    }
  });

  return (
    <span style={styles}>{symbol}</span>
  );
}

function InputText() {
  function renderInput() : JSX.Element {
    if (GashImpl.hasInput()) {
      return (
        <span>{GashImpl.preCursorInput()}<Cursor underText />{GashImpl.postCursorInput()}</span>
      )
    } else {
      return (
        <span><Cursor /></span>
      )
    };
  }

  const [currentLine, setCurrentLine] = useState(renderInput());

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      GashImpl.keyDown(event);
    }
    function inputHandled() {
      setCurrentLine(renderInput());
    }
    document.addEventListener('keydown', handleKeyDown);
    const inputHandledUnSub = GashImpl.on('inputHandled', inputHandled);

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
      inputHandledUnSub();
    }
  });

  return (
    <span>{currentLine}</span>
  );
}

function Input() {
  const [inputShown, setInputShown] = useState(true);

  useEffect(() => {
    function activeInputChanged(active: boolean) {
      setInputShown(active);
    }
    const unSubscribe = GashImpl.on('inputActiveChanged', activeInputChanged);

    return function cleanup() {
      unSubscribe();
    }
  });

  return (
    <div style={{maxWidth: '100%', wordWrap: 'break-word', display: inputShown ? 'block' : 'none', marginBottom: '20px'}}>
      <Prompt /><InputText />
    </div>
  );
}

function TerminalScroller() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function scrollToView() {
      elementRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const inputHandledUnSub = GashImpl.on('inputHandled', scrollToView);
    const inputActiveChangedUnSub = GashImpl.on('inputActiveChanged', scrollToView);
    const outputChangedUnSub = GashImpl.on('outputChanged', scrollToView);

    return function cleanup() {
      inputHandledUnSub();
      outputChangedUnSub();
      inputActiveChangedUnSub();
    }
  });

  return (
    <div ref={elementRef}/>
  )
}


/**
 * Main React component of the Gash library representing a terminal.
 *
 * @remarks
 * By default it is already styled including taking up the whole window.
 * The styling is using Inconsolata Google font which is not packed with Gash. You can add it to your project for example with the following css link:
 * `@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap');`
 */
export function Terminal() {
  const style:React.CSSProperties = {
    textAlign: 'left',
    backgroundColor: '#050505',
    minHeight: 'calc(100vh - 20px)',
    fontFamily: `'Inconsolata', monospace`,
    fontSize: '16px',
    fontWeight: 400,
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 20px 0px 50px',
  };
  return (
    <div style={style}>
      <Output />
      <Input />
      <TerminalScroller />
    </div>
  );
}