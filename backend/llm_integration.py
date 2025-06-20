from langchain.llms import Ollama
from langchain.prompts import PromptTemplate

llm = Ollama(model="llama3")

PROCESS_ANALYSIS_PROMPT = """
Analyze this process mining data and provide insights:
{data}

Focus on:
1. Identifying bottlenecks
2. Process inefficiencies
3. Optimization opportunities
4. Key metrics summary
"""

def generate_llm_response(text_input, file_data=None):
    prompt = PromptTemplate(
        template=PROCESS_ANALYSIS_PROMPT,
        input_variables=["data"]
    )
    return llm(prompt.format(
        data=file_data['content'] if file_data else text_input
    ))
