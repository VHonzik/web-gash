import { Colored, green600, red600 } from "./components/Colored";
import { Gash } from "./Gash";
import { Line } from "./components/Line";

function InstructionsLine(): JSX.Element {
  return (
    <Line systemMessage>Navigate with <i>Up/Down Arrows</i>. Select with <i>Spacebar</i>. Confirm with <i>Enter</i>. Cancel with <i>q</i>.</Line>
  );
}

function ErrorPickCountLine(props: {selected: number, wanted: number}): JSX.Element {
  const picked = props.selected > 1 ? <span>selected {props.selected}</span> : <span>not selected any</span>;
  return (
    <Line><Colored foreground={red600}>You have {picked} values but you need to select {props.wanted} value{props.wanted > 1 ? 's' : ''}.</Colored></Line>
  );
}

function Indicator(props: { active?: boolean }): JSX.Element {
  const content: React.ReactNode = props.active ? '>' : '\u00a0';
  return (
    <span style={{ width: '20px', float: 'left' }}>{content}</span>
  )
}

function RadioButton(props: { selected?: boolean }): JSX.Element {
  return (
    <span style={{ width: '20px', float: 'left' }}>{props.selected ? '\u2043' : '\u2022'}</span>
  );
}

function ListElementLine(props: { active?: boolean, selected?: boolean, children?: React.ReactNode}): JSX.Element {
  let content = <span><RadioButton selected={props.selected} />{props.children}</span>;
  if (props.selected) {
    content = <Colored foreground={green600}>{content}</Colored>;
  }
  return (
    <Line><Indicator active={props.active}/>{content}</Line>
  )
}

class ChoicesInput {
  private promiseResolve: (result: number[]) => void = () => { throw Error('Unassigned promise resolve in ListInput.') };
  private promiseReject: () => void = () => { throw Error('Unassigned promise reject in ListInput.') };

  private selectedIndexes: number[] = [];
  private activeIndex: number = 0;
  private choicesCount: number = 0;
  private tempLineChoicesStartOffset: number = 3;

  public constructor(private choicesComponents: React.ReactNodeArray, private selectCount: number, private promptLine: JSX.Element) {
    this.choicesCount = choicesComponents.length;
  }

  public pick(): Promise<number[]> {
    this.init();

    return new Promise((resolve, reject) => {
      this.promiseReject = reject;
      this.promiseResolve = resolve;
    });
  }

  private modulateIndex(index: number): number {
    return ((index % this.choicesCount ) + this.choicesCount ) % this.choicesCount;
  }

  private keyPress(event: KeyboardEvent): boolean {
    const { key } = event;
    if (key === 'q') {
      this.onCanceled();
      return true;
    } else if (key === ' ') {
      this.onSelected();
      return true;
    } else if (key === 'Enter') {
      this.onConfirmed();
      return true;
    } else if (key === 'ArrowDown' && this.choicesCount > 0) {
      this.onMoved(this.activeIndex + 1);
      return true;
    } else if (key === 'ArrowUp' && this.choicesCount > 0) {
      this.onMoved(this.activeIndex - 1);
    }

    return false;
  }

  private init() {
    Gash.clearTempLines();
    Gash.disableInput();
    Gash.routeInput((event: KeyboardEvent) => this.keyPress(event));

    Gash.writeTempLine(this.promptLine, 0);
    Gash.writeTempLine(<InstructionsLine />, 1);

    for (let i = 0; i < this.choicesCount; i++) {
      this.renderChoice(i);
    }

    this.activeIndex = 0;
  }

  private cleanUp() {
    Gash.clearTempLines();
    Gash.removeInputRouting();
    Gash.enableInput();
  }

  private resetError() {
    Gash.writeTempLine(<Line />, this.choicesCount + this.tempLineChoicesStartOffset);
  }

  private onSelected(): void {
    const foundIndex = this.selectedIndexes.indexOf(this.activeIndex);
    if (foundIndex >= 0) {
      this.selectedIndexes.splice(foundIndex, 1);
    } else {
      this.selectedIndexes.push(this.activeIndex);
    }
    this.renderChoice(this.activeIndex);
    this.resetError();
  }

  private onConfirmed(): void {
    if (this.selectCount === 1 && this.selectedIndexes.length === 0) {
      this.onSelected();
    }
    if (this.selectedIndexes.length === this.selectCount) {
      this.selectedIndexes.sort();
      this.cleanUp();
      this.promiseResolve(this.selectedIndexes);
    } else {
      Gash.writeTempLine(<ErrorPickCountLine wanted={this.selectCount} selected={this.selectedIndexes.length} />, this.choicesCount + this.tempLineChoicesStartOffset);
    }
  }

  private onCanceled(): void {
    this.cleanUp();
    this.promiseReject();
  }

  private renderChoice(index: number) {
    if (index < this.choicesCount) {
      Gash.writeTempLine(
        <ListElementLine active={index === this.activeIndex} selected={this.selectedIndexes.includes(index)}>
          {this.choicesComponents[index]}
        </ListElementLine>,
      this.tempLineChoicesStartOffset+index);
    }
  }

  private onMoved(wantedIndex: number) {
    const prevIndex = this.activeIndex;
    this.activeIndex = this.modulateIndex(wantedIndex);
    this.renderChoice(prevIndex);
    this.renderChoice(this.activeIndex);
    this.resetError();
  }
}

/**
 * Creates an input "dialogue" for the player to pick a single option from multiple choices and asynchronously returns the picked choice index.
 * 
 * @remarks
 * Player terminal input will be disabled, i.e. `Gash.disableInput`, and routed to the dialogue via `Gash.routeInput`.
 * The dialogue displays each choice on a new line. Normally choices are prefixed by dot but currently selected choices are colored green and prefixed by dash. Additionally a cursor is displayed on the currently active choice with '>' symbol.
 * The dialogue includes passed prompt line, controls instruction line, choices lines and optionally an error message line in that order.
 * Player can navigate the dialogue with up and down arrows, select a choice with Spacebar, confirm the selection with Enter or cancel the dialogue with 'q'.
 * Additionally player can quickly select and confirm an option if no options are selected with Enter.
 * Once the player has picked an option all temporary lines are cleared, input routing is removed and terminal input is enabled again.
 * 
 * @param elements React nodes that represent the choices that player can pick from. Must have length of at least 1.
 * @param promptLine Line to display at the top of the dialogue. Should describe what is the player picking.
 * @returns Promise that will resolve with a zero-based index of the choice that the player picked or rejects if the player cancelled the dialogue.
 */
export function RadioInput(elements: React.ReactNodeArray, promptLine: JSX.Element): Promise<number> {
  return new Promise((resolve, reject) => {
    const choiceInput = new ChoicesInput(elements, 1, promptLine);
    choiceInput.pick().then((pickedIndexes) => {
      resolve(pickedIndexes[0]);
    }, () => {
      reject();
    });
  });
}

/**
 * Creates an input "dialogue" for the player to pick a single option from multiple choices and asynchronously returns the picked choice.
 * 
 * @remarks 
 * A convenience generic wrapper around RadioInput that returns datum instead of an index.
 * This is useful when player has to choose between game entities, often `IKeyword` instances and the game then acts on the picked entity.
 * Only the `elementsComponents` are passed to the `RadioInput` and therefore rendered to the screen. On the other hand, `elements` are only used when resolving the promise.
 * 
 * @param elements Choices that player is picking from. Must have the same length as `elementsComponents`. Must have length of at least 1.
 * @param elementsComponents React nodes that represent the choices that player can pick from. Must have the same length as `elements`.
 * @param promptLine Line to display at the top of the dialogue. Should describe what is the player picking.
 * @returns Promise that will resolve with the choice that the player picked (one of the `elements`) or rejects if the player cancelled the dialogue.
 */
export function RadioDataInput<DataType>(elements: Array<DataType>, elementsComponents: React.ReactNodeArray, promptLine: JSX.Element): Promise<DataType> {
  return new Promise((resolve, reject) => {
    RadioInput(elementsComponents, promptLine).then((index) => {
      if (index >= 0 && index < elements.length) {
        resolve(elements[index]);
      }
    }, () => {
      reject();
    });
  });
}

/**
 * Creates an input "dialogue" for the player to pick N options from multiple choices and asynchronously returns the picked choices indexes.
 * 
 * @remarks
 * Player terminal input will be disabled, i.e. `Gash.disableInput`, and routed to the dialogue via `Gash.routeInput`.
 * The dialogue displays each choice on a new line. Normally choices are prefixed by dot but currently selected choices are colored green and prefixed by dash. Additionally a cursor is displayed on the currently active choice with '>' symbol.
 * The dialogue includes passed prompt line, controls instruction line, choices lines and optionally an error message line in that order.
 * Player can navigate the dialogue with up and down arrows, select a choice with Spacebar, confirm the selection with Enter or cancel the dialogue with 'q'.
 * Once the player has picked N options all temporary lines are cleared, input routing is removed and terminal input is enabled again.
 * For a single option dialogue, i.e. `wantedCount === 1` consider using `RadioInput`.
 * 
 * @param choicesComponents React nodes that represent the choices that player can pick from. Must have length of at least 1.
 * @param wantedCount How many options must the player select to be able to confirm and exit the dialogue. Must be at least 1, ideally 2.
 * @param promptLine Line to display at the top of the dialogue. Should describe what is the player picking.
 * @returns Promise that will resolve with a zero-based indexes of the choices that the player picked of `wantedCount` length or rejects if the player cancelled the dialogue.
 */
export function ListInput(choicesComponents: React.ReactNodeArray, wantedCount: number, promptLine: JSX.Element): Promise<number[]> {
  return new ChoicesInput(choicesComponents, wantedCount, promptLine).pick();
}

/**
 * Creates an input "dialogue" for the player to pick N options from multiple choices and asynchronously returns the picked choices.
 * 
 * @remarks 
 * A convenience generic wrapper around ListInput that returns data instead of indexes.
 * This is useful when player has to choose between game entities, often `IKeyword` instances and the game then acts on the picked entities.
 * Only the `elementsComponents` are passed to the `RadioInput` and therefore rendered to the screen. On the other hand, `elements` are only used when resolving the promise.
 * 
 * @param elements Choices that player is picking from. Must have the same length as `elementsComponents`. Must have length of at least 1.
 * @param elementsComponents React nodes that represent the choices that player can pick from. Must have the same length as `elements`.
 * @param wantedCount How many options must the player select to be able to confirm and exit the dialogue. Must be at least 1, ideally 2.
 * @param promptLine Line to display at the top of the dialogue. Should describe what is the player picking.
 * @returns Promise that will resolve with the choices that the player picked (one of the `elements`) or rejects if the player cancelled the dialogue.
 */
export function ListDataInput<DataType>(elements: Array<DataType>, elementsComponents: React.ReactNodeArray, wantedCount: number, promptLine: JSX.Element): Promise<DataType[]> {
  return new Promise((resolve, reject) => {
    ListInput(elementsComponents, wantedCount, promptLine).then((indexes) => {
      const result: DataType[] = [];
      for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i];
        if (index >= 0 && index < elements.length) {
          result.push(elements[index]);
        }
      }
      resolve(result);
    }, () => {
      reject();
    });
  });
}