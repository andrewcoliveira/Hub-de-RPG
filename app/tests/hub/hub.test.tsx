import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import HubApp from "@/hub/HubApp";
import { SYSTEMS } from "@/shared/systems";
import { PAGES } from "../../site.config.mjs";

describe("hub", () => {
  it("lista todos os sistemas e ferramentas do registro", () => {
    render(<HubApp />);
    SYSTEMS.forEach((s) => expect(screen.getByRole("heading", { name: s.name })).toBeInTheDocument());
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    SYSTEMS.flatMap((s) => s.tools).forEach((t) => expect(links).toContain(t.href));
  });

  it("toda ferramenta do hub aponta para uma página publicada", () => {
    const published = PAGES.map((p) => p.html);
    SYSTEMS.flatMap((s) => s.tools).forEach((t) => expect(published).toContain(t.href));
  });

  it("filtro esconde ferramentas de outro tipo", () => {
    render(<HubApp />);
    fireEvent.click(screen.getByRole("tab", { name: "Recompensas" }));
    expect(screen.getByRole("link", { name: /Gerador de Recompensas/ })).toBeVisible();
    expect(screen.queryAllByRole("link", { name: /Criador de Fichas/ })).toHaveLength(0);
  });

  it("rolador soma os dados e guarda o histórico", () => {
    vi.useFakeTimers();
    render(<HubApp />);
    fireEvent.click(screen.getByRole("button", { name: "Mais um dado" }));
    fireEvent.click(screen.getByRole("button", { name: "d6" }));
    act(() => { vi.runAllTimers(); });
    vi.useRealTimers();
    const history = screen.getByLabelText("Últimas rolagens");
    expect(history.querySelectorAll("li")).toHaveLength(1);
    expect(history).toHaveTextContent("2d6");
    const total = Number(document.querySelector(".tray-total")!.textContent);
    expect(total).toBeGreaterThanOrEqual(2);
    expect(total).toBeLessThanOrEqual(12);
  });
});
