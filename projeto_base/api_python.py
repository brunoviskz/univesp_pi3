from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DB_PASSWORD

app = Flask(__name__)
CORS(app)  # Habilita CORS para todos os endpoints


def get_db_connection(host, port, database, user, password):
    try:
        connection = psycopg2.connect(
            host=host, port=port, database=database, user=user, password=password
        )
        return connection
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None


@app.route("/clientes-univesp", methods=["GET"])
def get_clientes():
    host = "dpg-d0ged83uibrs73fi0sjg-a.oregon-postgres.render.com"
    port = "5432"
    database = "univesp"
    user = "pi3"
    password = DB_PASSWORD()

    connection = get_db_connection(host, port, database, user, password)
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM clientes;")
        clientes = cursor.fetchall()
        return jsonify(clientes)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    app.run(port=5000, debug=True)
