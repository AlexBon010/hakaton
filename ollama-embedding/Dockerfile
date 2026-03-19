FROM ollama/ollama

RUN ollama serve & \
    sleep 15 && \
    ollama pull bge-m3:567m && \
    ollama pull nomic-embed-text-v2-moe && \
    pkill ollama || true

EXPOSE 11434
