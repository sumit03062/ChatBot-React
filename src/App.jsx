import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBERqUPisk4RIic_Xi1cShXbZIoF0kl5JM" });

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: input,
      });

      const botMessage = { sender: "bot", text: response.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
    }
    setLoading(false);
  };

    const clearChat = () => {
      setMessages([]);
    };
  

  return (
    <div className="max-w-lg mx-auto p-4">

      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
      <div className="border rounded-lg shadow-lg p-4 h-96 overflow-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-lg max-w-xs ${
              msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="border p-2 flex-1 rounded"
        />
        <button onClick={sendMessage} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
          {loading ? "Thinking..." : "Send"}
        </button>

        <button
            onClick={clearChat}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Chat
          </button>
      </div>
    </div>
  );
};

export default Chatbot;
