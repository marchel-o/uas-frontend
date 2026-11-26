'use client'

import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

export default function Login(){
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

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

      setSuccess(true);

      router.push("/main/dashboard");
      router.refresh();

      return;
    } catch {
      setError("Gagal terhubung ke server");
    } finally{
      if(!success) setLoading(false);
    }
  };

  return(
    <div className="flex flex-col">
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
            className={`bg-[var(--primary)] rounded-md text-[var(--text-light)] p-1 ${loading || success ? "cursor-not-allowed pointer-events-none opacity-80" : "cursor-pointer"}`}
            type="submit"
            disabled={loading || success}
          >
            Login
          </button>
        </form>
      </div>

      <p className="text-red-500 mt-2 text-center">{error}</p>
    </div>
  )
}