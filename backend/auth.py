# backend/auth.py
from flask import Blueprint, request, jsonify
import bcrypt
from database import db
from flask_jwt_extended import create_access_token

# Create the blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if len(password) < 3:
        return jsonify({'error': 'Password too short (min 3 chars)'}), 400
    
    existing = db.get_user(username)
    if existing:
        return jsonify({'error': 'Username already exists'}), 409
    
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    success = db.create_user(username, hashed)
    if success:
        return jsonify({'message': 'User registered successfully'}), 201
    return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    stored_hash = db.get_user(username)
    if not stored_hash:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
        access_token = create_access_token(identity=username)
        return jsonify({'token': access_token, 'username': username}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401