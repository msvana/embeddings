FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ADD ./pyproject.toml /app/pyproject.toml
ADD ./uv.lock /app/uv.lock
ADD ./README.md /app/README.md

WORKDIR /app
RUN uv sync --frozen

ADD . /app/
RUN uv run python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

EXPOSE 5000
ENTRYPOINT [ "uv", "run", "python" ,"main.py" ]

