import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@/systems/setimo-mar/theme/ThemeProvider";
import { useFicha } from "@/systems/setimo-mar/store/ficha";

beforeEach(() => useFicha.getState().reset());
describe("tema", () => {
  it("aplica data-theme e data-nation no html", () => {
    useFicha.getState().setTheme("dark");
    useFicha.getState().selectNation("vodacce");
    render(<ThemeProvider><div /></ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-nation")).toBe("vodacce");
  });
});
