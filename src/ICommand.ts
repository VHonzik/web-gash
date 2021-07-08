export enum AutoCompleteResultType {
  /** The input already fully matches the attempted solution. */
  AlreadyMatching,
  /** The input can be auto-completed and there is only on choice. */
  SingleMatchFound,
  /** The input can be auto-completed but there are multiple options. */
  MultipleMatchesFound,
  /** The input does not match the attempted solution. */
  NotMatching
}

/** Result of the auto-completion. */
export interface AutoCompleteResult {
  /** Type of the result. */
  type: AutoCompleteResultType,
  /** Contains the furthest match between the input and the attempted solution. */
  fixedValue: string
}

/**
 * Reason for a parsing failure.
 */
 export enum ParsingFailureReason {
  /** The input line does not correspond to the command. */
  WrongCommand,
  /** A mandatory parameter missing in the input line for this command. */
  MissingParam,
  /** The input line contains an option unknown by the command. */
  UnrecognizedOption
}

/**
 * Result of parsing player's input line by a command.
 */
export interface ParsingResult {
  /** Whether the parsing was successfully. */
  success: boolean,
  /** If `success` is `false` the reason for the failure */
  failureReason?: ParsingFailureReason,
  /** Name of the command that matches the input line. */
  command?: string,
}


/**
 * Interface which defines a command.
 *
 * @remarks
 * Commands are the main way player interacts with Gash game.
 * Commands must be register with `Gash.registerCommand` in order to be recognized by Gash.
 */
export default interface ICommand {
  /**
   * Name of the command as used to call it.
   *
   * @remarks
   * It has to be one word, no white-spaces. Lowercase is preferred.
   *
   * @returns Name of the command
   */
  name: string;

  /**
   * Triggered when player commits a new input line.
   *
   * @remarks
   * Used to determine whether the input line matches this command and execute it.
   * Commands must return `ParsingResult.success` as `false` if the input line does not match their syntax.
   * If the line matches the syntax, i.e. parsing was successful, the command should execute its functionality in the parse function.
   * It is recommended to use `CommandParser` to implement this function.
   *
   * @param line Line player submitted.
   *
   * @returns Result of the parsing, see `ParsingResult`.
   */
  parse(line: string): ParsingResult;

  /**
   * Triggered when player attempts to auto-complete a line.
   *
   * @remarks
   * Used to auto-complete an input line that is starting to match this command or its parameters or options.
   * It is recommended to use `CommandAutoCompleter` to implement this function.
   *
   * @param line Line the player is attempting to auto-complete.
   *
   * @returns Result of the auto-completion, see `AutoCompleteResult`.
   */
  autocomplete(line: string): AutoCompleteResult;

  /**
   * Triggered when player calls built-in `man` command on this command.
   *
   * @remarks
   * It is expected to print a manual page describing the command and how to use it.
   * It is recommended to use `writeManPage` function to implement this method.
   */
  printManPage(): void;

  /**
   * Triggered when player calls built-in `list` command.
   *
   * @remarks
   * If this function returns `true` this command will be included in the list of commands.
   * Result of this call can depend on the current game state.
   *
   * @returns Whether the command should be listed
   */
  available(): boolean;
}