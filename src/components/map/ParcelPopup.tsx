"use client";

import { Card, Typography } from "antd";

type Props = {
  id: string;
  status: string;
  area?: number;
  updatedAt?: string;
};

export default function ParcelPopup({ id, status, area, updatedAt }: Props) {
  return (
    <div style={{ minWidth: 220 }}>
      <Card size="small" bordered={false} className="shadow-none">
        <Typography.Text strong>Parcel {id}</Typography.Text>
        <div className="text-xs mt-1">Status: {status}</div>
        {typeof area === "number" && (
          <div className="text-xs">Area: {Math.round(area).toLocaleString()} m²</div>
        )}
        {updatedAt && <div className="text-xs">Updated: {new Date(updatedAt).toLocaleString()}</div>}
      </Card>
    </div>
  );
}
