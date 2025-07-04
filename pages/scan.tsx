'use client';

import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const [scannedCode, setScannedCode] = useState('');
  const [productData, setProductData] = useState<{
    prd_id: string;
    code: string;
    name: string;
    price: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannedCodeRef = useRef('');
  const router = useRouter();

  useEffect(() => {
    const config = { fps: 15, qrbox: 250 };
    const html5QrCode = new Html5Qrcode('reader');
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          if (decodedText !== scannedCodeRef.current) {
            scannedCodeRef.current = decodedText;
            setScannedCode(decodedText);
            await fetchProduct(decodedText);
          }
        },
        (errorMessage) => {
          console.warn('読み取り失敗:', errorMessage);
        }
      )
      .catch((err) => console.error('カメラ開始失敗:', err));

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch((err) => console.warn('停止エラー:', err));
    };
  }, []);

  const fetchProduct = async (code: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${apiBase}/products/${code}`);
      if (!res.ok) throw new Error('未登録');
      const data = await res.json();
      setProductData(data);
      showMessage('スキャンできました！', 'white');
    } catch {
      showMessage('未登録の商品です！', 'red');
      setProductData(null);
      setScannedCode('');
      scannedCodeRef.current = '';
    }
  };

  const showMessage = (text: string, color: string) => {
    setStatusMessage({ text, color });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  const handleAdd = () => {
    if (!productData) return;
    const current = sessionStorage.getItem('scannedItems');
    const items = current ? JSON.parse(current) : [];

    items.push({
      prd_id: productData.prd_id,
      prd_code: productData.code,
      prd_name: productData.name,
      prd_price: productData.price,
    });

    sessionStorage.setItem('scannedItems', JSON.stringify(items));

    setProductData(null);
    setScannedCode('');
    scannedCodeRef.current = '';
  };

  return (
    <main
      style={{
        background: "linear-gradient(to bottom, #d97706, #fcd34d)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto" }}>
        <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          バーコードスキャン
        </h1>

        <div style={{ position: 'relative' }}>
          <div id="reader" style={{ width: '300px', margin: '0 auto' }} />
          {statusMessage && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: statusMessage.color,
                padding: '1rem 2rem',
                borderRadius: '1rem',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                textAlign: 'center',
              }}
            >
              {statusMessage.text}
            </div>
          )}
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <label>バーコード情報</label>
          <input
            type="text"
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            placeholder="バーコードを入力またはスキャン"
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem' }}
          />

          <button
            onClick={() => fetchProduct(scannedCode)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.5rem 1rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              width: '100%',
            }}
          >
            手入力で検索
          </button>

          <label>商品名</label>
          <input
            type="text"
            value={productData?.name ?? ''}
            readOnly
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem' }}
          />
          <label>価格</label>
          <input
            type="text"
            value={productData?.price?.toString() ?? ''}
            readOnly
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem' }}
          />
        </div>
      </div>

      {/* 白背景のボタンエリア */}
      <div
        style={{
          backgroundColor: "white",
          padding: "1rem",
          borderTop: "1px solid #e5e7eb",
          borderRadius: "1rem 1rem 0 0",
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '400px', margin: '0 auto' }}>
          <button
            onClick={handleAdd}
            style={{
              backgroundColor: '#f59e0b',
              border: 'none',
              padding: '0.75rem 1.5rem',
              color: 'white',
              borderRadius: '9999px',
              fontWeight: 'bold',
              flex: '1 1 40%',
              maxWidth: '150px',
            }}
          >
            商品を追加
          </button>
          <button
            onClick={() => router.push('/pos')}
            style={{
              backgroundColor: 'black',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 'bold',
              flex: '1 1 40%',
              maxWidth: '150px',
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </main>
  );
}
