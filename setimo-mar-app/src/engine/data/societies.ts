// Porte de SM_SOCIETIES (scripts/setimo-mar/data-societies.js)
// 7º MAR — Sociedades Secretas
// nota: "curado" — conteúdo condensado a partir do vault de campanha
// (Faccoes/*.md), revisar contra o livro-base antes de publicar.
import type { SocietyDef } from "../types";

export const SOCIETIES: Record<string, SocietyDef> = {
  irmandadeCosta: {
    label: "Irmandade da Costa",
    quer: "Pilhagem, ouro e o direito de viver sem coroa — uma república pirata regida pelo Estatuto: votos igualitários e partilha justa do butim.",
    favorGanha: "Entregar um bom saque à partilha (2); salvar uma tripulação irmã (4); afundar um caça-piratas (6).",
    favorGasta: "Passagem segura por águas piratas (1); uma tripulação para um trabalho (3); abrigo numa ilha-base (5).",
    nota: "curado",
  },
  kreuzritter: {
    label: "Die Kreuzritter",
    quer: "Caçar os Horrores até o último e guardar a maior reserva de dracheneisen de Théah longe de quem o usaria para o mal.",
    favorGanha: "Matar um Horror confirmado (2); recuperar dracheneisen roubado (4); destruir um ninho/pacto de monstros (6).",
    favorGasta: "Uma arma de dracheneisen emprestada (1); o saber deles sobre um Horror específico (3); o apoio de um cavaleiro-caçador (5).",
    nota: "curado",
  },
  exploradores: {
    label: "Sociedade dos Exploradores",
    quer: "Desenterrar, estudar e catalogar os artefatos syrne antes que se percam — ou que a Igreja os queime.",
    favorGanha: "Trazer um artefato intacto (2); mapear uma ruína nova (4); resgatar uma expedição perdida (6).",
    favorGasta: "Um mapa/tradução syrne (1); equipamento e mulas de expedição (3); acesso a um artefato guardado (5).",
    nota: "curado",
  },
  colegioInvisivel: {
    label: "Colégio Invisível",
    quer: "Preservar e avançar o conhecimento — astronomia, medicina, engenharia — apesar da censura vaticinista, e salvar sábios marcados como hereges.",
    favorGanha: "Entregar uma descoberta perigosa (2); esconder um sábio caçado (4); roubar um processo inquisitorial (6).",
    favorGasta: "Uma resposta científica/um mapa proibido (1); um esconderijo (3); forjar credenciais/uma identidade nova (5).",
    nota: "curado",
  },
  rosaCruz: {
    label: "Cavaleiros da Rosa e Cruz",
    quer: "Fazer o bem visível: proteger inocentes, punir tiranos, provar pela ação que a honra ainda importa.",
    favorGanha: "Um ato heroico testemunhado (2); salvar um irmão de armas (4); expor um nobre corrupto (6).",
    favorGasta: "Apoio de um cavaleiro numa causa (1); armas e cavalos (3); a intervenção pública da ordem (5).",
    nota: "curado",
  },
  vagabundos: {
    label: "Los Vagabundos",
    quer: "Defender a Castilha ferida — o povo esmagado pela invasão e pela Inquisição — com justiça teatral por trás de uma das cinco máscaras.",
    favorGanha: "Salvar um alvo da injustiça (2); humilhar publicamente um tirano (4); proteger a linhagem real legítima (6).",
    favorGasta: "Uma das cinco máscaras por uma noite (1); uma rede de simpatizantes (3); o sumiço de alguém para longe do perigo (5).",
    nota: "curado",
  },
  mociutesSkara: {
    label: "Močiutės Skara",
    quer: "Aliviar o sofrimento causado pelas guerras de Théah — refugiados, órfãos, feridos — e, quando possível, impedir a próxima guerra.",
    favorGanha: "Salvar/abrigar refugiados (2); impedir um massacre (4); sabotar um instrumento de guerra (6).",
    favorGasta: "Cuidados médicos e abrigo (1); passagem segura por uma zona de conflito (3); uma rede de socorro discreta (5).",
    nota: "curado",
  },
  rilasciare: {
    label: "Os Rilasciare",
    quer: "\"Nada de Deuses, Nada de Reis\" — libertar Théah das Duas Grandes Tiranias: a monarquia e a Igreja.",
    favorGanha: "Espalhar uma ideia perigosa (2); sabotar um instrumento de tirania (4); expor um segredo de um rei ou bispo (6).",
    favorGasta: "Um panfleto/uma verdade proibida (1); uma célula que abre uma porta (3); um golpe coordenado (5).",
    nota: "curado",
  },
  filhasSophia: {
    label: "Filhas de Sophia",
    quer: "Libertar mulheres da dupla tirania do patriarcado vodacce e da Inquisição — resgatando sortílegas e ensinando a ler.",
    favorGanha: "Esconder uma sortílega caçada (2); tirar uma menina de um casamento-prisão (4); roubar uma lista da Inquisição (6).",
    favorGasta: "Uma rota de fuga (1); uma cortesã bem-posicionada como contato (3); a ajuda de uma strega leal (5).",
    nota: "curado",
  },
  novusOrdo: {
    label: "Novus Ordo Mundi",
    quer: "A Mão Oculta: sete catedráticos que já derrubaram um império sem erguer um exército. Entra-se assassinando um membro atual.",
    favorGanha: "—",
    favorGasta: "—",
    nota: "curado — heróis não podem se filiar.",
    heroisNao: true,
  },
};
