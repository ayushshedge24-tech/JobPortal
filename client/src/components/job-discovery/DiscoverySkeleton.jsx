import React from "react";
import { Skeleton } from "../ui/Skeleton";

export const DiscoverySkeleton = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            padding: "1.25rem",
            background: "var(--surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "60%" }}>
              <Skeleton height="20px" width="70%" />
              <Skeleton height="14px" width="40%" style={{ marginTop: "6px" }} />
            </div>
            <Skeleton height="24px" width="100px" />
          </div>
          <Skeleton height="16px" width="90%" />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Skeleton height="22px" width="80px" />
            <Skeleton height="22px" width="80px" />
            <Skeleton height="22px" width="80px" />
          </div>
        </div>
      ))}
    </div>
  );
};
