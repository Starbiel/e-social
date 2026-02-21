export default function AboutScreen() {
  return (
    <div className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 text-slate-100 shadow-[0_15px_80px_-45px_rgba(15,23,42,0.8)]">
      <h1 className="text-2xl font-bold">Sobre o projeto</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Este consolidador lê eventos S-1210/S-5002 do eSocial, percorre as tags{" "}
        <code>consolidApurMen</code> usando DOMParser nativo e soma rendimentos,
        INSS e IRRF considerando múltiplos vínculos dentro do mesmo arquivo. O
        objetivo é gerar um JSON limpo e pronto para alimentar planilhas ou
        integrações. Feito por mim, Gabriel, para uso pessoal e compartilhamento
        com a comunidade e meu amorzinho. O código está disponível no Github,
      </p>
    </div>
  );
}
