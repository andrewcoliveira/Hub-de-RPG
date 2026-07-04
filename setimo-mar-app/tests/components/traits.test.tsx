import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TraitsStep } from "@/views/creation/steps/TraitsStep";
import { useFicha } from "@/store/ficha";

beforeEach(() => useFicha.getState().reset());

describe("TraitsStep", () => {
  it("stepper de atributo respeita orçamento", () => {
    render(<TraitsStep />);
    const linha = screen.getByTestId("trait-vigor");
    const mais = within(linha).getByRole("button", { name: "+" });
    fireEvent.click(mais);
    fireEvent.click(mais);
    expect(within(linha).getByTestId("trait-vigor-val").textContent).toBe("4");
    expect(mais).toBeDisabled();
  });
});
