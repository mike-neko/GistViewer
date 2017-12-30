import os
from datetime import datetime
from flask import Flask, url_for, render_template, redirect
from flask import session, make_response, request
from flask_oauthlib.client import OAuth
from werkzeug import security

SESSION_GITHUB_TOKEN = 'github_token'
COOKIE_LOGGED_IN = 'logged_in'

app = Flask(__name__, instance_relative_config=True)
# オプション設定
app.config.from_pyfile('api.cfg')
app.secret_key = os.urandom(24)
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


# OAuth
oauth = OAuth(app)
# Gist用の認証設定
github = oauth.remote_app(
    'github',
    base_url='https://api.github.com/',
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    request_token_params={
        'scope': 'gist',
        'state': lambda: security.gen_salt(10),
        'allow_signup': 'false',
    },
    request_token_url=None,
    request_token_method='GET',
    access_token_method='POST',
    app_key='GITHUB',
)

# サーバ毎の環境を設定
if os.getenv('VCAP_APP_PORT'):
    # Bluemix
    DEBUG = False
    host = '0.0.0.0'
    port = int(os.getenv('VCAP_APP_PORT'))
else:
    # ローカル
    DEBUG = True
    host = '127.0.0.1'
    port = 5000


@app.route('/')
def index():
    if SESSION_GITHUB_TOKEN in session:
        return render_template('index.html')
    else:
        logged = request.cookies.get(COOKIE_LOGGED_IN)
        if logged is not None and logged == 'true':
            # 一旦再認証を試す
            return redirect(url_for('login'))
        else:
            # ログアウト済
            return render_template('login.html')


# Githubの認証へ飛ばす
@app.route('/login')
def login():
    scheme = 'https' if not DEBUG else 'http'
    url = url_for('.authorized', _external=True, _scheme=scheme)
    return github.authorize(callback=url)


# 認証からのコールバック先
@app.route('/authorized')
def authorized():
    resp = github.authorized_response()
    if resp is None:
        # FIXME: !!!
        return render_template('login.html')

    # 認証成功
    session[SESSION_GITHUB_TOKEN] = (resp['access_token'], '')
    result = make_response(redirect(url_for('index')))
    max_age = 60 * 60 * 24 * 30
    expires = int(datetime.now().timestamp()) + max_age
    result.set_cookie(COOKIE_LOGGED_IN, 'true', max_age=max_age, expires=expires)
    return result


@app.route('/logout')
def logout():
    session.pop(SESSION_GITHUB_TOKEN, None)

    result = make_response(redirect(url_for('index')))
    result.set_cookie(COOKIE_LOGGED_IN, '', expires=0)
    return result


@github.tokengetter
def get_github_oauth_token():
    return session.get(SESSION_GITHUB_TOKEN)


if __name__ == '__main__':
    app.run(host=host, port=port, debug=DEBUG)
