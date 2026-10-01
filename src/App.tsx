// src/App.tsx

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/auth";
import { fetchRooms } from "@/api/roomsApi";
import { fetchAssets } from "@/api/assetsApi";
import { fetchBookings } from "@/api/bookingsApi";
import "./App.css";

import { RoomsCatalog } from "@/pages/RoomsCatalog";
import { BookingsList } from "@/pages/BookingsList";
import { SettingsPage } from "@/pages/SettingsPage";

type TabId = "catalog" | "bookings" | "settings";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("catalog");
  const { user, signIn, signOut } = useAuth();

  // Тестовые функции для входа/выхода
  const handleLogin = () => {
    signIn({
      id: "user-1",
      name: "Студент Калининский",
      email: "student@example.com",
    });
  };

  const handleLogout = () => {
    signOut();
  };

  const renderPage = () => {
    switch (activeTab) {
      case "catalog":
        return <RoomsCatalog />;
      case "bookings":
        return <BookingsList />;
      case "settings":
        return <SettingsPage />;
      default:
        return <RoomsCatalog />;
    }
  };

  return (
    <>
      <Header
        activeNavId={activeTab}
        onNavigate={(id) => setActiveTab(id as TabId)}
        onBellClick={() => alert("Уведомления")}
      />
      <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Блок авторизации (временный, для теста) */}
        <div
          style={{
            padding: "12px 16px",
            background: "#f1f5f9",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            <strong>Статус:</strong>{" "}
            {user ? `Вошёл как ${user.name}` : "Не авторизован"}
          </span>
          {user ? (
            <Button onClick={handleLogout} variant="secondary" size="sm">
              Выйти
            </Button>
          ) : (
            <Button onClick={handleLogin} size="sm">
              Войти (тест)
            </Button>
          )}
        </div>

        {/* Контент страницы */}
        {renderPage()}
      </main>
    </>
  );
}

export default App;