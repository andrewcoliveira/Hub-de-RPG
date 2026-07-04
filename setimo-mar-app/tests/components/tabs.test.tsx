import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import App from "@/App";
import { useFicha } from "@/store/ficha";

beforeEach(() => useFicha.getState().reset());
describe("abas", () => {
  it("aba Feitiçaria aparece só após comprar a Vantagem", () => {
    render(<App />);
    expect(screen.queryByRole("button", { name: /Feitiçaria/i })).toBeNull();
    act(() => {
      useFicha.getState().selectNation("avalon");
      useFicha.getState().toggleAdvantage("feiticaria");
    });
    expect(screen.getByRole("button", { name: /Feitiçaria/i })).toBeTruthy();
  });
});
