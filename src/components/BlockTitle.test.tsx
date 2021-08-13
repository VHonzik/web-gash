import '@testing-library/jest-dom'
import { act, cleanup, render, screen } from "@testing-library/react";
import { BlockTitle } from "./BlockTitle";

describe('BlockTitle', function() {
  it('renders all valid characters', function() {
    const validCharacters: string[] = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (let i = 0; i < validCharacters.length; i++) {
      const character = validCharacters[i];
      act(() => {
        render(<BlockTitle>{character}</BlockTitle>);
      });


      const blockElements = screen.getAllByText(/█/i);
      expect(blockElements.length).toBeGreaterThan(0);
      expect(blockElements[0]).toBeInTheDocument();

      cleanup();
    }
  });
  it('is case insensitive', function() {
    act(() => {
      render(<BlockTitle>a</BlockTitle>);
    });

    const blockElements = screen.getAllByText(/█/i);
    expect(blockElements.length).toBeGreaterThan(0);
    expect(blockElements[0]).toBeInTheDocument();

  });
  it('renders unknown characters as space', function() {
    act(() => {
      render(<BlockTitle>!</BlockTitle>);
    });

    const blockElements = screen.getAllByText(/\u00a0/i, {
      normalizer: (text) => text
    });
    expect(blockElements.length).toBeGreaterThan(0);
    expect(blockElements[0]).toBeInTheDocument();

  });
})