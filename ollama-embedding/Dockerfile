FROM ollama/ollama

# Pre-pull embedding model at build time
RUN ollama serve & \
    sleep 15 && \
    ollama pull bge-m3:567m && \
    pkill ollama || true

EXPOSE 11434
