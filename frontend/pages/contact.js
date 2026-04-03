import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("✅ Thank you! We will contact you soon.");

    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white pt-[100px]">

      <div className="w-[420px] bg-white/5 backdrop-blur-lg border border-white/15 rounded-xl p-10 text-center">

        <h2 className="text-2xl font-semibold">Contact Us</h2>

        <p className="text-gray-400 mb-5">
          We would love to hear from you
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          <input
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none"
            placeholder="Full Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none"
            placeholder="Email Address"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 outline-none"
            placeholder="Phone Number"
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value)}
          />

          <textarea
            className="p-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-400 min-h-[80px] outline-none"
            placeholder="Address"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          />

          <button
            type="submit"
            className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 font-semibold hover:opacity-90 transition"
          >
            Submit
          </button>

        </form>

        {message && (
          <p className="mt-3 text-green-500">{message}</p>
        )}

      </div>

    </div>
  );
}