import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Profile(){

  const router = useRouter();

  const [profile,setProfile] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    const loadProfile = async () => {

      const token = localStorage.getItem("access");

      if(!token){
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      if(res.status === 401){
        router.push("/login");
        return;
      }

      const data = await res.json();
      setProfile(data);
      setLoading(false);
    };

    loadProfile();

  },[router]);

  if(loading) return <p style={{color:"white"}}>Loading...</p>;

  return(
    <div className="page">

      <div className="card">

        {/* CLOSE BUTTON */}
        <button
          className="close"
          onClick={()=>router.back()}
        >
          ✕
        </button>

        <h2>User Profile</h2>

        <div className="info">
          <label>Username</label>
          <p>{profile.username}</p>
        </div>

        <div className="info">
          <label>Email</label>
          <p>{profile.email}</p>
        </div>

        <div className="info">
          <label>User ID</label>
          <p>{profile.id}</p>
        </div>

        <button
          onClick={()=>{
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            router.push("/login");
          }}
        >
          Logout
        </button>

      </div>

      <style jsx>{`

      .page{
        min-height:100vh;
        background:#020617;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
      }

      .card{
        width:400px;
        padding:40px;
        position:relative;

        background:rgba(255,255,255,0.05);
        backdrop-filter:blur(16px);

        border-radius:12px;
        border:1px solid rgba(255,255,255,0.1);
      }

      h2{
        margin-bottom:20px;
      }

      .info{
        margin-bottom:16px;
      }

      label{
        font-size:13px;
        color:#9ca3af;
      }

      p{
        margin:4px 0;
      }

      button{
        margin-top:20px;
        width:100%;
        padding:10px;
        border:none;
        border-radius:8px;

        background:linear-gradient(135deg,#7c3aed,#6d28d9);
        color:white;
        cursor:pointer;
      }

      /* CLOSE BUTTON */

      .close{
        position:absolute;
        top:12px;
        right:12px;

        width:32px;
        height:32px;

        border-radius:50%;
        border:none;

        background:rgba(255,255,255,0.1);
        color:white;
        cursor:pointer;
        font-size:16px;

        display:flex;
        align-items:center;
        justify-content:center;
      }

      .close:hover{
        background:rgba(255,255,255,0.2);
      }

      `}</style>

    </div>
  );
}