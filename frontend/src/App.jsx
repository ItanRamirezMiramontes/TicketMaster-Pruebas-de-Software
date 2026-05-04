import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Teatro from "./pages/Teatro";
import Cine from "./pages/Cine";
import Musica from "./pages/Musica";
import Museo from "./pages/Museo";
import Account from "./pages/Account";
import PurchaseModal from "./components/PurchaseModal";
import { useAuth } from "./context/AuthContext";

function App() {
  const [activeTab, setActiveTab] = useState("Inicio");
  const [authMode, setAuthMode] = useState(null);
  const [modalEvent, setModalEvent] = useState(null);
  const [modalType, setModalType] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      setModalEvent(null);
      setModalType(null);
    }
  }, [user]);

  const openModal = (event, type) => {
    setModalEvent(event);
    setModalType(type);
  };

  const closeModal = () => {
    setModalEvent(null);
    setModalType(null);
  };

  const renderPage = () => {
    if (authMode === "login") return <Login setAuthMode={setAuthMode} />;
    if (authMode === "register") return <Register setAuthMode={setAuthMode} />;
    switch (activeTab) {
      case "Teatro": return <Teatro openModal={openModal} />;
      case "Cine": return <Cine openModal={openModal} />;
      case "Musica": return <Musica openModal={openModal} />;
      case "Museo": return <Museo openModal={openModal} />;
      case "Cuenta": return <Account />;
      default: return <Home openModal={openModal} onCategoryClick={(type) => setActiveTab(type === "museo" ? "Museo" : type === "musica" ? "Musica" : type === "teatro" ? "Teatro" : "Cine")} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <Navbar activeTab={activeTab} onNavigate={(tab) => { setActiveTab(tab); setAuthMode(null); }} onLogin={() => setAuthMode("login")} onRegister={() => setAuthMode("register")} onLogout={logout} />
      <main className="pt-16 px-4 pb-16"><div className="mx-auto max-w-7xl">{renderPage()}</div></main>
      {modalEvent && <PurchaseModal event={modalEvent} type={modalType} user={user} onClose={closeModal} onSuccess={closeModal} />}
    </div>
  );
}

export default App;
