import ICommand from "./ICommand";
import IKeyword, { IKeywordGroup } from "./IKeyword";
import React from "react";
import { CursorProps, GashImpl, Input, Output, PromptProps, TerminalScroller } from "./GashImp";

export type { CursorProps, PromptProps, } from "./GashImp";

/**
 * Main entry point to Gash library.
 */
export interface IGash {
  /**
   * Initialize the Gash library.
   *
   * @remarks
   * Should be called during the application initialization, e.g. in index.tsx or index.js before `ReactDOM.render`.
   * Note that the Terminal React component might not be mounted immediately after this call. To write any introductory lines you can use `IGash.onTerminalMounted` event.
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
   * Disables receiving player's input and hides the input line with prompt and cursor.
   *
   * @remarks
   * The input starts enabled upon Gash initialization.
   * Player has no built-in way to re-enabled a disabled input so it is best disabled only temporarily.
   * Can be useful for giving impression of time passing together with animated temporary lines.
   */
  disableInput(): void;

  /**
   * Enables receiving the player's input and shows the input line with prompt and cursor.
   *
   * @remarks
   * The input starts enabled upon Gash initialization.
   */
  enableInput(): void;

  /**
   * Enables user to listen to 'raw' input events before they are processed by Gash and optionally intercept them.
   *
   * @remarks
   * Before Gash will process an input event, the passed callback will be called and depending on the return value of the callback, the processing will either stop there or continue to Gash.
   * Note that this will work even when input has been disabled with `disableInput()`. In that case Gash won't process the input no matter the callback return value.
   * Calling this function repeatedly will overwrite the callback meaning there is only one routing at a time.
   *
   * @param inputCallback Callback that will called each time Gash receives an input event. The `event` is 'raw' browser `KeyboardEvent` (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent). The return value is whether to prevent Gash from processing the event further - `true` - or not - `false`.
   */
  routeInput(inputCallback: (event: KeyboardEvent) => boolean): void;

  /**
   * Disables listening to 'raw' input events before they are processed by Gash.
   *
   * @remarks
   * Clears any routing set-up with `routeInput`. The passed callback will no longer be called.
   */
  removeInputRouting(): void;

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
   * Note that the `synopsisLines`, `descriptionLines` or `optionsLines` elements are cloned (`React.cloneElement`) prior to being written. Additionally if their `props` do not include `LineProps.tabs`, the cloned element will have the `props.tabs` set to 1 in order to automatically align the lines as show above.
   *
   * @param command Command to print manual page for. Its `command.name()` will be used as noted above.
   * @param synopsisLines Lines that briefly show the syntax of the command. See built-in commands for examples.
   * @param descriptionLines Lines that describe the command, what it does and any other remarks.
   * @param optionsLines A Line for each possible option that names it and describes what it does.
   */
  writeManPage(command: ICommand, synopsisLines: JSX.Element[], descriptionLines: JSX.Element[], optionsLines?: JSX.Element[]): void;

  /**
   * An event for mounting of the Terminal React component.
   *
   * @remarks
   * Only once the terminal is mounted it is ready to receive and display lines from Gash.
   * This is ideal for any welcome or introductory messages to the player.
   *
   * @param callback Callback function that will be invoked once the terminal has been mounted.
   */
  onTerminalMounted(callback: () => void): void;
}

/**
 * Main entry point to the Gash library
 */
export const Gash:IGash = GashImpl;

/** Optional React properties of the terminal */
export interface TerminalProps {
  /** Properties of the terminal's prompt, see `PromptProps` */
  prompt?: PromptProps
  /** Properties of the terminal's cursor, see `CursorProps` */
  cursor?: CursorProps
}

/**
 * Main React component of the Gash library representing a terminal.
 *
 * @remarks
 * By default it is already styled including taking up the whole window.
 * The styling is using Inconsolata Google font which is not packed with Gash. You can add it to your project, for example, with the following css link:
 * `@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap');`
 */
export function Terminal(props: TerminalProps) {
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
      <Input prompt={props.prompt} cursor={props.cursor}/>
      <TerminalScroller />
    </div>
  );
}