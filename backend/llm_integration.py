from langchain.llms import Ollama

llm = Ollama(model="llama3")

def generate_llm_response(text_input, file_data=None):
    prompt = f"""
    Analyze this process data:
    {text_input}
    {file_data['content'][:1000] if file_data else ''}
    """
    return llm(prompt)
