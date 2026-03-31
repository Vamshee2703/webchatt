import { useState } from "react";
export default function Contact() {
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [phone,setPhone] = useState("");
  const [address,setAddress] = useState("");
  const [message,setMessage] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("✅ Thank you! We will contact you soon.");
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
  };
  return (
    <div className="page">
      <div className="contact-card">
        <h2>Contact Us</h2>
        <p className="subtitle">
          We would love to hear from you
        </p>
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Full Name"
            value={name}
            required
            onChange={(e)=>setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            required
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            placeholder="Phone Number"
            value={phone}
            required
            onChange={(e)=>setPhone(e.target.value)}
          />
          <textarea
            placeholder="Address"
            value={address}
            required
            onChange={(e)=>setAddress(e.target.value)}
          />
          <button type="submit">
            Submit
          </button>
        </form>
        {message && <p className="success">{message}</p>}
      </div>
      <style jsx>{`
        .page{
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#020617;
          color:white;
          padding-top:100px;
        }
        .contact-card{
          width:420px;
          background:rgba(255,255,255,0.06);
          backdrop-filter:blur(18px);
          border:1px solid rgba(255,255,255,0.15);
          border-radius:14px;
          padding:40px;
          text-align:center;
        }
        h2{
          font-size:28px;
        }
        .subtitle{
          color:#9ca3af;
          margin-bottom:20px;
        }
        .form{
          display:flex;
          flex-direction:column;
          gap:14px;
        }

        input, textarea{
          padding:12px;
          border-radius:8px;
          border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.05);
          color:white;
        }

        textarea{
          min-height:80px;
        }

        input::placeholder,
        textarea::placeholder{
          color:#9ca3af;
        }

        button{
          padding:12px;
          border:none;
          border-radius:20px;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          color:white;
          cursor:pointer;
          font-weight:600;
        }

        .success{
          margin-top:12px;
          color:#22c55e;
        }

      `}</style>

    </div>
  );
}