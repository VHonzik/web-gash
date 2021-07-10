import React from "react";

export const brown600 = '#6d4c41';
export const cyan600 = '#00acc1';
export const deepOrange600 = '#f4511e';
export const deepPurple400 = '#7e57c2';
export const green600 = '#43a047';
export const grey200 = '#eeeeee';
export const grey600 = '#757575';
export const indigo400 = '#5c6bc0';
export const lightBlue600 = '#039be5';
export const red600 = '#e53935';
export const yellow600 = '#fdd835';
export const white0 = '#ffffff';

export interface ColoredProps {
  /**
   * Color of the content - foreground - of this component. Implemented using CSS `color` property.
   */
  foreground: string;
  /**
   * Background color of the content of this component. Implemented using CSS `backgroundColor`. If not specified the CSS property is not used.
   */
  background?: string;
  children?: React.ReactNode,
}


/**
 * Simple component that changes color of its content, optionally changing the background color as well.
 */
export function Colored(props: ColoredProps) {
  let {foreground, background, children} = props;

  let style: React.CSSProperties = {
    color: foreground
  }

  if (background !== undefined) {
    style = {
      ...style,
      backgroundColor: background
    }
  }

  return (
    <span style={style}>{children}</span>
  );
}

/**
 * Text styled to look as a built-in commands references
 */
export function CommandColored(props: { children?: React.ReactNode }): JSX.Element {
  return <Colored {...props} foreground={cyan600} />;
}