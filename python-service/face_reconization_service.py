from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import face_recognition
import dlib
from scipy.spatial import distance
import os
import glob

app = Flask(__name__)
CORS(app)

# Global variables
detector = dlib.get_frontal_face_detector()
predictor = None  # dlib shape predictor

# Blink parameters
EAR_THRESHOLD = 0.25
BLINK_CONSEC_FRAMES = 1
MAX_BLINKS_REQUIRED = 2

known_face_encodings = []
known_face_metadata = []


def calculate_ear(eye):
    """Calculate Eye Aspect Ratio (EAR)"""
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear


def load_known_faces():
    """Load all student faces from uploads folder"""
    global known_face_encodings, known_face_metadata

    print("🔄 Reloading known faces...")
    known_face_encodings = []
    known_face_metadata = []

    uploads_path = "/home/aman-singh/IdeaProjects/smart-attendance-backend/src/main/resources/static/uploads/*.jpg"

    image_files = glob.glob(uploads_path)
    print(f"📁 Found {len(image_files)} image files")

    for image_path in image_files:
        try:
            filename = os.path.basename(image_path)
            roll_no = filename.split('_')[0]

            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)

            if encodings:
                known_face_encodings.append(encodings[0])
                known_face_metadata.append({
                    'rollNo': roll_no,
                    'filename': filename
                })
                print(f"✅ Loaded face for roll {roll_no} from {filename}")
        except Exception as e:
            print(f"❌ Error loading {image_path}: {e}")

    print(f"🎉 Loaded {len(known_face_encodings)} known faces!")


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'known_faces_count': len(known_face_encodings),
        'ear_threshold': EAR_THRESHOLD,
        'required_blinks': MAX_BLINKS_REQUIRED
    })


@app.route('/reload-faces', methods=['POST'])
def reload_faces():
    load_known_faces()
    return jsonify({
        'success': True,
        'message': f'Loaded {len(known_face_encodings)} known faces',
        'faces': [meta['rollNo'] for meta in known_face_metadata]
    })


@app.route('/detect-sequence', methods=['POST'])
def detect_blink_sequence():
    """Face match + real blink detection"""
    try:
        print("🔍 Processing frame sequence...")
        files = request.files.getlist('images')

        if not files:
            return jsonify({'matched': False, 'message': 'No frames received', 'blinks': 0}), 400

        # Decode frames
        frames = []
        for f in files:
            if f.filename:
                file_bytes = np.frombuffer(f.read(), np.uint8)
                frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
                if frame is not None:
                    frames.append(frame)

        if not frames:
            return jsonify({'matched': False, 'message': 'No valid frames', 'blinks': 0}), 400

        print(f"📸 Processing {len(frames)} frames")

        # STEP 1: FACE MATCHING
        rgb_frame = cv2.cvtColor(frames[0], cv2.COLOR_BGR2RGB)
        face_encodings = face_recognition.face_encodings(rgb_frame)

        matched_student = None
        if face_encodings:
            face_encoding = face_encodings[0]
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)

            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if face_distances[best_match_index] < 0.6:
                    matched_student = known_face_metadata[best_match_index]
                    print(f"✅ Face matched: {matched_student['rollNo']} (distance: {face_distances[best_match_index]:.3f})")

        if not matched_student:
            print("❌ No face match found")
            return jsonify({
                'matched': False,
                'message': 'Face not recognized in database',
                'blinks': 0,
                'totalFrames': len(frames)
            })

        # STEP 2: BLINK DETECTION
        blink_count = 0
        consec_closed = 0

        for i, frame in enumerate(frames):
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector(gray)

            if len(faces) == 0:
                continue

            face = faces[0]
            landmarks = predictor(gray, face)

            left_eye = [(landmarks.part(n).x, landmarks.part(n).y) for n in range(36, 42)]
            right_eye = [(landmarks.part(n).x, landmarks.part(n).y) for n in range(42, 48)]

            left_ear = calculate_ear(left_eye)
            right_ear = calculate_ear(right_eye)
            ear = (left_ear + right_ear) / 2.0

            if ear < EAR_THRESHOLD:
                consec_closed += 1
                print(f"Frame {i}: EAR={ear:.3f}, CLOSED consec={consec_closed}")
            else:
                if consec_closed >= BLINK_CONSEC_FRAMES:
                    blink_count += 1
                    print(f"✅ BLINK #{blink_count} detected (frames closed={consec_closed})")
                consec_closed = 0

        if consec_closed >= BLINK_CONSEC_FRAMES:
            blink_count += 1
            print(f"✅ BLINK #{blink_count} detected at end (frames closed={consec_closed})")

        print(f"🎯 FINAL RESULT: {blink_count} blinks detected (need {MAX_BLINKS_REQUIRED})")

        if blink_count < MAX_BLINKS_REQUIRED:
            return jsonify({
                'matched': True,
                'rollNo': matched_student['rollNo'],
                'studentName': matched_student['rollNo'],
                'blinks': blink_count,
                'totalFrames': len(frames),
                'requiredBlinks': MAX_BLINKS_REQUIRED,
                'message': f'Blink not enough: {blink_count}/{MAX_BLINKS_REQUIRED}'
            })

        return jsonify({
            'matched': True,
            'rollNo': matched_student['rollNo'],
            'studentName': matched_student['rollNo'],
            'blinks': blink_count,
            'totalFrames': len(frames),
            'requiredBlinks': MAX_BLINKS_REQUIRED,
            'message': 'Face recognized and blinks verified!'
        })

    except Exception as e:
        print(f"❌ ERROR in detect-sequence: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'matched': False,
            'error': str(e),
            'blinks': 0
        }), 500


if __name__ == '__main__':
    predictor_path = os.path.join(os.path.dirname(__file__), "shape_predictor_68_face_landmarks.dat")
    if os.path.exists(predictor_path):
        predictor = dlib.shape_predictor(predictor_path)
        print("✅ dlib predictor loaded from", predictor_path)
    else:
        print("⚠️ WARNING: shape_predictor_68_face_landmarks.dat not found at", predictor_path)

    load_known_faces()
    print("🚀 Flask service starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
