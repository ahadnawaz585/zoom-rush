import { HomePage } from "@/components/home/home";
import React from "react";
import MeetingAssistant from "@/components/bot/meeting-assistant";
import MeetingChatbot from "@/components/bot/meeting-chatbot";
import FloatingButtons from "@/components/bot/floating-buttons";
const page = () => {
  return (
    <>
      <HomePage />
     <FloatingButtons />
    </>
  );
};

export default page;
