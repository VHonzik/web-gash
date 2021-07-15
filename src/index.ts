export { Terminal } from "./Gash";
export type { TerminalProps, CursorProps, PromptProps } from './Gash';
export * from "./components/Line";

export { Colored, CommandColored, } from "./components/Colored";
export { brown600, cyan600, deepOrange600, deepPurple400, green600, grey200, grey600, indigo400, lightBlue600, red600, yellow600, white0, black900 } from "./components/Colored";
export type { ColoredProps } from "./components/Colored";
export { AutoCompleteResultType, ParsingFailureReason } from './ICommand';
export type { default as ICommand, AutoCompleteResult, ParsingResult} from './ICommand';
export type { default as IKeyword, IKeywordGroup} from './IKeyword';
export * from './Parsers';

import { Gash } from './Gash';
export default Gash;