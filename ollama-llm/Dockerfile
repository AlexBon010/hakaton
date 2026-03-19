FROM ollama/ollama

# Pre-pull LLM model for text analysis and change detection (qwen2.5:7b-instruct)
RUN ollama serve & \
    sleep 15 && \
    ollama pull qwen2.5:7b-instruct && \
    pkill ollama || true

EXPOSE 11434
