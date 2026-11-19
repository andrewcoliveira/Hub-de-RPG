import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { SheetSummary } from "@/systems/setimo-mar/views/SheetSummary";

beforeEach(() => useFicha.getState().reset());

function montarPersonagemCompleto() {
  useFicha.getState().setConcept("name", "Isabelle du Vagabond");
  useFicha.getState().selectNation("montaigne");
  useFicha.getState().setNationTrait("panache");
  useFicha.getState().toggleBackground("duelista");
  useFicha.getState().toggleBackground("soldado");
  useFicha.getState().adjustSkill("armas", 2);
  useFicha.getState().toggleAdvantage("feiticaria"); // Porté da nação Montaigne
  useFicha.getState().toggleAdvantage("academiaduelista");
  useFicha.getState().setArcana("virtude", "osol");
  useFicha.getState().setArcana("hubris", "odiabo");
  useFicha.getState().setSchool("porte");
  useFicha.getState().toggleSorceryPower("pt_marcar"); // menor
  useFicha.getState().setStyle("valroux");
  useFicha.getState().applyStoryPreset("Vendeta", "Fazer justiça com as próprias mãos contra quem lhe tirou tudo.", "Descobrir quem foi o responsável.");
  useFicha.getState().setSociety("rosaCruz");
  useFicha.getState().addReputacao("Honrado");
  useFicha.getState().addIdioma("Montaigne-Castilhano");
  return useFicha.getState().f;
}

describe("SheetSummary", () => {
  it("inclui os blocos e rotulos reais de uma ficha completa", () => {
    const f = montarPersonagemCompleto();
    render(<SheetSummary f={f} />);

    // Cabeçalho
    expect(screen.getByText("Isabelle du Vagabond")).toBeTruthy();
    expect(screen.getByText("Montaigne")).toBeTruthy();

    // Feitiçaria — escola + poder selecionado
    expect(screen.getByText("Porté")).toBeTruthy();
    expect(screen.getByText("Marcar")).toBeTruthy();

    // Estilo de Duelo
    expect(screen.getByText("Valroux")).toBeTruthy();

    // História — preset Vendeta
    expect(screen.getByText("Vendeta")).toBeTruthy();

    // Sociedade
    expect(screen.getByText("Cavaleiros da Rosa e Cruz")).toBeTruthy();

    // Toques finais — Reputação
    expect(screen.getByText("Honrado")).toBeTruthy();
  });

  it("omite blocos condicionais quando nao ha dado (ficha nova)", () => {
    const f = useFicha.getState().f;
    render(<SheetSummary f={f} />);
    expect(screen.queryByTestId("summary-sorcery")).toBeNull();
    expect(screen.queryByTestId("summary-dueling")).toBeNull();
    expect(screen.queryByTestId("summary-society")).toBeNull();
  });
});
