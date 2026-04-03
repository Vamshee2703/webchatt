import { useState } from "react";

export default function FAQ() {
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

  const [active, setActive] = useState(null);

  const toggle = (index) => {
    setActive(active === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-[120px] flex flex-col items-center">

      <h1 className="mb-10 text-3xl font-bold text-center">
        Frequently Asked Questions
      </h1>

      <div className="w-[700px] max-w-[90%]">

        {faqs.map((faq, index) => (
          <div
            key={index}
            onClick={() => toggle(index)}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-4 p-4 cursor-pointer hover:bg-white/10 transition"
          >

            <div className="flex justify-between font-semibold">
              {faq.question}
              <span className="ml-2">
                {active === index ? "-" : "+"}
              </span>
            </div>

            {active === index && (
              <div className="mt-3 text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}