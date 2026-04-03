import "../styles/globals.css";
import Navbar from "../components/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <>
       <div className="bg-slate-950 min-h-screen text-white">
        <Navbar />
     <div className="pt-[80px]">
        <Component {...pageProps} />
      </div>
    </div>
    </>
  );
}