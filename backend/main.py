import flask
from sentence_transformers import SentenceTransformer

app = flask.Flask(__name__)
model = SentenceTransformer("all-MiniLM-L6-v2")  # type: ignore


@app.route("/embeddings", methods=["POST"])
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
