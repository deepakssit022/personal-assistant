import { ChatGroq } from "@langchain/groq"
import { tool } from "@langchain/core/tools";
import { createEventTool, getEventTool } from "./tools";
import { StateGraph, MessagesAnnotation, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";

const tools = [createEventTool, getEventTool];
const toolNode = new ToolNode(tools)


const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0
}).bindTools(tools)


async function callModel(state: typeof MessagesAnnotation.State) {
    console.log("calling the llm")
    const response = await model.invoke(state.messages)
    // console.log("response in callmodel:", response)
    return { messages: [response] };
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if ((lastMessage.tool_calls?.length ?? 0) > 0) return "tools";
    return "__end__";
}

const graph = new StateGraph(MessagesAnnotation)
    .addNode("assistant", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "assistant")
    .addEdge("tools", "assistant")
    .addConditionalEdges("assistant", shouldContinue, {
        __end__: END,
        tools: 'tools'
    })

const app = graph.compile();

async function main() {
    const result = await app.invoke({
        messages: [{
            role: 'user',
            content: 'Can you list all my events for katihar?'
        }]
    })

    console.log("AI: ", result.messages[result.messages.length - 1]?.content)

}
main();