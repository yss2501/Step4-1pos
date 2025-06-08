"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// APIエンドポイントを環境変数から取得
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Product = {
  prd_id: string;
  prd_code: string;
  prd_name: string;
  prd_price: number;
};

type AggregatedProduct = Product & { quantity: number };

export default function POSPage() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const storedItems = sessionStorage.getItem("scannedItems");
    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch (e) {
        console.error("保存された商品情報の解析エラー", e);
      }
    }
  }, []);

  const aggregatedItems: AggregatedProduct[] = [];
  const map = new Map<string, AggregatedProduct>();
  items.forEach((item) => {
    const key = item.prd_id;
    if (map.has(key)) {
      map.get(key)!.quantity += 1;
    } else {
      map.set(key, { ...item, quantity: 1 });
    }
  });
  aggregatedItems.push(...map.values());

  const total = aggregatedItems.reduce(
    (sum, item) => sum + item.prd_price * item.quantity,
    0
  );

  const removeItem = (prd_id: string) => {
    const updated = [...items];
    const index = updated.findIndex((i) => i.prd_id === prd_id);
    if (index !== -1) {
      updated.splice(index, 1);
      setItems(updated);
      sessionStorage.setItem("scannedItems", JSON.stringify(updated));
    }
  };

  const handlePurchase = async () => {
    if (items.length === 0) {
      alert("商品がスキャンされていません");
      return;
    }

    try {
      const payload = {
        emp_cd: "E0001",
        store_cd: "S001",
        pos_no: "POS01",
        items: items.map((item) => ({
          prd_id: item.prd_id,
          prd_code: item.prd_code,
          prd_name: item.prd_name,
          prd_price: item.prd_price,
        })),
      };

      const res = await fetch(`${API_BASE}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("購入処理に失敗しました");

      const data = await res.json();
      alert(
        `ご購入ありがとうございます。\n\n税抜価格: ¥${data.total_amount_ex_tax}\n合計金額（税込）: ¥${data.total_amount}`
      );

      sessionStorage.removeItem("scannedItems");
      setItems([]);
    } catch (e) {
      alert("エラーが発生しました: " + e);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(to bottom, #d97706, #fcd34d)",
      }}
    >
      <div style={{ padding: "1rem 0", textAlign: "center" }}>
        <button
          onClick={() => router.push("/scan")}
          style={{
            backgroundColor: "#f59e0b",
            border: "none",
            padding: "1rem 2.5rem",
            borderRadius: "9999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <img
            src="/pic/29027.png"
            alt="スキャンアイコン"
            style={{ height: "100px", width: "auto" }}
          />
        </button>
      </div>

      <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "1rem", color: "#1f2937", marginBottom: "0.5rem" }}>
          購入リスト
        </h2>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {aggregatedItems.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>商品が登録されていません</div>
          ) : (
            <table style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                  <th>商品名</th>
                  <th>数量</th>
                  <th>単価</th>
                  <th>小計</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {aggregatedItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{item.prd_name}</td>
                    <td>x{item.quantity}</td>
                    <td>¥{item.prd_price}</td>
                    <td>¥{item.prd_price * item.quantity}</td>
                    <td>
                      <button
                        onClick={() => removeItem(item.prd_id)}
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          padding: "0.3rem 0.6rem",
                          borderRadius: "0.3rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: "bold" }}>
                  <td colSpan={3} style={{ textAlign: "right" }}>合計金額</td>
                  <td colSpan={2}>¥{total}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: "white", padding: "1rem", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
          <button
            onClick={handlePurchase}
            style={{
              backgroundColor: "#f59e0b",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.125rem",
              padding: "0.75rem 3rem",
              borderRadius: "9999px",
              border: "none",
            }}
          >
            購入
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <button
            onClick={() => {
              sessionStorage.removeItem("scannedItems");
              setItems([]);
            }}
            style={{
              backgroundColor: "#d1d5db",
              color: "black",
              fontWeight: "bold",
              fontSize: "1.125rem",
              padding: "0.5rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
            }}
          >
            Clear
          </button>
          <button
            onClick={() => router.push("/")}
            style={{
              backgroundColor: "black",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.125rem",
              padding: "0.5rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
            }}
          >
            終了
          </button>
        </div>
      </div>
    </main>
  );
}
