from flask import Flask,send_from_directory, render_template
from flask_socketio import SocketIO, emit
from threading import Thread,Event

import cv2
import mediapipe as mp
import pyautogui
import numpy as np
import time

app = Flask(__name__, template_folder='.')

socketio = SocketIO(app)
stop_event = Event()
stop_event.set()
    
@app.route('/<path:filename>') 
def serve_static_file(filename):
    return send_from_directory('.', filename)

@app.route('/')
def index():
    return render_template('index.html')

#the flask default port is 5000
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    #if not hasattr(socketio, 'background_task'):
    #    socketio.background_task = Thread(target=generate_hand_data)
    #    socketio.background_task.daemon = True
    #    socketio.background_task.start()

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('start_camera')
def handle_start_camera():
    global stop_event
    if stop_event.is_set():
        print("Start camera")
        stop_event.clear()
        socketio.start_background_task(target=generate_hand_data)
    emit('status', {'status': 'Camera started'})

@socketio.on('stop_camera')
def handle_stop_camera():
    global stop_event
    if not stop_event.is_set():
        print("Stop camera")
        stop_event.set()
    emit('status', {'status': 'Camera stopped'})
    
def generate_hand_data():    
    # 初始化 Mediapipe 手部检测模块
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands()
    cap = cv2.VideoCapture(0)

    mp_drawing = mp.solutions.drawing_utils

    # 打开摄像头
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280) 
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720) 
    
    #screen_width = 1920  # 你可以根据你的屏幕分辨率调整
    #screen_height = 1080  # 你可以根据你的屏幕分辨率调整
    screen_width, screen_height = pyautogui.size()
    print(f"Screen resolution: {screen_width}x{screen_height}")
    #screen_width = 2560  # 你可以根据你的屏幕分辨率调整
    #screen_height = 1440  # 你可以根据你的屏幕分辨率调整
    # 初始化滑动平均窗口
    window_size = 3
    positions = []

    # 定义缩放因子
    scale_factor = 1.3
    relative_threshold = 0.05
    target_fps = 30
    frame_interval = 1.0 / target_fps

    while not stop_event.is_set() and cap.isOpened():
        start_time = time.time()
        success, image = cap.read()
        if not success:
            print("无法从摄像头获取帧。")
            break

        # 镜像处理
        image = cv2.flip(image, 1)

        # 将图像从 BGR 转为 RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # 将图像传递给 Mediapipe 进行处理
        results = hands.process(image)

        # 将图像再从 RGB 转回 BGR，便于 OpenCV 显示
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
              mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # 提取关键点坐标
            index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]

            # 将 Mediapipe 坐标转换为屏幕坐标，并应用缩放因子
            screen_x = max(0, int((index_tip.x + thumb_tip.x) / 2 * screen_width * scale_factor)-int(screen_width)*(scale_factor-1)/2)
            screen_y = max(0, int((index_tip.y + thumb_tip.y) / 2 * screen_height * scale_factor)-int(screen_height)*(scale_factor-1)/2)

            # 存储最新的位置
            positions.append((screen_x, screen_y))
            if len(positions) > window_size:
                positions.pop(0)

            # 计算滑动平均后的鼠标位置
            avg_x = int(np.mean([pos[0] for pos in positions]))
            avg_y = int(np.mean([pos[1] for pos in positions]))

            # 移动鼠标
            pyautogui.moveTo(avg_x, avg_y)
            
            distance = ((thumb_tip.x - index_tip.x) ** 2 + (thumb_tip.y - index_tip.y) ** 2) ** 0.5
            click_event = distance < relative_threshold
            if click_event: 
                pyautogui.click()
            #socketio.emit('hand_data', {'x': avg_x, 'y': avg_y, 'click': click_event})
            
        # 显示图像
        cv2.imshow('Hand Gesture Mouse Control', image)
        elapsed_time = time.time() - start_time
        sleep_time = max(1, (frame_interval - elapsed_time)*1000)
        #print(sleep_time)
        cv2.waitKey(int(sleep_time))
        # 使用 cv2.waitKey 等待超时事件
        #if cv2.waitKey(10) & 0xFF == 27:  # 等待10毫秒
        #    break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    socketio.run(app, debug=True)
