import { ChatGroq } from "@langchain/groq"
import { tool } from "@langchain/core/tools";
import { createEventTool, getEventTool } from "./tools";

const tools = [createEventTool, getEventTool];


const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0
}).bindTools(tools)