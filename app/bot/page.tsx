import MeetingAssistant from "@/components/bot/meeting-assistant"
import MeetingChatbot from "@/components/bot/meeting-chatbot"

export default function MeetingAssistantPage() {
  return (<>
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Meeting Assistant</h1>
      <MeetingAssistant />
    </div>
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Meeting Chatbot</h1>
      <div className="max-w-md mx-auto">
        <MeetingChatbot />
      </div>
    </div>
    </>
  )
}
