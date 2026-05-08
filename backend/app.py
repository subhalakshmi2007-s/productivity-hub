# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from database import db
import uuid

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'super-secret-productivity-key-change-in-prod'
jwt = JWTManager(app)

# Import and register auth blueprint
from auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api')

# ---------- TASKS API ----------
@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user = get_jwt_identity()
    tasks = db.get_user_tasks(current_user)
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def add_task():
    current_user = get_jwt_identity()
    data = request.get_json()
    title = data.get('title', '').strip()
    category = data.get('category', 'Other')
    completed = data.get('completed', False)
    
    if not title:
        return jsonify({'error': 'Task title required'}), 400
    
    tasks = db.get_user_tasks(current_user)
    new_task = {
        'id': len(tasks) + 1,
        'title': title,
        'category': category,
        'completed': completed
    }
    # Ensure unique id
    if tasks:
        new_task['id'] = max(t['id'] for t in tasks) + 1
    else:
        new_task['id'] = 1
        
    tasks.append(new_task)
    db.save_user_tasks(current_user, tasks)
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user = get_jwt_identity()
    tasks = db.get_user_tasks(current_user)
    data = request.get_json()
    completed = data.get('completed')
    
    for task in tasks:
        if task['id'] == task_id:
            task['completed'] = completed
            db.save_user_tasks(current_user, tasks)
            return jsonify(task)
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user = get_jwt_identity()
    tasks = db.get_user_tasks(current_user)
    new_tasks = [t for t in tasks if t['id'] != task_id]
    if len(new_tasks) == len(tasks):
        return jsonify({'error': 'Task not found'}), 404
    db.save_user_tasks(current_user, new_tasks)
    return jsonify({'message': 'Deleted'}), 200

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Todo App Backend is starting...")
    print("="*50)
    print("\n✅ Backend running on: http://localhost:5000")
    print("✅ Open frontend at: http://localhost:8000/login.html")
    print("\n⚠️  Keep this window open!")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)