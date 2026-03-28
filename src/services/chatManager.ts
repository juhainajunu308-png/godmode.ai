import { Message, ModelType } from "../types";

export async function getAIResponse(
  model: ModelType,
  prompt: string,
  history: Message[]
): Promise<{ content: string; model: ModelType }[]> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        history: history.map(m => ({ role: m.role, content: m.content }))
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return [{ 
      content: `### [SYSTEM_FAILURE: NEURAL_LINK_BROKEN]\n\nUnable to establish connection with the processing matrix. \n\n**Error:** ${error instanceof Error ? error.message : String(error)}`, 
      model: 'combined' 
    }];
  }
}
