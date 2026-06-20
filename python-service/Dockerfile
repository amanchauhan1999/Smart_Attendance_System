FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake libopenblas-dev liblapack-dev \
    libx11-dev libgtk-3-dev libboost-python-dev wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download face landmark model
RUN wget -q http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2 \
    && bunzip2 shape_predictor_68_face_landmarks.dat.bz2 \
    && rm -f shape_predictor_68_face_landmarks.dat.bz2

COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
