# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Stage 2: Production Python Backend + Serving Frontend
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV HOST=0.0.0.0
ENV PORT=8000
ENV PYTHONPATH=/app/backend

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

