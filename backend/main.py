import flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # type: ignore

app = flask.Flask(__name__)
CORS(app, origins=["https://embeddings.svana.name", "http://127.0.0.1:5173"])
limiter = Limiter(get_remote_address, app=app)


@app.route("/embeddings", methods=["POST"])
@limiter.limit("30 per minute")
def embeddings():
    post_data = flask.request.get_json()
    inputs = post_data.get("inputs", [])

    if not inputs:
        return flask.jsonify({"error": "No inputs provided"}), 400

    embeddings = model.encode(inputs)
    embeddings_list = embeddings.tolist()
    return flask.jsonify({"embeddings": embeddings_list})


if __name__ == "__main__":
    app.run(debug=True)
