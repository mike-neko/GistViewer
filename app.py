import os

from flask import Flask

app = Flask(__name__)
if os.getenv('VCAP_APP_PORT'):
    DEBUG = False
    host = '0.0.0.0'
    port = int(os.getenv('VCAP_APP_PORT'))
else:
    DEBUG = True
    host = '127.0.0.1'
    port = 5000


@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run(host=host, port=port, debug=DEBUG)
