import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Teatro from "./pages/Teatro";
import Cine from "./pages/Cine";
import Museo from "./pages/Museo";
import { useAuth } from "./context/AuthContext";

const TABS = ["Inicio", "Teatro", "Cine", "Museo"];

function App() {
  const [activeTab, setActiveTab] = useState("Inicio");
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const { user } = useAuth();

  const renderPage = () => {
    if (!user) {
      if (authMode === "register") {
        return <Register setAuthMode={setAuthMode} />;
      }
      if (activeTab === "Inicio") {
        return <Home />;
      }
      return <Login setAuthMode={setAuthMode} />;
    }

    switch (activeTab) {
      case "Teatro":
        return <Teatro />;
      case "Cine":
        return <Cine />;
      case "Museo":
        return <Museo />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} tabs={user ? TABS : ["Inicio"]} setAuthMode={setAuthMode} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
