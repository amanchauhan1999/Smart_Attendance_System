FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir dlib-bin==19.24.6 face-recognition-models==0.3.0
RUN pip install --no-cache-dir --no-deps face-recognition==1.3.0
RUN pip install --no-cache-dir Flask==3.0.3 flask-cors==4.0.1 opencv-python-headless==4.10.0.84 numpy==1.26.4 scipy==1.13.1 Pillow==10.4.0 Werkzeug==3.1.8 Jinja2==3.1.6 itsdangerous==2.2.0 click==8.4.1 blinker==1.9.0 MarkupSafe==3.0.3

RUN wget -q http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2 \
    && bunzip2 shape_predictor_68_face_landmarks.dat.bz2 \
    && rm -f shape_predictor_68_face_landmarks.dat.bz2

COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
