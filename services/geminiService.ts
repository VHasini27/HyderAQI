
import { GoogleGenAI, Type } from "@google/genai";
import { LocationData, Pollutants } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthInsights = async (data: LocationData) => {
  const prompt = `Analyze the following air quality data for ${data.name} in Hyderabad:
  AQI: ${data.aqi}
  PM2.5: ${data.pollutants.pm25}
  PM10: ${data.pollutants.pm10}
  NO2: ${data.pollutants.no2}
  
  Provide a concise health recommendation for:
  1. General public
  2. Sensitive groups (children, elderly)
  3. Outdoor activities
  Keep it professional and action-oriented.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not fetch AI insights at this time.";
  }
};

export const fetchAreaAqiViaSearch = async (areaName: string): Promise<{ data: LocationData, sources: any[] } | null> => {
  const prompt = `What is the current Air Quality Index (AQI), PM2.5, PM10, and temperature for ${areaName}, Hyderabad? 
  Please provide the specific numeric values for AQI, PM2.5, and PM10 if available today.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Use Gemini again to parse the search result into our structured format
    const parsePrompt = `From this search result: "${text}", extract the data for ${areaName} into JSON format:
    { "aqi": number, "pm25": number, "pm10": number, "temp": number }. 
    If a value is missing, estimate it realistically based on Hyderabad's current average pollution patterns.`;

    const parseResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: parsePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aqi: { type: Type.NUMBER },
            pm25: { type: Type.NUMBER },
            pm10: { type: Type.NUMBER },
            temp: { type: Type.NUMBER }
          }
        }
      }
    });

    const parsed = JSON.parse(parseResponse.text);

    const dynamicLocation: LocationData = {
      id: `search-${Date.now()}`,
      name: areaName + " (Live Search)",
      aqi: parsed.aqi || 100,
      pollutants: {
        pm25: parsed.pm25 || 35,
        pm10: parsed.pm10 || 70,
        no2: 20,
        so2: 5,
        co: 1.0,
        o3: 40
      },
      temperature: parsed.temp || 30,
      humidity: 50,
      lastUpdated: new Date().toISOString()
    };

    return { data: dynamicLocation, sources };
  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
};

export const chatWithAQI = async (message: string, history: { role: string, text: string }[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are 'HyderAQI Assistant', an expert on Hyderabad's air pollution. You have access to real-time data (PM2.5, PM10, etc.). Help citizens understand how to stay safe and explain the sources of pollution in Hyderabad like vehicular emissions, construction, and weather patterns.",
    }
  });

  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    return "I'm having trouble connecting right now. Please try again later.";
  }
};
