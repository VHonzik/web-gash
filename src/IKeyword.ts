/**
 * Interface which defines a keyword.
 *
 * @remarks
 * Keywords are mechanics, resources or entities that are important to the gameplay but are not invocable as commands. They are often parameters for command calls.
 * Keywords must be register with `Gash.registerKeyword` in order to be recognized by Gash.
 * Keywords only direct interaction with Gash library is through built-in `man` command but `Parser` methods facilitate easy auto-completion and parsing of keywords during command calls.
 * See `IKeywordGroup` for keyword groups that improve `man` command output even further.
 */
 export default interface IKeyword {
  /**
   * Name of the keyword that will be checked when `man` command is called with a parameter.
   *
   * @returns Name of the keyword
   */
  name(): string;

  /**
   * Triggered when player calls built-in `man` command on this keyword.
   *
   * @remarks
   * It is expected to print a manual page describing this keyword.
   */
  printManPage(): void;
}

/**
 * Interface which defines a keyword group.
 *
 * @remarks
 * Useful approach for defining keywords is a common class that implements the `IKeyword` interface, whose instances will share the functionality, styling and be all registered to Gash. It is common in Gash games to use coloring to draw attention of the player and so naturally all these keywords instance of the common class might share color.
 * This is where keyword group becomes useful as it can tell built-in `man` command such group of keywords exist and when `man` command is called on `man` (`man man`) it can inform player about the existence of all these keywords that can be target of `man` command.
 */
 export interface IKeywordGroup {
  /** Common name of the keyword group that will be displayed in one of the `man man` synopsis lines. */
  placeholderName: string,
  /** CSS color representing the keyword group that will be applied to `placeholderName` as background color n the `man man` synopsis lines and to `colorName` as text color in description lines. */
  color: string,
  /** Name of the `color` that will be displayed in the `man man` description. */
  colorName: string
}