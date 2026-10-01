#!/usr/bin/env python3
"""Local server with clean routes. No packages required.

  python3 serve.py

  /                         home
  /about                    about
  /collections              collections
  /collections/marble-look  one collection
  /inspiration              gallery
  /contact                  visit
"""

import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8080"))

PAGES = {
    "": "index.html",
    "about": "about.html",
    "collections": "collections.html",
    "inspiration": "inspiration.html",
    "contact": "contact.html",
}

LEGACY = {
    "index.html": "/",
    "about.html": "/about",
    "collections.html": "/collections",
    "inspiration.html": "/inspiration",
    "contact.html": "/contact",
}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        self._route()
        if self.path is not None:
            super().do_GET()

    def do_HEAD(self):
        self._route()
        if self.path is not None:
            super().do_HEAD()

    def _route(self):
        parsed = urlparse(self.path)
        raw = unquote(parsed.path)
        path = raw.strip("/")
        query = ("?" + parsed.query) if parsed.query else ""

        if path in LEGACY:
            target = LEGACY[path]
            if path == "collections.html" or path == "inspiration.html":
                target += query
            self._redirect(target)
            self.path = None
            return

        if path == "collection.html":
            chosen = parse_qs(parsed.query).get("id", [""])[0]
            self._redirect("/collections/" + chosen if chosen else "/collections")
            self.path = None
            return

        if raw != "/" and raw.endswith("/"):
            self._redirect("/" + path + query)
            self.path = None
            return

        parts = path.split("/") if path else []
        page = PAGES.get(path)
        if page is None and len(parts) == 2 and parts[0] == "collections" and parts[1]:
            page = "collection.html"
            query = ""

        if page:
            self.path = "/" + page + query

    def _redirect(self, location):
        self.send_response(301)
        self.send_header("Location", location)
        self.end_headers()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("Gangavati Tiles http://127.0.0.1:%s" % PORT)
    server.serve_forever()
