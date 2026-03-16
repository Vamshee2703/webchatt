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

  /* ---------------- LOAD USER ---------------- */

  useEffect(()=>{

    const loadUser = async()=>{

      if(!token) return;

      const res = await fetch(
        "http://127.0.0.1:8000/api/profile/",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      if(res.ok){
        const data = await res.json();
        setCurrentUser(data.username);
      }

    };

    loadUser();

  },[]);

  /* ---------------- LOAD QUESTIONS ---------------- */

  const loadQuestions = async()=>{

    const res = await fetch(
      "http://127.0.0.1:8000/api/forum/questions/"
    );

    const data = await res.json();

    setQuestions(data);

  };

  useEffect(()=>{
    loadQuestions();
  },[]);

  /* ---------------- POST QUESTION ---------------- */

  const postQuestion = async()=>{

    const res = await fetch(
      "http://127.0.0.1:8000/api/forum/question/create/",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          title,
          description
        })
      }
    );

    if(!res.ok){
      setMessage("❌ Failed to post question");
      return;
    }

    setMessage("✅ Question posted");

    setTitle("");
    setDescription("");

    loadQuestions();

  };

  /* ---------------- UPDATE QUESTION ---------------- */

  const updateQuestion = async(id)=>{

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/question/update/${id}/`,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          title:editTitle,
          description:editDescription
        })
      }
    );

    if(res.ok){
      setEditingQuestionId(null);
      loadQuestions();
    }else{
      alert("Failed to update question");
    }

  };

  /* ---------------- DELETE QUESTION ---------------- */

  const deleteQuestion = async(id)=>{

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/question/delete/${id}/`,
      {
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    if(res.ok){
      loadQuestions();
    }else{
      alert("Failed to delete question");
    }

  };

  /* ---------------- LOAD ANSWERS ---------------- */

  const loadAnswers = async(questionId)=>{

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/answers/${questionId}/`
    );

    const data = await res.json();

    setAnswers(prev=>({
      ...prev,
      [questionId]:data
    }));

  };

  /* ---------------- POST ANSWER ---------------- */

  const postAnswer = async(questionId)=>{

    const content = answerText[questionId];

    if(!content) return;

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/answer/${questionId}/`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({content})
      }
    );

    if(!res.ok){
      alert("Failed to post answer");
      return;
    }

    setAnswerText({
      ...answerText,
      [questionId]:""
    });

    loadAnswers(questionId);

  };

  /* ---------------- UPDATE ANSWER ---------------- */

  const updateAnswer = async(id,questionId)=>{

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/answer/update/${id}/`,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          content:editAnswerText
        })
      }
    );

    if(res.ok){
      setEditingAnswerId(null);
      loadAnswers(questionId);
    }

  };

  /* ---------------- DELETE ANSWER ---------------- */

  const deleteAnswer = async(id,questionId)=>{

    const res = await fetch(
      `http://127.0.0.1:8000/api/forum/answer/delete/${id}/`,
      {
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    if(res.ok){
      loadAnswers(questionId);
    }

  };

  return(
    <div className="page">

      <div className="card">

        <h2>Discussion Forum</h2>

        {message && <p className="success">{message}</p>}

        <input
          placeholder="Question Title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />

        <textarea
          placeholder="Question Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <button className="primary-btn" onClick={postQuestion}>
          Post Question
        </button>

        <button
          className="secondary-btn"
          onClick={()=>setShowQuestions(!showQuestions)}
        >
          {showQuestions ? "Hide Questions" : "View Questions"}
        </button>

        {showQuestions && questions.map(q => (

          <div key={q.id} className="question">

            <div className="question-header">

              <div>

                {editingQuestionId === q.id ? (

                  <>
                    <input
                      value={editTitle}
                      onChange={(e)=>setEditTitle(e.target.value)}
                    />

                    <textarea
                      value={editDescription}
                      onChange={(e)=>setEditDescription(e.target.value)}
                    />

                    <button onClick={()=>updateQuestion(q.id)} className="save-btn">
                      Save
                    </button>

                    <button onClick={()=>setEditingQuestionId(null)} className="cancel-btn">
                      Cancel
                    </button>
                  </>

                ) : (

                  <>
                    <h3>{q.title}</h3>
                    <p>{q.description}</p>
                    <small>Posted by {q.user}</small>
                  </>

                )}

              </div>

              {currentUser === q.user && (

                <div className="actions">

                  <button
                    className="edit-btn"
                    onClick={()=>{
                      setEditingQuestionId(q.id);
                      setEditTitle(q.title);
                      setEditDescription(q.description);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={()=>deleteQuestion(q.id)}
                  >
                    Delete
                  </button>

                </div>

              )}

            </div>

            <button
              className="view-btn"
              onClick={()=>loadAnswers(q.id)}
            >
              View Answers
            </button>

            {answers[q.id] && (

              <div className="answers">

                {answers[q.id].map(a => (

                  <div key={a.id} className="answer">

                    <div className="answer-header">

                      <span>{a.user}</span>

                      {currentUser === a.user && (

                        <div className="actions">

                          <button
                            className="edit-btn"
                            onClick={()=>{
                              setEditingAnswerId(a.id);
                              setEditAnswerText(a.content);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={()=>deleteAnswer(a.id,q.id)}
                          >
                            Delete
                          </button>

                        </div>

                      )}

                    </div>

                    {editingAnswerId === a.id ? (

                      <>
                        <textarea
                          value={editAnswerText}
                          onChange={(e)=>setEditAnswerText(e.target.value)}
                        />

                        <button onClick={()=>updateAnswer(a.id,q.id)} className="save-btn">
                          Save
                        </button>
                      </>

                    ) : (

                      <p>{a.content}</p>

                    )}

                  </div>

                ))}

              </div>

            )}

            <textarea
              placeholder="Write your answer..."
              value={answerText[q.id] || ""}
              onChange={(e)=>setAnswerText({
                ...answerText,
                [q.id]:e.target.value
              })}
            />

            <button
              className="answer-btn"
              onClick={()=>postAnswer(q.id)}
            >
              Submit Answer
            </button>

          </div>

        ))}

      </div>

<style jsx>{`

.page{
min-height:100vh;
background:#020617;
display:flex;
justify-content:center;
padding-top:120px;
color:white;
}

.card{
width:900px;
background:rgba(255,255,255,0.05);
backdrop-filter:blur(18px);
border-radius:14px;
padding:40px;
border:1px solid rgba(255,255,255,0.1);
}

input,textarea{
width:100%;
padding:12px;
margin-top:12px;
border-radius:8px;
border:1px solid rgba(255,255,255,0.15);
background:rgba(255,255,255,0.05);
color:white;
}

textarea{
min-height:90px;
}

.primary-btn{
background:linear-gradient(135deg,#7c3aed,#6d28d9);
border:none;
padding:12px;
border-radius:8px;
color:white;
margin-top:12px;
}

.secondary-btn{
background:#1f2937;
border:none;
padding:10px;
border-radius:8px;
color:white;
margin-top:10px;
}

.question{
margin-top:30px;
padding:20px;
background:rgba(255,255,255,0.04);
border-radius:10px;
}

.question-header{
display:flex;
justify-content:space-between;
}

.actions{
display:flex;
gap:6px;
}

.edit-btn{
background:#6366f1;
border:none;
padding:6px 10px;
border-radius:6px;
color:white;
}

.delete-btn{
background:#ef4444;
border:none;
padding:6px 10px;
border-radius:6px;
color:white;
}

.view-btn{
background:#4f46e5;
border:none;
padding:8px 14px;
border-radius:6px;
margin-top:10px;
color:white;
}

.answers{
margin-top:15px;
}

.answer{
background:rgba(255,255,255,0.06);
padding:12px;
border-radius:8px;
margin-bottom:10px;
}

.answer-header{
display:flex;
justify-content:space-between;
margin-bottom:6px;
}

.answer-btn{
margin-top:10px;
background:linear-gradient(135deg,#6366f1,#4f46e5);
border:none;
padding:10px;
border-radius:8px;
color:white;
}

.save-btn{
background:#22c55e;
border:none;
padding:6px 12px;
border-radius:6px;
color:white;
margin-top:6px;
}

.cancel-btn{
background:#6b7280;
border:none;
padding:6px 12px;
border-radius:6px;
color:white;
margin-left:6px;
}

.success{
color:#22c55e;
}

`}</style>

    </div>
  );

}