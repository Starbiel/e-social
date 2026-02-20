import { Link, Route, Routes } from "react-router-dom";
import ExtratorPage from "./features/extrator/screens/ExtratorPage";
import AboutScreen from "./features/about/screen/AboutScreen";

function App() {
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-100"
          >
            <span className="rounded-lg bg-sky-500/15 px-2 py-1 text-xs uppercase tracking-[0.12em] text-sky-300">
              eSocial
            </span>
            Consolidador
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 transition hover:bg-slate-800 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              to="/sobre"
              className="rounded-lg px-3 py-1.5 transition hover:bg-slate-800 hover:text-white"
            >
              Sobre
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/" element={<ExtratorPage />} />
          <Route path="/sobre" element={<AboutScreen />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
