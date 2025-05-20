export type MeetingData = {
  participantCount: number;
  durationMinutes: number;
  meetingType: string; // e.g., "brainstorming", "status update", "decision making"
  previousMeetingEfficiency: number; // percentage
  agendaItems: string[];
  teamExpertise: string[];
  urgencyLevel: number; // 1-10 scale
};

export type MeetingAssistantResponse = {
  recommendedStructure: {
    totalTimeAllocation: number; // in minutes
    agendaBreakdown: Array<{
      item: string;
      timeAllocation: number; // in minutes
      priority: string; // "high", "medium", "low"
    }>;
  };
  participationStrategy: {
    recommendedFormat: string; // e.g., "round-robin", "open discussion", "breakout groups"
    keyParticipantRoles: string[];
    engagementTips: string[];
  };
  decisionMakingFramework: string;
  potentialChallenges: string[];
  followUpActions: string[];
  aiAssistantPrompts: string[]; // Suggested prompts for the chatbot during the meeting
};

export async function generateMeetingGuidance(
  meetingData: MeetingData
): Promise<MeetingAssistantResponse> {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  if (!API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    const prompt = `
      Analyze the following meeting data and provide guidance to optimize the meeting:
      
      Participant Count: ${meetingData.participantCount}
      Duration: ${meetingData.durationMinutes} minutes
      Meeting Type: ${meetingData.meetingType}
      Previous Meeting Efficiency: ${meetingData.previousMeetingEfficiency}%
      Agenda Items: ${meetingData.agendaItems.join(", ")}
      Team Expertise: ${meetingData.teamExpertise.join(", ")}
      Urgency Level: ${meetingData.urgencyLevel}/10
      
      Provide the response as a valid JSON object with no additional text, code blocks, or backticks. The JSON should contain:
      1. Recommended meeting structure with time allocation for each agenda item
      2. Participation strategy to maximize engagement
      3. Decision-making framework appropriate for this meeting type
      4. Potential challenges to anticipate
      5. Follow-up actions to ensure meeting outcomes are implemented
      6. AI assistant prompts that could be used during the meeting to facilitate discussion
      
      Example response:
      {"recommendedStructure":{"totalTimeAllocation":60,"agendaBreakdown":[{"item":"Introduction","timeAllocation":5,"priority":"medium"}]},"participationStrategy":{"recommendedFormat":"round-robin","keyParticipantRoles":["Facilitator","Timekeeper"],"engagementTips":["Ask direct questions"]},"decisionMakingFramework":"Consensus-based approach","potentialChallenges":["Time management"],"followUpActions":["Send meeting notes"],"aiAssistantPrompts":["What are the key takeaways?"]}
    `;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate meeting guidance");
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!generatedText) {
      console.error("Empty response from AI");
      throw new Error("AI returned an empty response");
    }

    try {
      const cleanedText = generatedText
        .replace(/^```json\s*/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsedResult = JSON.parse(cleanedText);

      if (
        !parsedResult ||
        !parsedResult.recommendedStructure ||
        !parsedResult.participationStrategy ||
        !Array.isArray(parsedResult.potentialChallenges) ||
        !Array.isArray(parsedResult.followUpActions) ||
        !Array.isArray(parsedResult.aiAssistantPrompts)
      ) {
        console.error("Invalid AI response structure:", parsedResult);
        throw new Error("AI response does not match expected format");
      }

      const result: MeetingAssistantResponse = {
        recommendedStructure: parsedResult.recommendedStructure,
        participationStrategy: parsedResult.participationStrategy,
        decisionMakingFramework: parsedResult.decisionMakingFramework,
        potentialChallenges: parsedResult.potentialChallenges,
        followUpActions: parsedResult.followUpActions,
        aiAssistantPrompts: parsedResult.aiAssistantPrompts,
      };
      
      return result;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, "Raw response:", generatedText);
      throw new Error("Failed to parse AI meeting guidance response");
    }
  } catch (error) {
    console.error("Error generating meeting guidance:", error);
    
    // Fallback response if the API call fails
    return {
      recommendedStructure: {
        totalTimeAllocation: meetingData.durationMinutes,
        agendaBreakdown: meetingData.agendaItems.map((item, index) => ({
          item,
          timeAllocation: Math.floor(meetingData.durationMinutes / meetingData.agendaItems.length),
          priority: index < 2 ? "high" : index < 4 ? "medium" : "low",
        })),
      },
      participationStrategy: {
        recommendedFormat: meetingData.participantCount > 8 ? "breakout groups" : "round-robin",
        keyParticipantRoles: ["Facilitator", "Timekeeper", "Note-taker"],
        engagementTips: [
          "Ask direct questions to quiet participants",
          "Use visual aids to keep attention",
          "Summarize key points periodically",
        ],
      },
      decisionMakingFramework: meetingData.urgencyLevel > 7 ? "Leader decides after discussion" : "Consensus-based approach",
      potentialChallenges: [
        "Time management",
        "Keeping discussion focused",
        "Ensuring all voices are heard",
        "Following up on action items",
      ],
      followUpActions: [
        "Send meeting notes within 24 hours",
        "Schedule follow-up meetings for unresolved items",
        "Create action item tracking document",
      ],
      aiAssistantPrompts: [
        "What are the key takeaways from this discussion?",
        "Can you summarize the different perspectives shared?",
        "What potential risks should we consider?",
        "What are our next steps and who is responsible?",
        "How does this decision align with our overall goals?",
      ],
    };
  }
}

export type ChatbotQuery = {
  userQuery: string;
  meetingContext?: MeetingData;
  previousMessages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  preferredResponseStyle?: "concise" | "detailed" | "analytical";
};

export type ChatbotResponse = {
  answer: string;
  suggestedFollowUps: string[];
  relevantResources?: string[];
  meetingInsights?: {
    relevantAgendaItems: string[];
    suggestedActions: string[];
  };
};

export async function generateChatbotResponse(
  query: ChatbotQuery
): Promise<ChatbotResponse> {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  if (!API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    // Format previous messages for context
    const conversationHistory = query.previousMessages
      .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    // Build meeting context if available
    let meetingContextStr = "";
    if (query.meetingContext) {
      meetingContextStr = `
        Current Meeting Context:
        Participant Count: ${query.meetingContext.participantCount}
        Duration: ${query.meetingContext.durationMinutes} minutes
        Meeting Type: ${query.meetingContext.meetingType}
        Agenda Items: ${query.meetingContext.agendaItems.join(", ")}
      `;
    }

    const prompt = `
      You are an AI assistant helping with meetings and workplace communication.
      
      ${meetingContextStr}
      
      Previous conversation:
      ${conversationHistory}
      
      User's current query: ${query.userQuery}
      
      Preferred response style: ${query.preferredResponseStyle || "concise"}
      
      Provide the response as a valid JSON object with no additional text, code blocks, or backticks. The JSON should contain:
      1. A direct answer to the user's query
      2. 2-3 suggested follow-up questions the user might want to ask
      3. If relevant, resources that might help the user
      4. If meeting context is provided, insights about how the query relates to the meeting
      
      Example response:
      {"answer":"Here's how you can prepare for the meeting...","suggestedFollowUps":["What agenda items should I prioritize?"],"relevantResources":["Meeting preparation template"],"meetingInsights":{"relevantAgendaItems":["Budget discussion"],"suggestedActions":["Review previous meeting notes"]}}
    `;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate chatbot response");
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!generatedText) {
      console.error("Empty response from AI");
      throw new Error("AI returned an empty response");
    }

    try {
      const cleanedText = generatedText
        .replace(/^```json\s*/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsedResult = JSON.parse(cleanedText);

      if (
        !parsedResult ||
        typeof parsedResult.answer !== 'string' ||
        !Array.isArray(parsedResult.suggestedFollowUps)
      ) {
        console.error("Invalid AI response structure:", parsedResult);
        throw new Error("AI response does not match expected format");
      }

      const result: ChatbotResponse = {
        answer: parsedResult.answer,
        suggestedFollowUps: parsedResult.suggestedFollowUps,
        relevantResources: parsedResult.relevantResources,
        meetingInsights: parsedResult.meetingInsights,
      };
      
      return result;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, "Raw response:", generatedText);
      throw new Error("Failed to parse AI chatbot response");
    }
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    
    // Fallback response if the API call fails
    return {
      answer: "I'm sorry, I couldn't process your request at the moment. Could you please try again or rephrase your question?",
      suggestedFollowUps: [
        "Can you help me prepare for my upcoming meeting?",
        "What are some best practices for effective meetings?",
        "How can I improve team participation in meetings?",
      ],
    };
  }
}
