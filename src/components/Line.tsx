import React from "react";
import { grey600, white0 } from "./Colored";

export interface LineProps {
  /**
   * Changes the default content color to be grey. Used by Gash for non-game related message such as man pages.
   */
  systemMessage?: boolean,
  /**
   * Optionally align the content by adding space at the beginning of it. Each space is 15px wide.
   */
  tabs?: number,
  children?: React.ReactNode,
}

/**
 * Component that formats a single line of output. It is recommended to wrap each `Gash.writeLine` content with this component.
 */
export function Line(props: LineProps) {
  const {children, systemMessage, tabs} = props;
  let styles:React.CSSProperties = {
    marginTop: '3px',
    marginBottom: '3px',
    color: (systemMessage !== undefined && systemMessage) ? grey600 : white0,
  };

  if (tabs !== undefined) {
    styles = {...styles, marginLeft: `${tabs*15}px`};
  }

  if (children === undefined) {
    styles = {...styles, minHeight: '20px'};
  }

  return (
    <div style={styles}>{children}</div>
  );
}