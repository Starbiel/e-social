import { Link, Route, Routes } from "react-router-dom";
import ExtratorPage from "./features/extrator/screens/ExtratorPage";
import AboutScreen from "./features/about/screen/AboutScreen";

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> |<Link to="/sobre">Sobre</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ExtratorPage />} />
        <Route path="/sobre" element={<AboutScreen />} />
      </Routes>
    </>
  );
}

export default App;
