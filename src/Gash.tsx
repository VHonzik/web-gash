// import { Colored, cyan600 } from "./components/Colored";
// import { AutoCompleteTextParam, CommandAutoCompleter, CommandBodyLikeParse, CommandParser, TextParameter } from "./Parsers";
// import ICommand, { AutoCompleteResult, AutoCompleteResultType, ParsingFailureReason, ParsingResult } from "./ICommand";
// import { Emitter, Unsubscribe } from "./Events";
// import IKeyword, { IKeywordGroup } from "./IKeyword";
// import { Line } from "./components/Line";
// import React, { useEffect, useRef, useState } from "react";
// import { GashImpl, Input, Output, TerminalScroller } from "./GashImp";

import ICommand from "./ICommand";
import IKeyword, { IKeywordGroup } from "./IKeyword";
import React from "react";
import { CursorProps, GashImpl, Input, Output, PromptProps, TerminalScroller } from "./GashImp";

/**
 * Main entry point to Gash library.
 */
export interface IGash {
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
 * The styling is using Inconsolata Google font which is not packed with Gash. You can add it to your project for example with the following css link:
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