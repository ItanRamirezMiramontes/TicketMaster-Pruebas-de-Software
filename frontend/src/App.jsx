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
import EventDetail from "./pages/EventDetail";
import PurchaseModal from "./components/PurchaseModal";
import { useAuth } from "./context/AuthContext";
import { EventsProvider } from "./context/EventsContext";

function App() {
  const [activeTab, setActiveTab] = useState("Inicio");
  const [authMode, setAuthMode] = useState(null);
  const [modalEvent, setModalEvent] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [pendingTab, setPendingTab] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      setModalEvent(null);
      setModalType(null);
    }
  }, [user]);

  useEffect(() => {
    if (user && pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  }, [user, pendingTab]);

  const openModal = (event, type) => {
    setModalEvent(event);
    setModalType(type);
  };

  const openDetail = (event, type) => {
    setDetailEvent({ ...event, type });
    setAuthMode(null);
  };

  const closeModal = () => {
    setModalEvent(null);
    setModalType(null);
  };

  const closeDetail = () => {
    setDetailEvent(null);
  };

  const handleNavigate = (tab) => {
    if (tab === "Cuenta" && !user) {
      setAuthMode("login");
      setPendingTab("Cuenta");
      return;
    }
    setActiveTab(tab);
    setAuthMode(null);
    setDetailEvent(null);
  };

  const renderPage = () => {
    if (authMode === "login") return <Login setAuthMode={setAuthMode} />;
    if (authMode === "register") return <Register setAuthMode={setAuthMode} />;
    if (detailEvent) return <EventDetail event={detailEvent} type={detailEvent.type} onBack={closeDetail} openModal={openModal} />;

    switch (activeTab) {
      case "Teatro": return <Teatro openModal={openModal} onDetailClick={openDetail} />;
      case "Cine": return <Cine openModal={openModal} onDetailClick={openDetail} />;
      case "Musica": return <Musica openModal={openModal} onDetailClick={openDetail} />;
      case "Museo": return <Museo openModal={openModal} onDetailClick={openDetail} />;
      case "Cuenta": return <Account />;
      default:
        return <Home openModal={openModal} onDetailClick={openDetail} onCategoryClick={(type) => setActiveTab(type === "museo" ? "Museo" : type === "musica" ? "Musica" : type === "teatro" ? "Teatro" : "Cine")} />;
    }
  };

  return (
    <EventsProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
        <Navbar activeTab={activeTab} onNavigate={handleNavigate} onLogin={() => setAuthMode("login")} onRegister={() => setAuthMode("register")} onLogout={logout} />
        <main className="pt-16 px-4 pb-16"><div className="mx-auto max-w-7xl">{renderPage()}</div></main>
        {modalEvent && <PurchaseModal event={modalEvent} type={modalType} user={user} onClose={closeModal} onSuccess={closeModal} />}
      </div>
    </EventsProvider>
  );
}

export default App;
