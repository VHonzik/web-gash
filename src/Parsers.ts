import { C, N, Response, Streams, VoidParser } from "@masala/parser";
import ICommand, { AutoCompleteResult, AutoCompleteResultType, ParsingFailureReason, ParsingResult } from "./ICommand";
import IKeyword from "./IKeyword";

/**
 * Result of `LowLevelParser.parse`
 */
export interface LowLevelResult extends ParsingResult {
  /** Index into the parsed input of how far the parser has advanced - exclusive. */
  position: number,
  /** Command parameters that were parsed out of the input so far. */
  params: Array<string>,
  /** Command options that were parsed out of the input so far. */
  options: Array<string>,
  /** Used by command options LowLevelParser */
  optionNotFound?: boolean
}

const blank = () => C.charIn(' \t');
const blanksOpDrop: () => VoidParser = () => blank().optrep().drop();
const blankThenBlanksOpDrop: () => VoidParser = () => (blank().then(blank().optrep())).drop();
const optionSymbol = () => C.char('-');
const letterOrBlank = () => (C.letter().or(C.charIn(' \t')));
const letterOrDash = () => (C.letter().or(C.char('-')));

function commandBody() {
  return blanksOpDrop().then(C.letters()).first();
}

function words() {
  return C.letter().then(letterOrBlank().optrep()).map(values => values.join(''));
}

function textParameter() {
  return blankThenBlanksOpDrop().then(words()).first();
}

function singleWordTextParameter() {
  return blankThenBlanksOpDrop().then(C.letters()).first();
}

function numberParameter() {
  return blankThenBlanksOpDrop().then(N.number()).single();
}

function shortOption() {
  const prefix = (blank().then(blank().optrep()).then(optionSymbol())).drop();
  return prefix.then(C.letter().rep()).map(options => options.array());
}

function longOption() {
  const prefix = (blank().then(blank().optrep()).then(optionSymbol()).then(optionSymbol())).drop();
  return prefix.then(C.letter()).then(letterOrDash().optrep()).map(values => values.join(''));
}

/**
 * Low level parser interface for parser combinators.
 *
 * @remarks
 * Unless you need to implement your own parser it is recommended to use the provided `TextParameter`, `SingleWordTextParameter`, `NumberParameter` that return this interface.
 */
export interface LowLevelParser {
  /**
   * Parse the input
   * @param input Input string to be parsed
   * @param initialResult Result of previous parser or dummy initial result if this parser is first or only parser
   * @param index Optional index into `input` that the parser should start parsing from - inclusive
   */
  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult;

  /**
   * Method allowing sequence chaining of parsers and therefore creating parser combinators.
   *
   * @remarks
   * If `this` parser succeeds the `ac` parser will be called on the remainder.
   * Easily implemented using `SequenceParser` for example with this one liner: `return new SequenceParser(this, p);`
   *
   * @param ac The low level parser that should follow `this` parser.
   */
  then(p: LowLevelParser): LowLevelParser;

  /**
   * Method allowing choice chaining of parsers and therefore creating parser combinators.
   *
   * @remarks
   * If `this` parser succeeds the `ac` parser will be called on the remainder.
   * Easily implemented using `OrParser` for example with this one liner: `return new OrParser(this, p);`
   *
   * @param ac The low level parser that should be called instead of `this` parser if `this` parser fails.
   */
  or(p: LowLevelParser): LowLevelParser;
  /**
   * Method allowing conditional chaining of parsers and therefore creating parser combinators.
   *
   * @remarks
   * If `this` parser fails the parsing will return to the previous parser last position and continue in the chain.
   * Easily implemented using `OptionalParser` for example with this one liner: `return new OptionalParser(this);`
   *
   * @param ac The low level parser that wraps `this` parser and catches failures.
   */
  optional(): LowLevelParser;

  /**
   * Method allowing repetition chaining of parsers and therefore creating parser combinators.
   *
   * @remarks
   * If `this` parser succeeds it will be called recursively on the remainder until it fails.
   * Easily implemented using `RepetitionParser` for example with this one liner: `return new RepetitionParser(this);`
   *
   * @param ac The low level parser that repeats `this` parser.
   */
  repeat(): LowLevelParser;
}

/**
 * Low level parser for implementing `LowLevelParser.then`.
 *
 * @remarks
 * Unless you need to implement your own `LowLevelParser` you shouldn't need to use this class directly.
 */
export class SequenceParser implements LowLevelParser {
  constructor(private first: LowLevelParser, private second: LowLevelParser) {
  }

  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const firstResult = this.first.parse(input, initialResult, index);
    if (!firstResult.success) {
      return firstResult;
    } else {
      return this.second.parse(input, firstResult, firstResult.position);
    }
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

/**
 * Low level parser for implementing `LowLevelParser.or`.
 *
 * @remarks
 * Unless you need to implement your own `LowLevelParser` you shouldn't need to use this class directly.
 */
export class OrParser implements LowLevelParser {
  constructor(private first: LowLevelParser, private second: LowLevelParser) {
  }

  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const firstResult = this.first.parse(input, initialResult, index);
    if (firstResult.success) {
      return firstResult;
    } else {
      return this.second.parse(input, initialResult, index);
    }
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

/**
 * Low level parser for implementing `LowLevelParser.optional`.
 *
 * @remarks
 * Unless you need to implement your own `LowLevelParser` you shouldn't need to use this class directly.
 */
export class OptionalParser implements LowLevelParser {
  constructor(private parser: LowLevelParser) {
  }

  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const result = this.parser.parse(input, initialResult, index);
    if (result.success) {
      return result;
    } else {
      return initialResult;
    }
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

/**
 * Low level parser for implementing `LowLevelParser.repeat`.
 *
 * @remarks
 * Unless you need to implement your own `LowLevelParser` you shouldn't need to use this class directly.
 */
export class RepetitionParser implements LowLevelParser {
  constructor(private parser: LowLevelParser) {
  }

  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    return this.parseRecurse(input, initialResult, index);
  }

  parseRecurse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const result = this.parser.parse(input, initialResult, index);
    if (result.success) {
      return this.parseRecurse(input, result, result.position);
    } else {
      return initialResult;
    }
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

class CommandBodyParser implements LowLevelParser {
  constructor(private command: ICommand) {
  }

  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = commandBody().parse(Streams.ofString(trimmedInput));
    if (masalaOutput.isAccepted() && masalaOutput.value.toLowerCase() === this.command.name.toLowerCase()) {
      const result = {...initialResult};
      result.command = this.command.name;
      result.success = true;
      result.position = initialResult.position + masalaOutput.location();
      return result;
    } else {
      const result = {...initialResult};
      result.command = this.command.name;
      result.success = false;
      result.failureReason = ParsingFailureReason.WrongCommand;
      result.position = initialResult.position + masalaOutput.location();
      return result;
    }
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

class SingleWordTextParameterParser implements LowLevelParser {
  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = singleWordTextParameter().parse(Streams.ofString(trimmedInput));
    const result = {...initialResult};
    result.success = masalaOutput.isAccepted();
    if (result.success) {
      result.params = [...initialResult.params, masalaOutput.value];
    } else {
      result.failureReason = ParsingFailureReason.MissingParam;
    }
    result.position = initialResult.position +  masalaOutput.location();
    return result;
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}


class TextParameterParser implements LowLevelParser {
  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = textParameter().parse(Streams.ofString(trimmedInput));
    const result = {...initialResult};
    result.success = masalaOutput.isAccepted();
    if (result.success) {
      result.params = [...initialResult.params, masalaOutput.value];
    } else {
      result.failureReason = ParsingFailureReason.MissingParam;
    }
    result.position = initialResult.position +  masalaOutput.location();
    return result;
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

class NumberParameterParser implements LowLevelParser {
  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = numberParameter().parse(Streams.ofString(trimmedInput));
     const result = {...initialResult};
    result.success = masalaOutput.isAccepted();
    if (result.success) {
      result.params = [...initialResult.params, masalaOutput.value.toString()];
    } else {
      result.failureReason = ParsingFailureReason.MissingParam;
    }
    result.position = initialResult.position + masalaOutput.location();
    return result;
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

class OptionsParser implements LowLevelParser {
  constructor(private options?: OptionDefinition[]) {
  }

  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const result = this.recurseParse(input, initialResult, index);
    if (!result.success && result.optionNotFound) {
      const modifiedResult = {...result};
      modifiedResult.success = true;
      modifiedResult.failureReason = undefined;
      return modifiedResult;
    }
    return result;
  }

  isOptionValid(option: string): boolean {
    if (this.options !== undefined) {
      return (this.options.some((optionDefinition) => optionDefinition.long === option || optionDefinition.short === option));
    } else {
      return false;
    }
  }

  unrecognizedOptionResult(initialResult: LowLevelResult): LowLevelResult {
    const result = {...initialResult};
    result.success = false;
    result.failureReason = ParsingFailureReason.UnrecognizedOption;
    return result;
  }

  optionNotFoundResult(initialResult: LowLevelResult): LowLevelResult {
    const result = {...initialResult};
    result.success = false;
    result.optionNotFound = true;
    return result;
  }

  checkShortOptionMasalaOutput(initialResult: LowLevelResult, masalaOutput:Response<string[]>): LowLevelResult {
    for (const parsedOption of masalaOutput.value) {
      if (!this.isOptionValid(parsedOption)) {
        return this.unrecognizedOptionResult(initialResult);
      }
    }

    const result = {...initialResult};
    result.success = true;
    result.options = [...initialResult.options, ...masalaOutput.value];
    result.position = initialResult.position +  masalaOutput.location();
    return result;
  }

  checkLongOptionMasalaOutput(initialResult: LowLevelResult, masalaOutput: Response<string>): LowLevelResult {
    if (!this.isOptionValid(masalaOutput.value)) {
      return this.unrecognizedOptionResult(initialResult);
    }

    const result = {...initialResult};
    result.success = true;
    result.options = [...initialResult.options, masalaOutput.value];
    result.position = initialResult.position +  masalaOutput.location();
    return result;
  }

  checkResultAndRecurse(input: string, result: LowLevelResult): LowLevelResult {
    if (result.success) {
      return this.recurseParse(input, result, result.position);
    } else {
      return result;
    }
  }

  recurseParse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;

    const shortMasalaOutput = shortOption().parse(Streams.ofString(trimmedInput));
    if (shortMasalaOutput.isAccepted()) {
      return this.checkResultAndRecurse(input, this.checkShortOptionMasalaOutput(initialResult, shortMasalaOutput));
    } else {
      const longMasalaOutput = longOption().parse(Streams.ofString(trimmedInput));
      if (longMasalaOutput.isAccepted()) {
        return this.checkResultAndRecurse(input, this.checkLongOptionMasalaOutput(initialResult, longMasalaOutput));
      } else {
        return this.optionNotFoundResult(initialResult)
      }
    }
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return this;
  }

  repeat(): LowLevelParser {
    return this;
  }
}

class CommandBodyLikeParser implements LowLevelParser {
  parse(input: string, initialResult: LowLevelResult, index?: number): LowLevelResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = commandBody().parse(Streams.ofString(trimmedInput));
    const result = {...initialResult};
    result.success = masalaOutput.isAccepted();
    if (result.success) {
      result.command = masalaOutput.value;
    }
    result.position = initialResult.position +  masalaOutput.location();
    return result;
  }

  then(p: LowLevelParser): LowLevelParser {
    return new SequenceParser(this, p);
  }

  or(p: LowLevelParser): LowLevelParser {
    return new OrParser(this, p);
  }

  optional(): LowLevelParser {
    return new OptionalParser(this);
  }

  repeat(): LowLevelParser {
    return new RepetitionParser(this);
  }
}

function CommandBody(command: ICommand) { return new CommandBodyParser(command); }
function Options(options?: OptionDefinition[]) { return new OptionsParser(options); };

/**
 * Helper function to parse an input line for a command body.
 *
 * @remarks
 * Used internally by Gash to extract a command name in a case of unrecognized command input line.
 */
export function CommandBodyLikeParse(input: string): CommandParserResult { return new CommandBodyLikeParser().parse(input, initialLowLevelResult, 0); }

/**
 * Low-level parser that can be used to parse a text parameter of a command.
 *
 * @remarks
 * Parsers multiple words as a single parameter.
 *
 * @returns `LowLevelParser` that can be used in `CommandParser` as `paramsParser` parameter or as a part of a chain of `LowLevelParser`s in there.
 */
export function TextParameter(): LowLevelParser { return new TextParameterParser(); }

/**
 * Low-level parser that can be used to parse a text parameter of a command.
 *
 * @remarks
 * Only parses single word parameters - no spaces.
 *
 * @returns `LowLevelParser` that can be used in `CommandParser` as `paramsParser` parameter or as a part of a chain of `LowLevelParser`s in there.
 */
export function SingleWordTextParameter(): LowLevelParser { return new SingleWordTextParameterParser(); }

/**
 * Low-level parser that can be used to parse a number parameter of a command.
 *
 * @returns `LowLevelParser` that can be used in `CommandParser` as `paramsParser` parameter or as a part of a chain of `LowLevelParser`s in there.
 */
export function NumberParameter() { return new NumberParameterParser(); }

const initialLowLevelResult: LowLevelResult = {
  command: undefined,
  options: [],
  params: [],
  position: 0,
  success: true,
}

/**
 * Result of `ICommandParser.parse`.
 *
 * @remarks
 * Extends `ParsingResult` that `ICommand.parse` expects to provide parsed parameters and options to be used by the command implementation.
 */
export interface CommandParserResult extends ParsingResult {
  /** Parameters that were parsed out of the input using the `paramsParser` parser combinator passed to `CommandParser`. */
  params: Array<string>,
  /** Options that were parsed out of the input using the `options` definitions passed to `CommandParser`. */
  options: Array<string>,
}

/**
 * Definition of an option to a command.
 */
export interface OptionDefinition {
  /** Optional short version of the option. Must be one letter, preferably a lower-case. */
  short?: string,
  /** Optional long version of the option. Must be a word or multiple words connected by dash, preferably a lower-case. */
  long?: string
}

/**
 * Interface for the return of CommandParser.
 */
export interface ICommandParser {
  /**
   * Attempts to parse an input line string.
   *
   * @remarks
   * Should be used to implement `ICommand.parse` including passing through the return value.
   *
   * @param input Input line string to be parsed coming from `ICommand.parse` parameter `line`.
   * @returns See `CommandParserResult`
   */
  parse(input: string): CommandParserResult;
}

class CommandHighLevelParser {
  constructor(private command: ICommand, private paramsParser?: LowLevelParser, private options?: OptionDefinition[]) {
  }

  parse(input: string): CommandParserResult {
    let lowLevelParser: LowLevelParser = CommandBody(this.command);
    if (this.options !== undefined) {
      lowLevelParser = lowLevelParser.then(Options(this.options));
    }
    if (this.paramsParser !== undefined) {
      lowLevelParser = lowLevelParser.then(this.paramsParser);
    }
    const lowLevelResult = lowLevelParser.parse(input, initialLowLevelResult);
    return lowLevelResult;
  }
}

/**
 * Creates a parser that can parse a command, its options and parameters.
 *
 * @remarks
 * Drastically reduces complexity of implementing `ICommand.parse`.
 *
 * @param command Command that the parser is for. `ICommand.name` will be use auto-complete the command body.
 * @param paramsParser Optional one or chain of `LowLevelParser` that will parse the command parameters.
 * @param options Definitions of options the command accepts. Options are always optional but unrecognized option will fail the parsing.
 * @returns Interface that contains `parse` method that should be called on `line` input of `ICommand.parse`.
 */
export function CommandParser(command: ICommand, paramsParser?: LowLevelParser, options?: OptionDefinition[]): ICommandParser  { return new CommandHighLevelParser(command, paramsParser, options); }

/**
 * Helper function to check whether a result of parsing a command includes an option.
 * @param result Result of `ICommandParser.parse` to check for option presence.
 * @param option Short or long option string
 * @returns Whether the result contains the option `true` or not `false`.
 */
export function parserResultHasOption(result: CommandParserResult, option: string): boolean {
  return result.options.some(foundOption => option === foundOption);
}

/**
 * Result of `LowLevelAutoCompleter.autocomplete`
 */
export interface LowLevelAutoCompleteResult {
  /** Type of the result, see `AutoCompleteResultType` */
  type: AutoCompleteResultType,
  /** Index into the input string representing how far the auto-completer managed to advance. The input line is usually `String.slice(position)`-ed from the result of the previous auto-completer as an input for the current auto-completer. */
  position: number,
  /** Contains the furthest match between the input and the attempted auto-completion. */
  fixedValue: string,
  /** Used by implementation of command options LowLevelAutoCompleter. */
  optionNotFound?: boolean,
}

const initialAutoCompleteResult: LowLevelAutoCompleteResult = {
  type: AutoCompleteResultType.AlreadyMatching,
  position: 0,
  fixedValue: '',
  optionNotFound: false,
}

/**
 * Low level parser interface for auto-completion parser combinators.
 *
 * @remarks
 * Unless you need to implement your own parser it is recommended to use the provided `AutoCompleteTextParam`, `AutoCompleteKeywords` and `AutoCompleteNumber` that return this interface.
 */
export interface LowLevelAutoCompleter {
  /**
   * Auto-complete the input
   * @param input Input string to be auto-completed
   * @param initialResult Result of the previous parser or dummy result if this parser is the first or only parser.
   * @param index Optional index into input that the auto-completion should start from - inclusive.
   */
  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number) : LowLevelAutoCompleteResult;

  /**
   * Method allowing sequence chaining of parsers and therefore creating parser combinators.
   *
   * @remarks
   * If `this` parser succeeds the `ac` parser will be called on the remainder.
   * Easily implemented using `SequenceAutoCompleter` for example with this one liner: `return new SequenceAutoCompleter(this, ac);`
   *
   * @param ac The low level parser that should follow `this` parser.
   */
  then(ac: LowLevelAutoCompleter) : LowLevelAutoCompleter;

  /**
   * Method allowing choice chaining of parsers and therefore creating parser combinators.
   *
   * @remarks
   * If `this` parser fails the `ac` parser will be called the current input instead.
   * Easily implemented using `OrAutoCompleter` for example with this one liner: `return new OrAutoCompleter(this, ac);`
   *
   * @param ac
   */
  or(ac: LowLevelAutoCompleter) : LowLevelAutoCompleter;
}

/**
 * Low level parser for implementing `LowLevelAutoCompleter.then`.
 *
 * @remarks
 * Unless you need to implement your own `LowLevelAutoCompleter` you shouldn't need to use this class directly.
 */
export class SequenceAutoCompleter implements LowLevelAutoCompleter {
  constructor(private first: LowLevelAutoCompleter, private second: LowLevelAutoCompleter) {
  }
  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const firstResult = this.first.autocomplete(input, initialResult, index);
    if (firstResult.type === AutoCompleteResultType.AlreadyMatching) {
      const secondResult = this.second.autocomplete(input, firstResult, firstResult.position);
      return secondResult;
    }
    return firstResult;
  }
  then(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new SequenceAutoCompleter(this, ac);
  }
  or(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new OrAutoCompleter(this, ac);
  }
}

/**
 * Low level parser for implementing `LowLevelAutoCompleter.or`.
 *
 * @remarks
 * Unless you need to implement your own `LowLevelAutoCompleter` you shouldn't need to use this class directly.
 */
export class OrAutoCompleter implements LowLevelAutoCompleter {
  constructor(private first: LowLevelAutoCompleter, private second: LowLevelAutoCompleter) {
  }
  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const firstResult = this.first.autocomplete(input, initialResult, index);
    if (firstResult.type === AutoCompleteResultType.NotMatching) {
      const secondResult = this.second.autocomplete(input, firstResult, firstResult.position);
      return secondResult;
    }
    return firstResult;
  }
  then(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new SequenceAutoCompleter(this, ac);
  }
  or(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new OrAutoCompleter(this, ac);
  }
}

class CommandBodyAutoCompleter implements LowLevelAutoCompleter {
  constructor(private command: ICommand) {
  }

  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = commandBody().parse(Streams.ofString(trimmedInput));
    const result = {...initialResult};
    if (masalaOutput.isAccepted()) {
      const masalaValueLC = masalaOutput.value.toLowerCase();
      const commandNameLC = this.command.name.toLowerCase();
      if (masalaValueLC === commandNameLC) {
        result.type = AutoCompleteResultType.AlreadyMatching;
        result.fixedValue += this.command.name;
        result.position = initialResult.position + masalaOutput.location();
      } else if (commandNameLC.substring(0, masalaValueLC.length) === masalaValueLC) {
        result.type = AutoCompleteResultType.SingleMatchFound;
        result.fixedValue += this.command.name;
      } else {
        result.type = AutoCompleteResultType.NotMatching;
      }
    } else {
      result.type = AutoCompleteResultType.NotMatching;
    }

    return result;
  }

  then(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new SequenceAutoCompleter(this, ac);
  }
  or(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new OrAutoCompleter(this, ac);
  }
}

class TextParamAutoCompleter implements LowLevelAutoCompleter {
  constructor(private words: Array<string>) {
  }

  private getCommonPrefix(partialMatches: Array<string>): string {
    let charShared = (index: number) => partialMatches.map(partialMatch => partialMatch[index]).every((character, _, array) => character.toLowerCase() === array[0].toLowerCase());
    let sharedLength = 0;
    for (; charShared(sharedLength); sharedLength++) {
    }
    if (sharedLength > 0) {
      return partialMatches[0].slice(0, sharedLength);
    } else {
      return '';
    }
  }

  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = textParameter().parse(Streams.ofString(trimmedInput));
    const result = {...initialResult};
    const exactMatches: string[] = [];
    const partialMatches: string[] = [];
    if (masalaOutput.isAccepted()) {
      const masalaValueLC = masalaOutput.value.toLowerCase();
      for (const word of this.words) {
        const wordLC = word.toLowerCase();
        if (masalaValueLC === wordLC) {
          exactMatches.push(word);
        } else if (wordLC.substring(0, masalaValueLC.length) === masalaValueLC) {
          partialMatches.push(word);
        }
      }

      if (exactMatches.length > 0) {
        result.type = AutoCompleteResultType.AlreadyMatching;
        result.fixedValue += ' ' + exactMatches[0];
        result.position = initialResult.position + masalaOutput.location();
      } else if (partialMatches.length === 1) {
        result.type = AutoCompleteResultType.SingleMatchFound;
        result.fixedValue += ' ' + partialMatches[0];
      } else if (partialMatches.length > 1) {
        result.type = AutoCompleteResultType.MultipleMatchesFound;
        result.fixedValue += ' ' + this.getCommonPrefix(partialMatches);
      } else {
        result.type = AutoCompleteResultType.NotMatching;
      }
    } else {
      result.type = AutoCompleteResultType.NotMatching;
    }

    return result;
  }

  then(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new SequenceAutoCompleter(this, ac);
  }
  or(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new OrAutoCompleter(this, ac);
  }
}

class SingleWordTextParamAutoCompleter implements LowLevelAutoCompleter {
  constructor(private words: Array<string>) {
  }

  private getCommonPrefix(partialMatches: Array<string>): string {
    let charShared = (index: number) => partialMatches.map(partialMatch => partialMatch[index]).every((character, _, array) => character.toLowerCase() === array[0].toLowerCase());
    let sharedLength = 0;
    for (; charShared(sharedLength); sharedLength++) {
    }
    if (sharedLength > 0) {
      return partialMatches[0].slice(0, sharedLength);
    } else {
      return '';
    }
  }

  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = singleWordTextParameter().parse(Streams.ofString(trimmedInput));
    const result = {...initialResult};
    const exactMatches: string[] = [];
    const partialMatches: string[] = [];
    if (masalaOutput.isAccepted()) {
      const masalaValueLC = masalaOutput.value.toLowerCase();
      for (const word of this.words) {
        const wordLC = word.toLowerCase();
        if (masalaValueLC === wordLC) {
          exactMatches.push(word);
        } else if (wordLC.substring(0, masalaValueLC.length) === masalaValueLC) {
          partialMatches.push(word);
        }
      }

      if (exactMatches.length > 0) {
        result.type = AutoCompleteResultType.AlreadyMatching;
        result.fixedValue += ' ' + exactMatches[0];
        result.position = initialResult.position + masalaOutput.location();
      } else if (partialMatches.length === 1) {
        result.type = AutoCompleteResultType.SingleMatchFound;
        result.fixedValue += ' ' + partialMatches[0];
      } else if (partialMatches.length > 1) {
        result.type = AutoCompleteResultType.MultipleMatchesFound;
        result.fixedValue += ' ' + this.getCommonPrefix(partialMatches);
      } else {
        result.type = AutoCompleteResultType.NotMatching;
      }
    } else {
      result.type = AutoCompleteResultType.NotMatching;
    }

    return result;
  }

  then(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new SequenceAutoCompleter(this, ac);
  }
  or(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new OrAutoCompleter(this, ac);
  }
}

class NumberParamAutoCompleter implements LowLevelAutoCompleter {
  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const masalaOutput = numberParameter().parse(Streams.ofString(trimmedInput));
    const result = {...initialResult};
    if (masalaOutput.isAccepted()) {
      result.type = AutoCompleteResultType.AlreadyMatching;
      result.fixedValue += ' ' + masalaOutput.value;
      result.position = initialResult.position + masalaOutput.location();
    } else {
      result.type = AutoCompleteResultType.NotMatching;
    }
    return result;
  }
  then(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new SequenceAutoCompleter(this, ac);
  }
  or(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new OrAutoCompleter(this, ac);
  }
}

class OptionsAutoCompleter implements LowLevelAutoCompleter {
  autocomplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const result = this.recurseAutoComplete(input, initialResult, index);
    if (result.type === AutoCompleteResultType.NotMatching && result.optionNotFound) {
      const finalResult = {...result};
      finalResult.type = AutoCompleteResultType.AlreadyMatching;
      return finalResult;
    }
    return result;
  }
  then(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new SequenceAutoCompleter(this, ac);
  }
  or(ac: LowLevelAutoCompleter): LowLevelAutoCompleter {
    return new OrAutoCompleter(this, ac);
  }

  private recurseAutoComplete(input: string, initialResult: LowLevelAutoCompleteResult, index?: number): LowLevelAutoCompleteResult {
    const trimmedInput = index !== undefined ? input.slice(index) : input;
    const shortMasalaOutput = shortOption().parse(Streams.ofString(trimmedInput));
    if (shortMasalaOutput.isAccepted()) {
      const result = {...initialResult};
      result.type = AutoCompleteResultType.AlreadyMatching;
      result.fixedValue += ` -${shortMasalaOutput.value.join('')}`;
      result.position = initialResult.position + shortMasalaOutput.location();
      return this.recurseAutoComplete(input, result,result.position);
    } else {
      const longMasalaOutput = longOption().parse(Streams.ofString(trimmedInput));
      if (longMasalaOutput.isAccepted()) {
        const result = {...initialResult};
        result.type = AutoCompleteResultType.AlreadyMatching;
        result.fixedValue += ` --${longMasalaOutput.value}`;
        result.position = initialResult.position + longMasalaOutput.location();
        return this.recurseAutoComplete(input, result,result.position);
      } else {
        const result = {...initialResult};
        result.type = AutoCompleteResultType.NotMatching;
        result.optionNotFound = true;
        return result;
      }
    }
  }
}

function AutoCompleteCommandBody(command: ICommand): LowLevelAutoCompleter { return new CommandBodyAutoCompleter(command); }
function AutoCompleteOptions(): LowLevelAutoCompleter { return new OptionsAutoCompleter(); }

/**
 * Low level parser that can be used to auto-complete a command's text parameter given an array of possible candidates.
 * @param words Array of words to check each as a possible candidate for auto-completion.
 * @returns `LowLevelAutoCompleter` that can be used in `CommandAutoCompleter` as `paramsAutoCompleter` parameter or as a part of a chain of `LowLevelAutoCompleter`s in there.
 */
export function AutoCompleteTextParam(words: Array<string>): LowLevelAutoCompleter { return new TextParamAutoCompleter(words); }

/**
 * Low level parser that can be used to auto-complete a command's single-word text parameter given an array of possible candidates.
 * @param words Array of words to check each as a possible candidate for auto-completion.
 * @returns `LowLevelAutoCompleter` that can be used in `CommandAutoCompleter` as `paramsAutoCompleter` parameter or as a part of a chain of `LowLevelAutoCompleter`s in there.
 */
export function AutoCompleteSingleWordTextParam(words: Array<string>): LowLevelAutoCompleter { return new SingleWordTextParamAutoCompleter(words); }

/**
 * Low level parser that can be used to auto-complete command text parameter given an array of possible keywords.
 * @param keywords Array of keywords to check each as a possible candidate for auto-completion. `IKeyword.name()` will be used as the target string candidate.
 * @returns `LowLevelAutoCompleter` that can be used in `CommandAutoCompleter` as `paramsAutoCompleter` parameter or as a part of a chain of `LowLevelAutoCompleter`s in there.
 */
export function AutoCompleteKeywords(keywords: Array<IKeyword>): LowLevelAutoCompleter { return new TextParamAutoCompleter(keywords.map(keyword => keyword.name())); }

/**
 * Low level parser that can be used to auto-complete a command's number parameter.
 * @returns `LowLevelAutoCompleter` that can be used in `CommandAutoCompleter` as `paramsAutoCompleter` parameter or as a part of a chain of `LowLevelAutoCompleter`s in there.
 */
export function AutoCompleteNumber(): LowLevelAutoCompleter { return new NumberParamAutoCompleter(); }

/**
 * Interface for the return of CommandAutoCompleter.
 */
export interface ICommandAutoCompleter {
  /**
   * Attempts to auto-complete an input line string.
   *
   * @remarks
   * Should be used to implement `ICommand.autocomplete` including the return value.
   *
   * @param input Input line string to be auto-completed coming from `ICommand.autocomplete` parameter `line`.
   * @returns See `AutoCompleteResult`
   */
  autocomplete(input: string): AutoCompleteResult;
}

class CommandHighLevelAutoCompleter {
  constructor(private command: ICommand, private paramsAutoCompleter?: LowLevelAutoCompleter) {
  }

  autocomplete(input: string): AutoCompleteResult {
    let lowLevelAutoCompleter: LowLevelAutoCompleter = AutoCompleteCommandBody(this.command).then(AutoCompleteOptions());
    if (this.paramsAutoCompleter !== undefined) {
      lowLevelAutoCompleter = lowLevelAutoCompleter.then(this.paramsAutoCompleter);
    }

    const lowLevelResult = lowLevelAutoCompleter.autocomplete(input, initialAutoCompleteResult);
    return lowLevelResult;
  }
}

/**
 * Creates a parser that can auto-complete a command, its options and parameters.
 *
 * @remarks
 * Drastically reduces complexity of implementing `ICommand.autocomplete`.
 * Note that options are basically skipped if already present and ignored if only body is found.
 *
 * @param command Command that the parser is for. `ICommand.name` will be use auto-complete the command body.
 * @param paramsAutoCompleter Optional one or chain of `LowLevelAutoCompleter` that will auto-complete the command parameters.
 * @returns Interface that contains `parse` method that should be called on `line` input of `ICommand.autocomplete`.
 */
export function CommandAutoCompleter(command: ICommand, paramsAutoCompleter?: LowLevelAutoCompleter): ICommandAutoCompleter { return new CommandHighLevelAutoCompleter(command, paramsAutoCompleter); }