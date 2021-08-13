export { Terminal } from "./Gash";

export { Line } from "./components/Line";
export { BlockTitle } from "./components/BlockTitle";
export { Colored, CommandColored, } from "./components/Colored";
export { brown600, cyan600, deepOrange600, deepPurple400, green600, grey200, grey600, indigo400, lightBlue600, red600, yellow600, white0, black900 } from "./components/Colored";

export type { TerminalProps, CursorProps, PromptProps } from './Gash';
export type { BlockTitleProps } from "./components/BlockTitle";
export type { ColoredProps } from "./components/Colored";
export type { LineProps } from "./components/Line";

export { AutoCompleteResultType, ParsingFailureReason } from './ICommand';
export type { default as ICommand, AutoCompleteResult, ParsingResult} from './ICommand';
export type { default as IKeyword, IKeywordGroup} from './IKeyword';
export * from './ListInput';
export * from './Parsers';

import { Gash } from './Gash';
export default Gash;