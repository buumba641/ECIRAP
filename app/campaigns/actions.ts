"use server"

import { GoogleGenAI } from "@google/genai"
import { getEnterpriseData, revenueByCampaign } from "@/lib/data"

export async function generateCampaignInsights() {
  const { campaigns, contracts, leads } = await getEnterpriseData()
  const rev = revenueByCampaign(campaigns, contracts, leads)
  
  if (rev.length === 0) {
    return "Not enough data to generate insights."
  }
  
  // Format data for the prompt
  const dataContext = rev.map(r => 
    `Campaign: ${r.name}, Channel: ${r.channel}, Province: ${r.province}, Budget: ${r.budget}, Revenue: ${r.revenue}, Leads: ${r.leads}, Converted: ${r.convertedLeads}, Score: ${r.score}`
  ).join("\n")

  const prompt = `Analyze the following marketing campaign data and provide 3-4 bullet points of high-impact business insights. 
Focus on:
1. Which areas/provinces are generating the most revenue.
2. Which campaigns or channels have the highest customer retention or long-term value (inferred from ROI and conversions).
3. Underperforming channels or regions.
4. Suggestions for budget reallocation.

Keep the insights concise, actionable, and data-driven (mention specific numbers or multipliers like "3x more").

Data:
${dataContext}`

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    })

    return response.text ?? "Unable to generate insights at this time."
  } catch (error) {
    console.error("Error generating insights:", error)
    return "Error generating AI insights. Ensure the Gemini API key is configured."
  }
}
