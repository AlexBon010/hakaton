FROM ollama/ollama

RUN ollama serve & \
    sleep 15 && \
    ollama pull bge-m3:567m && \
    ollama pull B-A-M-N/qwen3-reranker-0.6b-fp16 && \
    pkill ollama || true

EXPOSE 11434
