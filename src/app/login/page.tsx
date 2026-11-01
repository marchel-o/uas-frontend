'use client'

import { redirect } from "next/navigation"
import { Background } from "../components/Background"

export default function Login(){
  const handleLogin = (e: React.SubmitEvent) => {
    e.preventDefault();
    redirect("/dashboard");
  }

  return(
    <>
      <Background />

      <section className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
          <h1 className="font-medium text-2xl">Login</h1>

          <form className="flex flex-col gap-4 mt-4" onSubmit={handleLogin}>         
            <input
              className="border border-gray-300 p-0.5 px-2 rounded-md"
              type="text"
              placeholder="Name"
              defaultValue="admin"
            />
            <input
              className="border border-gray-300 p-0.5 px-2 rounded-md"
              type="password"
              placeholder="Password"
              defaultValue="123"
            />

            <button
              className="bg-[var(--primary)] rounded-md text-[var(--text-light)] p-1"
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </section>
    </>
  )
}