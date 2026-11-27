"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Coupon } from "@/types";
import CouponModal from "@/components/admin/CouponModal";
import {
  StatCard,
  SearchInput,
  FilterDropdown,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
} from "@/components/common";
import {
  fetchCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
} from "@/services/couponService";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [planFilter, setPlanFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load coupons from backend API (or fallback to local storage)
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchCouponsApi();
        if (mounted) {
          setCoupons(data);
        }
      } catch (err) {
        console.error("Error loading coupons:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (savedCoupon: Coupon) => {
    if (editingCoupon && (editingCoupon.id || editingCoupon.code)) {
      const idToUpdate = editingCoupon.id || editingCoupon.code;
      const updated = await updateCouponApi(idToUpdate, savedCoupon);
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === idToUpdate || c.code === editingCoupon.code ? { ...c, ...updated } : c
        )
      );
      showToast(`Coupon ${savedCoupon.code} updated successfully`);
    } else {
      const created = await createCouponApi(savedCoupon);
      setCoupons((prev) => [created, ...prev.filter((c) => c.code !== created.code)]);
      showToast(`Coupon ${savedCoupon.code} created successfully`);
    }
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }
    const idToDelete = coupon.id || coupon.code;
    await deleteCouponApi(idToDelete);
    setCoupons((prev) => prev.filter((c) => (c.id ? c.id !== idToDelete : c.code !== coupon.code)));
    showToast(`Coupon ${coupon.code} deleted`);
  };

  const handleCopy = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.discountType.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || c.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesPlan =
        planFilter === "All" ||
        c.applicablePlans?.some(
          (p) =>
            p.toLowerCase() === "all plans" ||
            p.toLowerCase() === "all" ||
            p.toLowerCase().includes(planFilter.toLowerCase())
        );

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [coupons, search, statusFilter, planFilter]);

  // Statistics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.status === "Active").length;
  const totalRedemptions = coupons.reduce((acc, c) => acc + (c.timesUsed || 0), 0);
  const expiredCoupons = coupons.filter((c) => c.status === "Expired").length;

  return (
    <div style={{ padding: "28px 32px", minHeight: "100%", background: "#0a0a1a", color: "#f8fafc" }}>
      {/* Toast Notification */}
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
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🏷</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "white" }}>
              Coupon Management
            </h1>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
            Create, configure and manage promotional discount codes for subscription plans.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary"
          style={{
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #ec4899, #7c3aed)",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(236, 72, 153, 0.35)",
            cursor: "pointer",
          }}
        >
          <span>+</span>
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Total Coupons"
          value={totalCoupons}
          subtitle="Promo campaigns"
          color="#ec4899"
        />

        <StatCard
          title="Active Coupons"
          value={activeCoupons}
          subtitle="Ready for redemption"
          color="#34d399"
        />

        <StatCard
          title="Total Redemptions"
          value={totalRedemptions.toLocaleString()}
          subtitle="Applied by users"
          color="#c084fc"
        />

        <StatCard
          title="Expired Coupons"
          value={expiredCoupons}
          subtitle="Past validity date"
          color="#f87171"
        />
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 260, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
            <SearchInput
              placeholder="Search coupon code or type..."
              value={search}
              onChange={setSearch}
            />
          </div>

          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Statuses", value: "All" },
              { label: "Active", value: "Active" },
              { label: "Draft", value: "Draft" },
              { label: "Expired", value: "Expired" },
            ]}
          />

          <FilterDropdown
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              { label: "All Plans", value: "All" },
              { label: "Basic", value: "Basic" },
              { label: "Plus", value: "Plus" },
              { label: "Pro", value: "Pro" },
              { label: "Elite", value: "Elite" },
            ]}
          />
        </div>

        <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "JetBrains Mono" }}>
          Showing {filteredCoupons.length} of {totalCoupons} coupons
        </div>
      </div>

      {/* Coupons Table / Cards */}
      <div
        className="glass-card"
        style={{
          background: "rgba(13, 13, 35, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "#94a3b8",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <th style={{ padding: "14px 18px" }}>Code</th>
                <th style={{ padding: "14px 18px" }}>Discount</th>
                <th style={{ padding: "14px 18px" }}>Applicable Plans</th>
                <th style={{ padding: "14px 18px" }}>Usage (Used / Limit)</th>
                <th style={{ padding: "14px 18px" }}>Expiry Date</th>
                <th style={{ padding: "14px 18px" }}>Status</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center" }}>
                    <LoadingSpinner text="Loading coupons..." minHeight={120} />
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32 }}>
                    <EmptyState
                      icon="🏷"
                      title="No coupons found"
                      description="Click '+ Create Coupon' to add your first coupon code."
                    />
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const usagePercent =
                    coupon.usageLimit && coupon.usageLimit > 0
                      ? Math.min(100, Math.round(((coupon.timesUsed || 0) / coupon.usageLimit) * 100))
                      : 0;

                  const isExpired =
                    coupon.status === "Expired" ||
                    (coupon.expiryDate && new Date(coupon.expiryDate) < new Date());

                  return (
                    <tr
                      key={coupon.id || coupon.code}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.2s",
                      }}
                    >
                      {/* Code */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontFamily: "JetBrains Mono",
                              fontWeight: 700,
                              color: "white",
                              background: "rgba(236, 72, 153, 0.15)",
                              border: "1px solid rgba(236, 72, 153, 0.35)",
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontSize: 13,
                              letterSpacing: "0.05em",
                            }}
                          >
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            title="Copy code"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: copiedCode === coupon.code ? "#34d399" : "#94a3b8",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            {copiedCode === coupon.code ? "✓" : "📋"}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, color: "#f472b6" }}>
                          {coupon.discountType === "Percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} FLAT`}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{coupon.discountType}</div>
                      </td>

                      {/* Applicable Plans */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220 }}>
                          {coupon.applicablePlans && coupon.applicablePlans.length > 0 ? (
                            coupon.applicablePlans.map((plan) => (
                              <span
                                key={plan}
                                style={{
                                  fontSize: 11,
                                  background: "rgba(255, 255, 255, 0.06)",
                                  border: "1px solid rgba(255, 255, 255, 0.12)",
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  color: "#cbd5e1",
                                }}
                              >
                                {plan}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>All Plans</span>
                          )}
                        </div>
                      </td>

                      {/* Usage */}
                      <td style={{ padding: "14px 18px", minWidth: 160 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4, fontFamily: "JetBrains Mono" }}>
                          <span style={{ color: "white", fontWeight: 700 }}>
                            {coupon.timesUsed || 0}
                          </span>
                          <span style={{ color: "#94a3b8" }}>/ {coupon.usageLimit || 500}</span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: 6,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${usagePercent}%`,
                              height: "100%",
                              background:
                                usagePercent > 90
                                  ? "#ef4444"
                                  : usagePercent > 60
                                  ? "#f59e0b"
                                  : "linear-gradient(90deg, #ec4899, #8b5cf6)",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td style={{ padding: "14px 18px", color: isExpired ? "#f87171" : "#cbd5e1", fontFamily: "JetBrains Mono", fontSize: 12 }}>
                        {coupon.expiryDate || coupon.expiresAt || "2026-12-31"}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 18px" }}>
                        <StatusBadge
                          status={coupon.status || "Active"}
                          dot
                          style={{ fontSize: 11, padding: "4px 10px" }}
                        />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              color: "#cbd5e1",
                              padding: "6px 12px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              color: "#f87171",
                              padding: "6px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
        }}
        onSave={handleSaveCoupon}
        initialData={editingCoupon}
      />
    </div>
  );
}
