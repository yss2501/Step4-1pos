import { useState } from "react";

type Product = {
  code: string;
  name: string;
  price: number;
  prd_id: number;
};

type PurchaseItem = {
  prd_id: number;
  prd_code: string;
  prd_name: string;
  prd_price: number;
};

export default function POS() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [popupAmount, setPopupAmount] = useState<number | null>(null);

  const handleReadProduct = async () => {
    try {
      const res = await fetch(`http://localhost:8000/products/${code}`);
      if (!res.ok) throw new Error("商品が見つかりません");
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      alert("商品が見つかりませんでした");
      setProduct(null);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      setCart([...cart, {
        prd_id: product.prd_id,
        prd_code: product.code,
        prd_name: product.name,
        prd_price: product.price,
      }]);
      setProduct(null);
      setCode("");
    }
  };

  const handlePurchase = async () => {
    const payload = {
      emp_cd: "E0001",
      store_cd: "00001",
      pos_no: "001",
      items: cart
    };
    try {
      const res = await fetch("http://localhost:8000/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        setPopupAmount(result.total_amount);
      } else {
        alert(`購入失敗: ${result.detail || JSON.stringify(result)}`);
      }
    } catch (err: any) {
      alert("サーバー接続エラー: " + err.message);
    }
  };

  const groupedCart = Object.values(cart.reduce((acc, item) => {
    if (!acc[item.prd_code]) {
      acc[item.prd_code] = { ...item, count: 1 };
    } else {
      acc[item.prd_code].count += 1;
    }
    return acc;
  }, {} as Record<string, PurchaseItem & { count: number }>));

  const totalAmount = groupedCart.reduce(
    (sum, item) => sum + item.prd_price * item.count,
    0
  );

  const handlePopupClose = () => {
    setCart([]);
    setProduct(null);
    setCode("");
    setPopupAmount(null);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, position: "relative" }}>
      <h1>POS機能Lv1-Demo</h1>
      <input
        type="text"
        placeholder="商品コードを入力"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ width: "35%", marginBottom: 8 }}
      />
      <button onClick={handleReadProduct}>商品コード 読み込み</button>

      {product && (
        <div style={{ marginTop: 16 }}>
          <p>商品名: {product.name}</p>
          <p>単価: {product.price}円</p>
          <button onClick={handleAddToCart}>追加</button>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h2>購入リスト</h2>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            minHeight: "60px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            backgroundColor: "#f9f9f9",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {groupedCart.length === 0 ? (
            <p style={{ color: "#666", margin: 0 }}>
              （購入リストは、空です）
            </p>
          ) : (
            groupedCart.map((item, index) => (
              <div key={index}>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>{item.prd_name}</div>
                <div style={{ fontSize: "14px" }}>
                  単価：{item.prd_price}円 × {item.count}個 ＝ 合計 {item.prd_price * item.count}円
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={handlePurchase} disabled={cart.length === 0}>
            購入する
          </button>
          {cart.length > 0 && (
            <span style={{ marginLeft: 16, fontWeight: "bold", fontSize: "16px" }}>
              合計：{totalAmount}円
            </span>
          )}
        </div>
      </div>

      {popupAmount !== null && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: 30,
            borderRadius: 8,
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            <h2>購入完了！</h2>
            <p>合計金額（税込）：<strong>{popupAmount}円</strong></p>
            <button onClick={handlePopupClose}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
