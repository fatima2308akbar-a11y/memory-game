"""
Minimal, standalone launcher for Game 3 ("Web of Memory") only.

This is NOT the real Spidey Sense app -- it's a trimmed personal deploy so
you can preview/share just your one game behind a simple password, without
Google OAuth, QR scanning, a database, or games 1/2/4/bonus.

Login is a single hardcoded username/password pair, in plain text, in this
file. That's fine for "share a link with friends to preview my game" but
is NOT secure enough for anything you actually care about protecting --
don't reuse this pattern for the real event submission.

Auth is done via plain HTTP Basic Auth -- the browser's own native
username/password popup (the "site says / Username / Password" dialog),
not a custom HTML page. That's on purpose: no login page to style, no
session cookie, the browser handles everything.
"""
from functools import wraps

from flask import Flask, Response, render_template, request, jsonify

app = Flask(__name__)

USERNAME = "spiderman"
PASSWORD = "game3"

GAME_INFO = {"title": "Web of Memory", "number": "III"}


def _authenticated():
    auth = request.authorization
    return auth is not None and auth.username == USERNAME and auth.password == PASSWORD


def _prompt_login():
    # 401 + WWW-Authenticate is what makes the browser pop up its native
    # username/password dialog. There's no HTML involved on our end.
    return Response(
        "Login required.",
        401,
        {"WWW-Authenticate": 'Basic realm="Spidey Sense - Game 3"'},
    )


def requires_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not _authenticated():
            return _prompt_login()
        return view(*args, **kwargs)
    return wrapped


@app.route("/")
@requires_auth
def index():
    return render_template(
        "games/game3.html",
        game_id="3",
        game_info=GAME_INFO,
        token="local-dev-token",
        progress={"completed": []},
        main_sequence=["3"],  # only this game's dot shows -- no 1/2/4/bonus implied
    )


@app.route("/game/3")
@requires_auth
def game3():
    return render_template(
        "games/game3.html",
        game_id="3",
        game_info=GAME_INFO,
        token="local-dev-token",
        progress={"completed": []},
        main_sequence=["3"],  # only this game's dot shows -- no 1/2/4/bonus implied
    )


@app.route("/complete-game", methods=["POST"])
@requires_auth
def complete_game():
    payload = request.get_json(silent=True) or {}
    if payload.get("game_id") != "3":
        return jsonify({"status": "error", "message": "Unexpected game_id"}), 400
    # No anti-cheat token check here on purpose -- this deploy has no real
    # session/timer state to validate it against. Just acknowledge the win.
    return jsonify({"status": "ok", "redirect": "/done"})


@app.route("/done")
@requires_auth
def done():
    return render_template("done.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
