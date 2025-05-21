import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      key={i18n.language}
      className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    >
      <Card>
        <h2 className="text-xl font-semibold mb-2">{t("home.org.title")}</h2>
        <p className="text-gray-600 mb-4">{t("home.org.description")}</p>
        <Button onClick={() => navigate("/dashboard/orgchart")}>
          {t("home.org.button")}
        </Button>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-2">{t("home.costs.title")}</h2>
        <p className="text-gray-600 mb-4">{t("home.costs.description")}</p>
        <Button onClick={() => navigate("/dashboard/costos")}>
          {t("home.costs.button")}
        </Button>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-2">{t("home.kpis.title")}</h2>
        <p className="text-gray-600 mb-4">{t("home.kpis.description")}</p>
        <Button onClick={() => navigate("/dashboard/kpis")}>
          {t("home.kpis.button")}
        </Button>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-2">Logout</h2>
        <Button onClick={handleLogout} variant="danger">
          {t("sidebar.logout", "Cerrar sesión")}
        </Button>
      </Card>
    </div>
  );
}