// src/pages/TeamMembers.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TeamMemberForm from "../components/TeamMemberForm";
import { useAuth } from "../context/AuthContext";

export default function TeamMembers() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchMembers = async () => {
    const res = await fetch("http://localhost:8000/team");
    const data = await res.json();
    setMembers(data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm(t("team.confirmDelete"));
    if (!confirm) return;
    const res = await fetch(`http://localhost:8000/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t("team.deleted"));
      fetchMembers();
    } else {
      toast.error(t("team.deleteError"));
    }
  };

  const handleEdit = (member) => {
    setSelected(member);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelected(null);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      const url = selected 
        ? `http://localhost:8000/team/${selected.id}`
        : "http://localhost:8000/team";
      
      const method = selected ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el miembro");
      }

      setShowForm(false);
      toast.success(t("team.saved"));
      fetchMembers();
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("team.saveError"));
    }
  };

  const regions = [...new Set(members.map((m) => m.region).filter(Boolean))];
  const roles = [...new Set(members.map((m) => m.role_type).filter(Boolean))];

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.position?.toLowerCase().includes(search.toLowerCase()) ||
      m.location?.toLowerCase().includes(search.toLowerCase()) ||
      m.region?.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter ? m.region === regionFilter : true;
    const matchesRole = roleFilter ? m.role_type === roleFilter : true;
    return matchesSearch && matchesRegion && matchesRole;
  });

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <h2 className="text-2xl font-bold flex-1">{t("team.title")}</h2>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        {user?.role === "admin" && (
          <Button onClick={handleAdd} variant="accent">
            <Plus size={16} className="mr-2" /> {t("team.add")}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id}>
            <div className="mb-2">
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.position}</p>
              <p className="text-xs text-gray-400">
                {member.region} - {member.location}
              </p>
            </div>
            {user?.role === "admin" && (
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(member)} variant="primary">
                  <Pencil size={14} />
                </Button>
                <Button onClick={() => handleDelete(member.id)} variant="danger">
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <TeamMemberForm
              member={selected}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
