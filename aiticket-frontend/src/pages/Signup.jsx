import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-zinc-900 to-zinc-950">
      <div className="card w-full max-w-md shadow-2xl p-8 rounded-xl">
        <form onSubmit={handleSignup} className="space-y-6">
          <h2 className="text-3xl font-extrabold text-center text-zinc-300 mb-2">Sign Up</h2>
          <p className="text-center text-gray-500 mb-4">Create your account to get started.</p>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="input input-bordered w-full text-lg"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered w-full text-lg"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="btn bg-slate-300 text-zinc-800 w-full mt-2"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <div className="flex justify-center items-center text-center t-2">
            <span className="text-gray-500">Already have an account?</span>
            <button type="button" className="btn btn-link text-zinc-300 p-1" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
