import { useState } from "react";

export default function FAQ(){

  const faqs = [
    {
      question: "What is ContextIQ?",
      answer:
        "ContextIQ is an AI-powered platform that allows you to chat with websites, PDFs, and participate in intelligent discussion forums."
    },
    {
      question: "How does PDF Chat work?",
      answer:
        "You can upload a PDF document and ask questions. The AI analyzes the content and answers based only on the document."
    },
    {
      question: "Can I chat with any website?",
      answer:
        "Yes. Just provide the website URL and ContextIQ will analyze the content and allow you to ask questions about it."
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. Your documents and conversations are securely stored and only accessible by your account."
    },
    {
      question: "Do I need an account?",
      answer:
        "Yes. You need to create an account to upload PDFs, chat with websites, and save your conversation history."
    }
  ];

  const [active,setActive] = useState(null);

  const toggle = (index)=>{
    setActive(active === index ? null : index);
  };

  return(
    <div className="page">

      <h1>Frequently Asked Questions</h1>

      <div className="faq-container">

        {faqs.map((faq,index)=>(
          <div
            key={index}
            className="faq-item"
            onClick={()=>toggle(index)}
          >

            <div className="faq-question">
              {faq.question}
              <span>{active === index ? "-" : "+"}</span>
            </div>

            {active === index && (
              <div className="faq-answer">
                {faq.answer}
              </div>
            )}

          </div>
        ))}

      </div>

      <style jsx>{`

        .page{
          min-height:100vh;
          background:#020617;
          color:white;
          padding-top:120px;
          display:flex;
          flex-direction:column;
          align-items:center;
        }

        h1{
          margin-bottom:40px;
          font-size:36px;
        }

        .faq-container{
          width:700px;
          max-width:90%;
        }

        .faq-item{
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px;
          margin-bottom:16px;
          padding:18px;
          cursor:pointer;
        }

        .faq-question{
          display:flex;
          justify-content:space-between;
          font-weight:600;
        }

        .faq-answer{
          margin-top:12px;
          color:#9ca3af;
          line-height:1.6;
        }

      `}</style>

    </div>
  );
}