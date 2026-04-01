import { useEffect, useState } from "react";

export default function Forum() {

  const [questions,setQuestions] = useState([]);
  const [answers,setAnswers] = useState({});
  const [answerText,setAnswerText] = useState({});
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [message,setMessage] = useState("");
  const [showQuestions,setShowQuestions] = useState(false);

  const [currentUser,setCurrentUser] = useState(null);

  const [editingQuestionId,setEditingQuestionId] = useState(null);
  const [editingAnswerId,setEditingAnswerId] = useState(null);

  const [editTitle,setEditTitle] = useState("");
  const [editDescription,setEditDescription] = useState("");
  const [editAnswerText,setEditAnswerText] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access")
      : null;

  /* ---------- LOAD USER ---------- */
  useEffect(()=>{
    const loadUser = async()=>{
      if(!token) return;

      const res = await fetch("http://127.0.0.1:8000/api/profile/",{
        headers:{ Authorization:`Bearer ${token}` }
      });

      if(res.ok){
        const data = await res.json();
        setCurrentUser(data.username);
      }
    };

    loadUser();
  },[]);

  /* ---------- LOAD QUESTIONS ---------- */
  const loadQuestions = async()=>{
    const res = await fetch("http://127.0.0.1:8000/api/forum/questions/");
    const data = await res.json();
    setQuestions(data);
  };

  useEffect(()=>{ loadQuestions(); },[]);

  /* ---------- POST QUESTION ---------- */
  const postQuestion = async()=>{
    const res = await fetch("http://127.0.0.1:8000/api/forum/question/create/",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify({ title, description })
    });

    if(!res.ok){
      setMessage("❌ Failed to post question");
      return;
    }

    setMessage("✅ Question posted");
    setTitle(""); setDescription("");
    loadQuestions();
  };

  /* ---------- UPDATE QUESTION ---------- */
  const updateQuestion = async(id)=>{
    const res = await fetch(`http://127.0.0.1:8000/api/forum/question/update/${id}/`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify({
        title:editTitle,
        description:editDescription
      })
    });

    if(res.ok){
      setEditingQuestionId(null);
      loadQuestions();
    }
  };

  /* ---------- DELETE QUESTION ---------- */
  const deleteQuestion = async(id)=>{
    await fetch(`http://127.0.0.1:8000/api/forum/question/delete/${id}/`,{
      method:"DELETE",
      headers:{ Authorization:`Bearer ${token}` }
    });
    loadQuestions();
  };

  /* ---------- ANSWERS ---------- */
  const loadAnswers = async(id)=>{
    const res = await fetch(`http://127.0.0.1:8000/api/forum/answers/${id}/`);
    const data = await res.json();
    setAnswers(prev=>({...prev,[id]:data}));
  };

  const postAnswer = async(id)=>{
    const content = answerText[id];
    if(!content) return;

    await fetch(`http://127.0.0.1:8000/api/forum/answer/${id}/`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify({content})
    });

    setAnswerText({...answerText,[id]:""});
    loadAnswers(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center pt-28 text-white">

      <div className="w-[900px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-10">

        <h2 className="text-2xl font-semibold mb-4">Discussion Forum</h2>

        {message && <p className="text-green-400">{message}</p>}

        {/* INPUTS */}
        <input
          placeholder="Question Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full p-3 mt-3 rounded-lg bg-white/5 border border-white/10 text-white"
        />

        <textarea
          placeholder="Question Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="w-full p-3 mt-3 rounded-lg bg-white/5 border border-white/10 text-white min-h-[90px]"
        />

        {/* BUTTONS */}
        <button
          onClick={postQuestion}
          className="w-full mt-3 p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 font-semibold"
        >
          Post Question
        </button>

        <button
          onClick={()=>setShowQuestions(!showQuestions)}
          className="w-full mt-2 p-2 rounded-lg bg-gray-800"
        >
          {showQuestions ? "Hide Questions" : "View Questions"}
        </button>

        {/* QUESTIONS */}
        {showQuestions && questions.map(q => (

          <div key={q.id} className="mt-6 p-5 bg-white/5 rounded-lg">

            <div className="flex justify-between">

              <div>
                <h3 className="text-lg font-semibold">{q.title}</h3>
                <p className="text-gray-400">{q.description}</p>
                <small className="text-gray-500">Posted by {q.user}</small>
              </div>

              {currentUser === q.user && (
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-indigo-500 rounded">Edit</button>
                  <button className="px-2 py-1 bg-red-500 rounded">Delete</button>
                </div>
              )}

            </div>

            <button
              onClick={()=>loadAnswers(q.id)}
              className="mt-3 px-3 py-1 bg-indigo-600 rounded"
            >
              View Answers
            </button>

            {/* ANSWERS */}
            {answers[q.id] && (
              <div className="mt-4 space-y-2">
                {answers[q.id].map(a => (
                  <div key={a.id} className="bg-white/10 p-3 rounded">
                    <p className="text-sm text-gray-400">{a.user}</p>
                    <p>{a.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ANSWER INPUT */}
            <textarea
              placeholder="Write your answer..."
              value={answerText[q.id] || ""}
              onChange={(e)=>setAnswerText({
                ...answerText,
                [q.id]:e.target.value
              })}
              className="w-full mt-3 p-3 rounded bg-white/5 border border-white/10"
            />

            <button
              onClick={()=>postAnswer(q.id)}
              className="mt-2 px-4 py-2 bg-indigo-600 rounded"
            >
              Submit Answer
            </button>

          </div>

        ))}

      </div>
    </div>
  );
}