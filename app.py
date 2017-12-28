import os

from flask import Flask, render_template

app = Flask(__name__)
jinja_options = app.jinja_options.copy()
jinja_options.update(dict(
    block_start_string='<%',
    block_end_string='%>',
    variable_start_string='%%',
    variable_end_string='%%',
    comment_start_string='<#',
    comment_end_string='#>',
))
app.jinja_options = jinja_options

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
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host=host, port=port, debug=DEBUG)
