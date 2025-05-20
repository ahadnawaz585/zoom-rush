"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type MeetingData, generateMeetingGuidance, type MeetingAssistantResponse } from "@/lib/bot"
import { Loader2, Clock, Users, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react'

interface MeetingAssistantProps {
  inModal?: boolean;
}

export default function MeetingAssistant({ inModal = false }: MeetingAssistantProps) {
  const [meetingData, setMeetingData] = useState<MeetingData>({
    participantCount: 5,
    durationMinutes: 60,
    meetingType: "status update",
    previousMeetingEfficiency: 70,
    agendaItems: [""],
    teamExpertise: [""],
    urgencyLevel: 5,
  })

  const [loading, setLoading] = useState(false)
  const [guidance, setGuidance] = useState<MeetingAssistantResponse | null>(null)
  const [activeTab, setActiveTab] = useState("setup")

  const handleAgendaChange = (index: number, value: string) => {
    const newAgendaItems = [...meetingData.agendaItems]
    newAgendaItems[index] = value
    setMeetingData({ ...meetingData, agendaItems: newAgendaItems })
  }

  const addAgendaItem = () => {
    setMeetingData({
      ...meetingData,
      agendaItems: [...meetingData.agendaItems, ""],
    })
  }

  const removeAgendaItem = (index: number) => {
    const newAgendaItems = [...meetingData.agendaItems]
    newAgendaItems.splice(index, 1)
    setMeetingData({ ...meetingData, agendaItems: newAgendaItems })
  }

  const handleExpertiseChange = (index: number, value: string) => {
    const newExpertise = [...meetingData.teamExpertise]
    newExpertise[index] = value
    setMeetingData({ ...meetingData, teamExpertise: newExpertise })
  }

  const addExpertise = () => {
    setMeetingData({
      ...meetingData,
      teamExpertise: [...meetingData.teamExpertise, ""],
    })
  }

  const removeExpertise = (index: number) => {
    const newExpertise = [...meetingData.teamExpertise]
    newExpertise.splice(index, 1)
    setMeetingData({ ...meetingData, teamExpertise: newExpertise })
  }

  const generateGuidance = async () => {
    setLoading(true)
    try {
      // Filter out empty agenda items and expertise
      const filteredData = {
        ...meetingData,
        agendaItems: meetingData.agendaItems.filter((item) => item.trim() !== ""),
        teamExpertise: meetingData.teamExpertise.filter((item) => item.trim() !== ""),
      }

      // Ensure there's at least one agenda item
      if (filteredData.agendaItems.length === 0) {
        filteredData.agendaItems = ["General discussion"]
      }

      const result = await generateMeetingGuidance(filteredData)
      setGuidance(result)
      setActiveTab("guidance")
    } catch (error) {
      console.error("Error generating meeting guidance:", error)
      alert("Failed to generate meeting guidance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={inModal ? "" : "container mx-auto py-8"}>
      <Card className={`w-full ${inModal ? "" : "max-w-4xl mx-auto"} border border-border`}>
        {!inModal && (
          <CardHeader>
            <CardTitle>Meeting Assistant</CardTitle>
            <CardDescription>Plan and optimize your meetings with AI-powered guidance</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup">Meeting Setup</TabsTrigger>
              <TabsTrigger value="guidance" disabled={!guidance}>
                Meeting Guidance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="participantCount">Number of Participants</Label>
                    <Input
                      id="participantCount"
                      type="number"
                      min="2"
                      value={meetingData.participantCount}
                      onChange={(e) =>
                        setMeetingData({ ...meetingData, participantCount: Number.parseInt(e.target.value) || 2 })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                    <Input
                      id="durationMinutes"
                      type="number"
                      min="15"
                      step="5"
                      value={meetingData.durationMinutes}
                      onChange={(e) =>
                        setMeetingData({ ...meetingData, durationMinutes: Number.parseInt(e.target.value) || 15 })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="meetingType">Meeting Type</Label>
                    <Select
                      value={meetingData.meetingType}
                      onValueChange={(value) => setMeetingData({ ...meetingData, meetingType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="status update">Status Update</SelectItem>
                        <SelectItem value="brainstorming">Brainstorming</SelectItem>
                        <SelectItem value="decision making">Decision Making</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="problem solving">Problem Solving</SelectItem>
                        <SelectItem value="team building">Team Building</SelectItem>
                        <SelectItem value="one-on-one">One-on-One</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="previousEfficiency">Previous Meeting Efficiency (%)</Label>
                    <Input
                      id="previousEfficiency"
                      type="number"
                      min="0"
                      max="100"
                      value={meetingData.previousMeetingEfficiency}
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          previousMeetingEfficiency: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgencyLevel">Urgency Level (1-10)</Label>
                    <Input
                      id="urgencyLevel"
                      type="number"
                      min="1"
                      max="10"
                      value={meetingData.urgencyLevel}
                      onChange={(e) =>
                        setMeetingData({ ...meetingData, urgencyLevel: Number.parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Agenda Items</Label>
                    {meetingData.agendaItems.map((item, index) => (
                      <div key={`agenda-${index}`} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleAgendaChange(index, e.target.value)}
                          placeholder={`Agenda item ${index + 1}`}
                        />
                        {meetingData.agendaItems.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeAgendaItem(index)}
                            className="shrink-0"
                          >
                            -
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addAgendaItem} className="mt-2">
                      Add Agenda Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Team Expertise (optional)</Label>
                    {meetingData.teamExpertise.map((expertise, index) => (
                      <div key={`expertise-${index}`} className="flex gap-2">
                        <Input
                          value={expertise}
                          onChange={(e) => handleExpertiseChange(index, e.target.value)}
                          placeholder={`Area of expertise ${index + 1}`}
                        />
                        {meetingData.teamExpertise.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeExpertise(index)}
                            className="shrink-0"
                          >
                            -
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addExpertise} className="mt-2">
                      Add Expertise
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guidance" className="space-y-6 mt-6">
              {guidance && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5" /> Recommended Structure
                    </h3>
                    <div className="bg-muted p-4 rounded-md border border-border">
                      <p className="mb-2">Total Time: {guidance.recommendedStructure.totalTimeAllocation} minutes</p>
                      <div className="space-y-2">
                        {guidance.recommendedStructure.agendaBreakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  item.priority === "high"
                                    ? "bg-red-500"
                                    : item.priority === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                              ></span>
                              <span>{item.item}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{item.timeAllocation} min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" /> Participation Strategy
                    </h3>
                    <div className="bg-muted p-4 rounded-md border border-border">
                      <p className="mb-2">
                        <strong>Format:</strong> {guidance.participationStrategy.recommendedFormat}
                      </p>

                      <p className="mb-2">
                        <strong>Key Roles:</strong>
                      </p>
                      <ul className="list-disc pl-5 mb-4">
                        {guidance.participationStrategy.keyParticipantRoles.map((role, index) => (
                          <li key={index}>{role}</li>
                        ))}
                      </ul>

                      <p className="mb-2">
                        <strong>Engagement Tips:</strong>
                      </p>
                      <ul className="list-disc pl-5">
                        {guidance.participationStrategy.engagementTips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Decision Framework</h3>
                      <div className="bg-muted p-4 rounded-md border border-border">
                        <p>{guidance.decisionMakingFramework}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Potential Challenges
                      </h3>
                      <div className="bg-muted p-4 rounded-md border border-border">
                        <ul className="list-disc pl-5">
                          {guidance.potentialChallenges.map((challenge, index) => (
                            <li key={index}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" /> Follow-up Actions
                    </h3>
                    <div className="bg-muted p-4 rounded-md border border-border">
                      <ul className="list-disc pl-5">
                        {guidance.followUpActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" /> AI Assistant Prompts
                    </h3>
                    <div className="bg-muted p-4 rounded-md border border-border">
                      <p className="mb-2 text-sm text-muted-foreground">
                        Use these prompts during your meeting to help facilitate discussion:
                      </p>
                      <ul className="list-disc pl-5">
                        {guidance.aiAssistantPrompts.map((prompt, index) => (
                          <li key={index}>{prompt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeTab === "setup" ? (
            <Button onClick={generateGuidance} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Meeting Guidance"
              )}
            </Button>
          ) : (
            <Button onClick={() => setActiveTab("setup")}>Back to Setup</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
