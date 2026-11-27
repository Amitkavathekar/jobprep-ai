"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { LoadingSpinner } from "@/components/common";

interface PermissionDef {
  id: string;
  label: string;
  category: string;
}

interface RoleItem {
  id: string;
  roleId: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem: boolean;
}

export default function AdminRolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionDef[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/roles-permissions");
      if (res.data?.success && res.data.data) {
        const rList = res.data.data.roles || [];
        setRoles(rList);
        setAvailablePermissions(res.data.data.availablePermissions || []);
        if (rList.length > 0 && !selectedRoleId) {
          setSelectedRoleId(rList[0].roleId || rList[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading roles from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedRole = roles.find((r) => (r.roleId || r.id) === selectedRoleId);

  const handleTogglePermission = (permId: string) => {
    if (!selectedRole) return;
    const current = selectedRole.permissions || [];
    const has = current.includes(permId);
    const updated = has ? current.filter((p) => p !== permId) : [...current, permId];

    setRoles((prev) =>
      prev.map((r) =>
        (r.roleId || r.id) === selectedRoleId ? { ...r, permissions: updated } : r
      )
    );
  };

  const handleSaveRole = async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      await api.put(`/admin/roles-permissions/${selectedRole.roleId || selectedRole.id}`, {
        permissions: selectedRole.permissions,
        description: selectedRole.description,
      });
      showToast(`Permissions for "${selectedRole.name}" saved to database!`);
    } catch {
      showToast("Error updating role in database");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: "28px 32px", minHeight: "100%", background: "#0a0a1a", color: "#f8fafc" }}>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "rgba(16, 185, 129, 0.9)",
            color: "white",
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      {/* Screen Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "white" }}>
          🛡️ Roles & <span className="gradient-text">Permissions Matrix</span>
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          Configure RBAC privilege boundaries across administrative roles, synced directly with MongoDB database.
        </p>
      </div>

      {loading && (
        <LoadingSpinner
          text="Loading roles and permissions from MongoDB..."
          minHeight={160}
        />
      )}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
          {/* Roles Navigation Sidebar */}
          <div
            className="glass-card"
            style={{
              padding: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              height: "fit-content",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "4px 8px" }}>
              Defined Roles in MongoDB ({roles.length})
            </div>

            {roles.map((r) => {
              const rid = r.roleId || r.id;
              const isSelected = rid === selectedRoleId;
              return (
                <button
                  key={rid}
                  onClick={() => setSelectedRoleId(rid)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: isSelected ? "rgba(236, 72, 153, 0.15)" : "transparent",
                    border: isSelected ? "1px solid #ec4899" : "1px solid transparent",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? "#f472b6" : "white" }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {r.permissions?.length || 0} Permissions Granted
                  </div>
                </button>
              );
            })}
          </div>

          {/* Permissions Matrix Detail */}
          {selectedRole && (
            <div
              className="glass-card"
              style={{
                padding: 24,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "white" }}>
                    {selectedRole.name}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
                    {selectedRole.description}
                  </p>
                </div>

                <button
                  onClick={handleSaveRole}
                  disabled={isSaving}
                  style={{
                    background: "linear-gradient(135deg, #ec4899, #7c3aed)",
                    color: "white",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(236,72,153,0.3)",
                  }}
                >
                  {isSaving ? "Saving to DB..." : "Save Privileges to Database"}
                </button>
              </div>

              {/* Permission Toggles List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {availablePermissions.map((perm) => {
                  const isChecked = selectedRole.permissions?.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: 10,
                        background: isChecked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)",
                        border: isChecked ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: "#ec4899",
                            cursor: "pointer",
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                            {perm.label}
                          </div>
                          <div style={{ fontSize: 10, color: "#a855f7", fontFamily: "JetBrains Mono" }}>
                            key: {perm.id} | scope: {perm.category}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: isChecked ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                          color: isChecked ? "#34d399" : "#64748b",
                        }}
                      >
                        {isChecked ? "Granted" : "Restricted"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
