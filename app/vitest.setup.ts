import "@testing-library/jest-dom/vitest";

// Nota: Testes que chamam ações da store diretamente (fora de fireEvent/eventos
// React) devem envolver essas chamadas em `act()` (de "@testing-library/react")
// para que o React 18 sincronize o commit do re-render antes da asserção
// seguinte. Uma tentativa anterior de interceptar isso globalmente aqui
// (reatribuindo `useFicha.subscribe`) não funcionava: zustand's `useStore`
// fecha sobre o objeto `api` interno (`api.subscribe`) capturado na criação da
// store via `Object.assign(useBoundStore, api)` — reatribuir a propriedade
// `useFicha.subscribe` depois só troca uma cópia solta, nunca o `api.subscribe`
// que o hook React realmente usa. Por isso a correção é por teste, com `act()`.
