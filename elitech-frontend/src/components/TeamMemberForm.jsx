// src/components/TeamMemberForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "./ui/Button";
import { API_URL } from "@/config";

export default function TeamMemberForm({ member = {}, onSave, onCancel }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    area: "",
    region: "",
    role_description: "",
    email: "",
    phone: "",
    location: null,
    role_type: null,
    reports_to_id: null,
    role_doc_url: null
  });

  const [allMembers, setAllMembers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar miembros para la lista desplegable
    fetch(`${API_URL}/team`)
      .then((res) => res.json())
      .then((data) => setAllMembers(data))
      .catch((err) => console.error("Error loading team list:", err));
  }, []);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        position: member.position || "",
        area: member.area || "",
        region: member.region || "",
        role_description: member.role_description || "",
        email: member.email || "",
        phone: member.phone || "",
        location: member.location || null,
        role_type: member.role_type || null,
        reports_to_id: member.reports_to_id || null,
        role_doc_url: member.role_doc_url || null
      });
    }
  }, [member]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t("team.form.required");
    if (!formData.position) newErrors.position = t("team.form.required");
    if (!formData.area) newErrors.area = t("team.form.required");
    if (!formData.region) newErrors.region = t("team.form.required");
    if (!formData.role_description) newErrors.role_description = t("team.form.required");
    if (!formData.email) {
      newErrors.email = t("team.form.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("team.form.invalidEmail");
    }
    if (!formData.phone) newErrors.phone = t("team.form.required");
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "reports_to_id" ? (value ? parseInt(value) : null) : value 
    }));
    // Limpiar error cuando el usuario modifica el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Convertir campos vacíos a null antes de enviar
      const dataToSend = Object.entries(formData).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value === "" ? null : value
      }), {});
      onSave(dataToSend);
    }
  };

  const renderField = (key, value) => {
    if (key === "reports_to_id") {
      return (
        <div key={key}>
          <label className="block text-sm font-medium">{t(`team.form.${key}`)}</label>
          <select
            name={key}
            value={value || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">{t("team.form.noSupervisor")}</option>
            {allMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} – {m.position}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (key === "role_doc_url") {
      return (
        <div key={key}>
          <label className="block text-sm font-medium">
            {t(`team.form.${key}`)}
          </label>
          <input
            type="text"
            name={key}
            value={value || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder={t("team.form.roleDocUrlPlaceholder")}
          />
          {value && (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-sm mt-1 block"
            >
              {t("team.form.viewDocument")}
            </a>
          )}
        </div>
      );
    }

    const isRequired = ["name", "position", "area", "region", "role_description", "email", "phone"].includes(key);
    const inputType = key === "email" ? "email" : key === "phone" ? "tel" : "text";

    return (
      <div key={key}>
        <label className="block text-sm font-medium">
          {t(`team.form.${key}`)}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type={inputType}
          name={key}
          value={value || ""}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 ${errors[key] ? 'border-red-500' : ''}`}
          required={isRequired}
        />
        {errors[key] && (
          <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(formData).map(([key, value]) => renderField(key, value))}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("team.form.cancel")}
        </Button>
        <Button type="submit">{t("team.form.save")}</Button>
      </div>
    </form>
  );
}