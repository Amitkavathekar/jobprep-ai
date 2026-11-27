"use client";

import React, { useState, useEffect } from "react";
import { Modal, LoadingSpinner } from "@/components/common";
import {
  fetchAiSettingsApi,
  updateAiFeatureRouteApi,
  registerAiModelApi,
  AiFeatureTypeItem,
  AiProviderItem,
} from "@/services/aiSettingsService";

export default function AiModelsScreen() {
  const [features, setFeatures] = useState<AiFeatureTypeItem[]>([]);
  const [providers, setProviders] = useState<AiProviderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for adding new AI Model
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("GPT-4o");
  const [newProvider, setNewProvider] = useState("OpenAI");
  const [newFeatureType, setNewFeatureType] = useState("Resume Analysis");

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load AI configuration from database on mount
  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await fetchAiSettingsApi();
        if (mounted && data) {
          setFeatures(data.features || []);
          setProviders(data.providers || []);
        }
      } catch (err) {
        console.error("Error loading AI settings from database:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateFeatureModel = async (
    featureId: string,
    modelName: string,
    providerName: string
  ) => {
    // Optimistic UI update
    setFeatures((prev) =>
      prev.map((ft) =>
        ft.aiFeatureTypeId === featureId || ft._id === featureId
          ? { ...ft, current_model: modelName, current_provider: providerName }
          : ft
      )
    );

    try {
      await updateAiFeatureRouteApi(featureId, modelName, providerName);
      showToast("AI Model Router updated in database!");
    } catch (err) {
      console.error("Failed to update AI Router in DB:", err);
      showToast("Failed to save router update to database");
    }
  };

  const handleRegisterModel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerAiModelApi({
        modelName: newModelName,
        provider: newProvider,
        targetFeatureType: newFeatureType,
      });

      // Reload fresh data from database
      const refreshed = await fetchAiSettingsApi();
      if (refreshed) {
        setFeatures(refreshed.features || []);
        setProviders(refreshed.providers || []);
      }

      setIsAddModalOpen(false);
      showToast(`Model "${newModelName}" saved to database successfully!`);
    } catch (err) {
      console.error("Failed to register model in DB:", err);
      showToast("Failed to save new model in database");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: "10px 0 40px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        justifyContent: "center",
        minHeight: "75vh",
      }}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1100,
            background: "rgba(16, 185, 129, 0.9)",
            border: "1px solid #10b981",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          ✓ {toastMsg}
        </div>
      )}

      {/* Screen Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "white",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            🤖 AI Models <span className="gradient-text">Router</span>
          </h2>
          <p
            style={{
              color: "rgba(148, 163, 184, 0.7)",
              fontSize: 13,
              margin: "4px 0 0",
            }}
          >
            Configure and route primary AI models across core application features in real-time, stored directly in database.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            fontSize: 13,
            padding: "10px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #ec4899, #7c3aed)",
            fontWeight: 700,
            boxShadow: "0 4px 15px rgba(236,72,153,0.3)",
            cursor: "pointer",
          }}
        >
          + Register New AI Model
        </button>
      </div>

      {loading && (
        <LoadingSpinner text="Loading AI models from database..." minHeight={160} />
      )}

      {/* FEATURE MODEL ROUTER 2x2 GRID */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 22,
            marginTop: 8,
          }}
        >
          {features.map((ft) => {
            const currentProvObj = providers.find((p) => p.name === ft.current_provider);
            const availableModels = currentProvObj ? currentProvObj.models : [ft.current_model];

            return (
              <div
                key={ft.aiFeatureTypeId || ft._id}
                className="glass glass-hover"
                style={{
                  padding: "24px 26px",
                  borderRadius: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  transition: "all 0.25s ease",
                }}
              >
                {/* Top Section */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: `${ft.color}22`,
                          border: `1px solid ${ft.color}55`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                        }}
                      >
                        {ft.icon}
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "white",
                            margin: 0,
                          }}
                        >
                          {ft.name}
                        </h3>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: "JetBrains Mono",
                            color: ft.color,
                            fontWeight: 600,
                          }}
                        >
                          ai_feature_type
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ● DB Synced
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(148, 163, 184, 0.8)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {ft.description}
                  </p>
                </div>

                {/* Selector Controls Box */}
                <div
                  style={{
                    background: "rgba(7, 7, 26, 0.6)",
                    padding: "16px 18px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        color: "rgba(148,163,184,0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      🏢 Provider:
                    </label>
                    <select
                      value={ft.current_provider}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        const matchingProv = providers.find((p) => p.name === newProv);
                        const firstModel = matchingProv?.models?.[0] || ft.current_model;
                        handleUpdateFeatureModel(
                          ft.aiFeatureTypeId || ft._id || "",
                          firstModel,
                          newProv
                        );
                      }}
                      style={{
                        width: "100%",
                        background: "#0d0d2b",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {providers.map((p) => (
                        <option key={p.providerId || p._id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        color: "rgba(148,163,184,0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      🤖 AI Model:
                    </label>
                    <select
                      value={ft.current_model}
                      onChange={(e) =>
                        handleUpdateFeatureModel(
                          ft.aiFeatureTypeId || ft._id || "",
                          e.target.value,
                          ft.current_provider
                        )
                      }
                      style={{
                        width: "100%",
                        background: "#0d0d2b",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Model Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New AI Model"
        maxWidth={480}
      >
        <form
          onSubmit={handleRegisterModel}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Provider Name:
            </label>
            <input
              type="text"
              required
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              placeholder="e.g. OpenAI, Google, Anthropic"
              className="glass-input"
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 12px",
                fontSize: 13,
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Model Name:
            </label>
            <input
              type="text"
              required
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="e.g. GPT-4o, Gemini 1.5 Pro, Claude 3.5"
              className="glass-input"
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 12px",
                fontSize: 13,
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Target Feature Type (ai_feature_type):
            </label>
            <select
              value={newFeatureType}
              onChange={(e) => setNewFeatureType(e.target.value)}
              style={{
                width: "100%",
                marginTop: 4,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <option value="Resume Analysis">Resume Analysis</option>
              <option value="ATS Scan">ATS Scan</option>
              <option value="Mock Interview">Mock Interview</option>
              <option value="Interview Prep">Interview Prep</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 14,
            }}
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-ghost"
              style={{ padding: "8px 16px", fontSize: 12, borderRadius: 8 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "8px 18px",
                fontSize: 12,
                borderRadius: 8,
                background: "linear-gradient(135deg, #ec4899, #7c3aed)",
              }}
            >
              Save Model to Database
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
