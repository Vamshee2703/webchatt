import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

export default function Home() {

  const router = useRouter();

  return (
    <div className="page">

      <Navbar />

      <section className="hero">

        {/* 3D bubble */}
        <div className="bubble">
          <svg viewBox="0 0 600 600">
            <defs>
              <radialGradient id="g1" cx="40%" cy="30%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="40%" stopColor="#7c3aed" />
                <stop offset="80%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
            </defs>

            <ellipse
              cx="300"
              cy="300"
              rx="260"
              ry="220"
              fill="url(#g1)"
            />
          </svg>
        </div>

       <h1>
  AI-Powered Knowledge Hub <br/> 
  For Websites, PDFs & Discussions
</h1>

        <p>
  ContextIQ lets you chat with websites, analyze PDFs, and explore
  community discussions using an intelligent AI assistant — all in one platform.
</p>


        <button
          className="cta"
          onClick={() => router.push("/signup")}
        >
          Start Exploring
        </button>

      </section>

      <style jsx>{`

        .page{
          min-height:100vh;
          background:#020617;
          color:white;
        }

        .hero{
          position:relative;
          height:100vh;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          gap:20px;

          overflow:hidden;
        }

        /* 3D bubble container */

        .bubble{
          position:absolute;
          bottom:-180px;
          left:50%;
          transform:translateX(-50%);

          width:900px;
          opacity:0.9;

          animation:float 12s ease-in-out infinite;
        }

        .bubble svg{
          width:100%;
          height:auto;
          filter:blur(2px);
        }

        @keyframes float{
          0%{ transform:translateX(-50%) translateY(0); }
          50%{ transform:translateX(-50%) translateY(-40px); }
          100%{ transform:translateX(-50%) translateY(0); }
        }

        /* star dots */

        .hero::before{
          content:"";
          position:absolute;
          width:100%;
          height:100%;

          background-image:radial-gradient(white 1px, transparent 1px);
          background-size:70px 70px;

          opacity:0.05;
        }

        h1{
          font-size:64px;
          font-weight:700;
          max-width:900px;
          z-index:1;
        }

        p{
          color:#9ca3af;
          max-width:520px;
          z-index:1;
        }

        .cta{
          margin-top:10px;
          padding:12px 28px;
          border:none;
          border-radius:30px;
          background:white;
          cursor:pointer;
          font-weight:600;
          z-index:1;
        }

      `}</style>

    </div>
  );
}