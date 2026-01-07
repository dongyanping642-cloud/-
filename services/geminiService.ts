
import { GoogleGenAI, Type } from "@google/genai";
import { Debater, Side, CoachAdvice } from "../types";

// Note: API_KEY must be accessed directly from process.env.API_KEY when initializing GoogleGenAI.

export const getDebateResponse = async (
  debater: Debater,
  topic: string,
  side: Side,
  history: { sender: string; content: string }[],
  currentRound: number,
  totalRounds: number
): Promise<{ content: string; scoreDelta: number }> => {
  // Always create a new instance right before use to ensure the most current API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const historyStr = history.map(h => `${h.sender}: ${h.content}`).join("\n");
  
  // Use systemInstruction for defining the persona and style.
  const systemInstruction = `你现在扮演辩手“${debater.name}”。你的风格：${debater.style}。你的性格特点：${debater.persona}。`;

  const prompt = `
    当前辩题：${topic}
    你的持方：${side === Side.PRO ? '正方' : '反方'}
    当前回合：${currentRound}/${totalRounds}
    
    之前的对话记录：
    ${historyStr}
    
    请根据你的风格发表一段犀利的、有感染力的辩论词。
    要求：
    1. 语气必须完全符合${debater.name}的特点。
    2. 多用例子、故事、金句。
    3. 加入一些标志性的小动作描述（放在括号内）。
    4. 逻辑要自洽。
    5. 同时给出一个分数波动建议（-5到+5之间），表示这段话对观众的影响。
    
    请以JSON格式返回：
    {
      "content": "辩论内容",
      "scoreDelta": 数字
    }
  `;

  // Always use generateContent and access the .text property for the result.
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          scoreDelta: { type: Type.NUMBER }
        },
        required: ["content", "scoreDelta"]
      }
    }
  });

  // response.text is a property, not a method.
  return JSON.parse(response.text || "{}");
};

export const getCoachAdvice = async (
  topic: string,
  userSide: Side,
  history: { sender: string; content: string }[]
): Promise<CoachAdvice> => {
  // Always create a new instance right before use.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const historyStr = history.map(h => `${h.sender}: ${h.content}`).join("\n");

  const prompt = `
    你是一位顶级的辩论教练。
    辩题：${topic}
    学员持方：${userSide === Side.PRO ? '正方' : '反方'}
    
    对话历史：
    ${historyStr}
    
    请为学员提供实时战术指导：
    1. 简要分析当前局势。
    2. 提供3个反驳对手的切入点。
    3. 提供3句精炼的金句。
    4. 提供一个生动的生活类比。
    
    请以JSON格式返回：
    {
      "analysis": "局势分析",
      "counterPoints": ["点1", "点2", "点3"],
      "goldenQuotes": ["金句1", "金句2", "金句3"],
      "analogy": "生活类比"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          counterPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          goldenQuotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          analogy: { type: Type.STRING }
        },
        required: ["analysis", "counterPoints", "goldenQuotes", "analogy"]
      }
    }
  });

  // response.text is a property, not a method.
  return JSON.parse(response.text || "{}");
};
