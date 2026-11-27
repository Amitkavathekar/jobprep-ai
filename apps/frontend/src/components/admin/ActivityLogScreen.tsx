"use client";

import React, { useState } from "react";
import { ActivityLogItem } from "../../types";
import {
  SearchInput,
  FilterDropdown,
  StatusBadge,
  EmptyState,
  Pagination,
} from "@/components/common";

interface ActivityLogScreenProps {
  logs: ActivityLogItem[];
}

export default function ActivityLogScreen({ logs = [] }: ActivityLogScreenProps) {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const uniqueTypes = ["All", "Pricing", "User Action", "Coupon", "Settings", "Content"];

  const filteredLogs = logs.filter((log) => {
    const matchesType = selectedTypeFilter === "All" || log.type === selectedTypeFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "white" }}>
          📜 System & Admin Activity Audit Log
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
          Comprehensive real-time history of configuration changes, pricing updates, user suspensions, and coupon operations
        </p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchInput
            placeholder="Search activity log..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
          />
        </div>

        <FilterDropdown
          label="Category:"
          value={selectedTypeFilter}
          onChange={(val) => {
            setSelectedTypeFilter(val);
            setCurrentPage(1);
          }}
          options={uniqueTypes}
        />
      </div>

      {/* Activity Table */}
      <div className="glass-card" style={{ padding: 22 }}>
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No activity logs found"
            description="Try clearing your search query or filter selection"
          />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                    <th style={{ padding: 12 }}>Admin User</th>
                    <th style={{ padding: 12 }}>Action Description</th>
                    <th style={{ padding: 12 }}>Target Object</th>
                    <th style={{ padding: 12 }}>Category</th>
                    <th style={{ padding: 12 }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: 12 }}>
                        <div style={{ fontWeight: 700, color: "white" }}>{log.adminName}</div>
                      </td>
                      <td style={{ padding: 12, color: "#e2e8f0", fontWeight: 600 }}>{log.action}</td>
                      <td style={{ padding: 12, fontFamily: "JetBrains Mono", color: "#06b6d4", fontSize: 12 }}>
                        {log.target}
                      </td>
                      <td style={{ padding: 12 }}>
                        <StatusBadge
                          status={log.type}
                          style={{ padding: "2px 8px", fontSize: 10, borderRadius: 4 }}
                        />
                      </td>
                      <td style={{ padding: 12, color: "#64748b", fontSize: 12, fontFamily: "JetBrains Mono" }}>
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLogs.length}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
