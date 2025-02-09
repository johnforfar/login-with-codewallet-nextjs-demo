import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import * as code from "@code-wallet/elements";

function Login() {
  const [login, setLogin] = useState<any>(null);
  const el = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (login && el.current) {
      // Create the Code Wallet login button
      const { button } = code.elements.create("button", {
        mode: "login",
        login: {
          verifier: login.verifier,
          domain: login.domain,
        },
        appearance: "light",
        confirmParams: {
          success: {
            url: `/api/login/success/{{INTENT_ID}}`,
          },
          cancel: {
            url: `/login`,
          },
        },
      });

      if (button) {
        button.on("invoke", async () => {
          const res = await fetch(`/api/login/create-intent`, { method: "GET" });
          const data = await res.json();
          // Update the button with both a new clientSecret and the original login configuration.
          button.update({
            clientSecret: data.clientSecret,
            login: {
              verifier: login.verifier,
              domain: login.domain,
            },
          });
        });
        button.mount(el.current);
      }
    }
  }, [login]);

  async function fetchData() {
    try {
      const response = await fetch(`/api/login`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setLogin(data);
    } catch (error) {
      console.error("Error fetching login data:", error);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#fff",
      }}
    >
      {!login && <div>Loading...</div>}
      {login && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center",
            width: "300px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Image src="/hex-icon.svg" alt="Logo" width={100} height={100} />
          </div>
          <h2>Connect your account</h2>
          <div ref={el}></div>
        </div>
      )}
    </div>
  );
}

export default Login; 