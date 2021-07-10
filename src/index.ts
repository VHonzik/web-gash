export { Terminal } from "./Gash";
export * from "./components/Line";
export { Colored, CommandColored } from "./components/Colored";
export type { ColoredProps } from "./components/Colored";
export { AutoCompleteResultType, ParsingFailureReason } from './ICommand';
export type { default as ICommand, AutoCompleteResult, ParsingResult} from './ICommand';
export * from './Parsers';

import { Gash } from './Gash';
export default Gash;