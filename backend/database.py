# backend/database.py
import json
import os
from threading import Lock

# Simple JSON file-based database
class Database:
    def __init__(self):
        self.users_file = 'users.json'
        self.tasks_file = 'tasks.json'
        self.lock = Lock()
        self._init_files()
    
    def _init_files(self):
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump({}, f)
        if not os.path.exists(self.tasks_file):
            with open(self.tasks_file, 'w') as f:
                json.dump({}, f)
    
    def _read_json(self, file):
        with self.lock:
            with open(file, 'r') as f:
                return json.load(f)
    
    def _write_json(self, file, data):
        with self.lock:
            with open(file, 'w') as f:
                json.dump(data, f, indent=2)
    
    # Users
    def get_user(self, username):
        users = self._read_json(self.users_file)
        return users.get(username)
    
    def create_user(self, username, hashed_password):
        users = self._read_json(self.users_file)
        if username in users:
            return False
        users[username] = hashed_password
        self._write_json(self.users_file, users)
        return True
    
    # Tasks
    def get_user_tasks(self, username):
        all_tasks = self._read_json(self.tasks_file)
        return all_tasks.get(username, [])
    
    def save_user_tasks(self, username, tasks):
        all_tasks = self._read_json(self.tasks_file)
        all_tasks[username] = tasks
        self._write_json(self.tasks_file, all_tasks)

db = Database()