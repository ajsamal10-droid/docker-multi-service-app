from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/")
def home():
    return jsonify(message="hello from a small image")
