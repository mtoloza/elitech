// src/pages/EditTeamMember.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../components/ui/Button";
import { API_URL } from "@/config";

export default function EditTeamMember() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/team/${id}`)
      .then((res) => res.json())
      .then(setMember)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/team/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    })
      .then(() => navigate("/dashboard/team"))
      .catch(setError);
  };

  if (loading) return <p>{t("loading")}</p>;
  if (error) return <p className="text-red-600">{t("error")}</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("team.editTitle")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={member.name || ""}
          onChange={handleChange}
          placeholder={t("team.form.name")}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="position"
          value={member.position || ""}
          onChange={handleChange}
          placeholder={t("team.form.position")}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="email"
          value={member.email || ""}
          onChange={handleChange}
          placeholder={t("team.form.email")}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="phone"
          value={member.phone || ""}
          onChange={handleChange}
          placeholder={t("team.form.phone")}
          className="w-full border px-4 py-2 rounded"
        />
        <Button type="submit" variant="primary">
          {t("team.form.save")}
        </Button>
      </form>
    </div>
  );
}
