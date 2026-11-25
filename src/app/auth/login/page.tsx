'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login(){
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      router.push("/main/dashboard");
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server");
    }
  };

  return(
    <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
      <h1 className="font-medium text-2xl">Login</h1>

      <form className="flex flex-col gap-4 mt-4" onSubmit={handleLogin}>         
        <input
          className="border border-gray-300 p-0.5 px-2 rounded-md"
          type="text"
          placeholder="Name"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <input
          className="border border-gray-300 p-0.5 px-2 rounded-md"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button
          className="bg-[var(--primary)] rounded-md text-[var(--text-light)] p-1 cursor-pointer"
          type="submit"
        >
          Login
        </button>
      </form>
      <p>{error}</p>
    </div>
  )
}