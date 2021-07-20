import React, { useEffect, useRef, useState } from 'react';
import { black900, Colored, CommandColored, cyan600 } from './components/Colored';
import { Line } from './components/Line';
import { Emitter, Unsubscribe } from './Events';
import { IGash } from './Gash';
import ICommand, { AutoCompleteResult, AutoCompleteResultType, ParsingFailureReason, ParsingResult } from './ICommand';
import IKeyword, { IKeywordGroup } from './IKeyword';
import { AutoCompleteTextParam, CommandAutoCompleter, CommandBodyLikeParse, CommandParser, TextParameter } from './Parsers';

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

const defaultParsingResultData: ParsingResult = {
  success: false,
  failureReason: ParsingFailureReason.WrongCommand
}

export class GashImp implements IGash {
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

  private emitter: Emitter<Events> = new Emitter<Events>();

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
      this.writeLine(React.cloneElement(synopsisLine, {tabs: synopsisLine.props.tabs || 1}));
    }
    this.writeLine(<Line systemMessage>DESCRIPTION</Line>);
    for (const descriptionLine of descriptionLines) {
      this.writeLine(React.cloneElement(descriptionLine, {tabs: descriptionLine.props.tabs || 1}));
    }
    if (optionsLines !== undefined) {
      this.writeLine(<Line systemMessage>OPTIONS</Line>);
      for (const optionLine of optionsLines) {
        this.writeLine(React.cloneElement(optionLine, {tabs: optionLine.props.tabs || 1}));
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
    } else if (!resultData.success && resultData.failureReason === ParsingFailureReason.UnrecognizedOption) {
      this.writeLine(<Line systemMessage>Unknown option for a command. See <CommandColored>man {resultData.command}</CommandColored>.</Line>);
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

  public getAvailableCommands(): ICommand[] {
    return this.commands.filter(command => command.available());
  }

  /* Autocompletion */

  private processAutocompleteInput(event: KeyboardEvent) : boolean {
    const key = event.key;
    return key === tabKey;
  }

  public tryAutocomplete(line: string): AutoCompleteResult {
    const resultsData: AutoCompleteResult[] = [];

    for (const command of this.commands) {
      resultsData.push(command.autocomplete(line));
    }

    const successes = resultsData.filter(resultData => resultData.type === AutoCompleteResultType.SingleMatchFound || resultData.type === AutoCompleteResultType.MultipleMatchesFound);
    const alreadyMatching = resultsData.filter(resultData => resultData.type === AutoCompleteResultType.AlreadyMatching);

    if (alreadyMatching.length === 1) {
      return alreadyMatching[0];
    }

    if (successes.length === 1) {
      return successes[0];
    }

    return {type: AutoCompleteResultType.NotMatching, fixedValue: ''};
  }

  /* Character buffer */

  public clearCharacterBuffer(): void {
    this.startCharacterBufferLine();
  }

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

export const GashImpl = new GashImp();

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
      <Line><CommandColored>man</CommandColored> <Colored foreground={black900} background={cyan600}>command</Colored></Line>,
    ];

    let colors: React.ReactNode = <CommandColored>cyan</CommandColored>;
    let keywordColors: React.ReactNode[] = [];

    for (const keywordGroup of GashImpl.keywordGroups) {
      synopsisLines.push(<Line><CommandColored>man</CommandColored> <Colored foreground={black900} background={keywordGroup.color}>{keywordGroup.placeholderName}</Colored></Line>);
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

      for (const command of GashImpl.getAvailableCommands()) {
        GashImpl.writeLine(<Line tabs={1}><CommandColored>{command.name}</CommandColored></Line>);
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

export function Output() {
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

/** Optional properties of the terminal's prompt. */
export interface PromptProps {
  /**
   * Prompt text, i.e. text that will be rendered in the input line before users input. Defaults to `$ `.
   */
  promptText?: string
}

export function Prompt(props: PromptProps) {
  let text = '$ ';
  if (props.promptText !== undefined) {
    text = props.promptText;
  }
  return <span>{text}</span>
}

/** Optional properties of the terminal's cursor. */
export interface CursorProps {
  /**
   * Symbol that will represent the cursor. Defaults to `_`.
   */
  symbol?: string;
  /**
   * How many times per second the cursor will blink meaning, i.e. toggle it's visibility. Defaults to 3 or visibility flip every 1.0/3.0 seconds.
   */
  blinkPerSecond?: number;
  /**
   * Whether to display the cursor under the text. Implemented via `position: 'absolute'`. Defaults to true.
   */
  underText?: boolean;
}

export function Cursor(props: CursorProps) {
  const [visible, setVisible] = useState(true);
  let {symbol, blinkPerSecond, underText } = props;

  if (symbol === undefined) {
    symbol = '_';
  }

  if (blinkPerSecond === undefined) {
    blinkPerSecond = 3;
  }

  if (underText === undefined) {
    underText = true;
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

export interface InputTextProps {
  cursor?: CursorProps
}

export function InputText(props: InputTextProps) {
  function renderInput() : JSX.Element {
    if (GashImpl.hasInput()) {
      return (
        <span>{GashImpl.preCursorInput()}<Cursor {...props.cursor} />{GashImpl.postCursorInput()}</span>
      )
    } else {
      return (
        <span><Cursor {...props.cursor}/></span>
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

export interface InputProps {
  prompt?: PromptProps
  cursor?: CursorProps
}

export function Input(props: InputProps) {
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
      <Prompt {...props.prompt} /><InputText cursor={props.cursor}/>
    </div>
  );
}

export function TerminalScroller() {
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