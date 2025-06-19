import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBERqUPisk4RIic_Xi1cShXbZIoF0kl5JM" });
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (customInput) => {
    const finalInput = customInput || input;
    if (!finalInput.trim()) return;
    setLoading(true);

    const userMessage = { sender: "user", text: finalInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
       contents: [
  {
    role: "user",
    parts: [
      {
        text: `You are a helpful and friendly AI assistant like ChatGPT. Always answer the user's questions in a clear, natural, and human-like tone. Keep responses summarized, well-structured, and easy to understand. Use bullet points, numbered steps, or short paragraphs. Be concise but informative. Avoid overly technical or robotic language unless requested. Format responses cleanly for better readability.
.\n\nUser: ${finalInput}`,
      },
    ],
  },
],

      });

      const botMessage = { sender: "bot", text: response.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, something went wrong!" }]);
    }
    setLoading(false);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice recognition. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      setMessages((prev) => [...prev, { sender: "bot", text: "🎙️ Couldn't hear anything. Please try again!" }]);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript); // auto-send voice input
    };

    recognition.start();
  };

  const clearChat = () => setMessages([]);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"} min-h-screen flex items-center justify-center px-4`}>
      <div className={`w-full max-w-xl rounded-xl shadow-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 ${darkMode ? "bg-gray-700 text-white" : "bg-purple-600 text-white"} rounded-t-xl`}>
          <h1 className="text-lg font-bold">🎯 Gemini AI Chatbot</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm bg-white text-black px-3 py-1 rounded-full shadow hover:scale-105 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "450px" }}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                  {msg.sender === "user" ? "🧑" : "🤖"}
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm shadow max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : `${darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"} rounded-bl-none`
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm animate-pulse">
              <span className="text-xl">🤖</span>
              Bot is typing...
            </div>
          )}
          {listening && (
            <div className="flex items-center gap-2 text-sm text-yellow-500 animate-pulse">
              <span className="text-xl">🎤</span>
              Listening...
            </div>
          )}
          <div ref={chatRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex flex-col sm:flex-row items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
          />
          <div className="flex gap-2">
            <button
              onClick={startListening}
              className="bg-yellow-400 text-black px-3 py-2 rounded-full hover:bg-yellow-500 transition"
              title="Voice Input"
            >
              🎤
            </button>
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full"
            >
              {loading ? "..." : "Send"}
            </button>
            <button
              onClick={clearChat}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
