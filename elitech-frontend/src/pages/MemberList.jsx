import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { API_URL } from "@/config";
import { useTranslation } from "react-i18next";

export default function MemberList() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    position: "",
    region: "",
    role_type: ""
  });

  useEffect(() => {
    fetch(`${API_URL}/team`)
      .then((res) => res.json())
      .then(setMembers);
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredMembers = members.filter((m) => {
    return (
      (!filters.name || m.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.position || m.position?.toLowerCase().includes(filters.position.toLowerCase())) &&
      (!filters.region || m.region?.toLowerCase().includes(filters.region.toLowerCase())) &&
      (!filters.role_type || m.role_type?.toLowerCase().includes(filters.role_type.toLowerCase()))
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{t("memberList.title", "Member List")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          name="name"
          placeholder={t("team.name", "Name")}
          value={filters.name}
          onChange={handleFilterChange}
        />
        <Input
          name="position"
          placeholder={t("team.position", "Position")}
          value={filters.position}
          onChange={handleFilterChange}
        />
        <Input
          name="region"
          placeholder={t("team.region", "Region")}
          value={filters.region}
          onChange={handleFilterChange}
        />
        <Input
          name="role_type"
          placeholder={t("team.role", "Role")}
          value={filters.role_type}
          onChange={handleFilterChange}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">{t("team.name", "Name")}</th>
              <th className="py-2 px-4">{t("team.position", "Position")}</th>
              <th className="py-2 px-4">{t("team.region", "Region")}</th>
              <th className="py-2 px-4">{t("team.role", "Role")}</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  {t("memberList.noResults", "No members found.")}
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{m.name}</td>
                  <td className="py-2 px-4">{m.position}</td>
                  <td className="py-2 px-4">{m.region}</td>
                  <td className="py-2 px-4">{m.role_type}</td>
                  <td className="py-2 px-4">{m.email}</td>
                  <td className="py-2 px-4">{m.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 