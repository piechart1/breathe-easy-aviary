#!/usr/bin/env python3
"""Print Breathe Easy Aviary's position for each search term in the Australian App Store.

Uses Apple's public iTunes Search API, which tracks the App Store app's own
search closely but not exactly. Positions past 200 show as "-".

    python3 marketing/check-ranks.py                # the default terms below
    python3 marketing/check-ranks.py "box breathing" "cyclic sighing"
"""
import json
import subprocess
import sys
import urllib.parse

APP_ID = 6806774681
COUNTRY = "au"
DEFAULT_TERMS = [
    "breathe easy", "breathing", "box breathing", "4-7-8 breathing", "cyclic sighing",
    "resonance breathing", "coherent breathing", "breathwork", "buteyko", "tummo",
    "ujjayi", "breathing exercises", "breathing for sleep", "anxiety breathing",
]

for term in sys.argv[1:] or DEFAULT_TERMS:
    url = "https://itunes.apple.com/search?" + urllib.parse.urlencode(
        {"term": term, "country": COUNTRY, "entity": "software", "limit": 200}
    )
    # curl rather than urllib: the python.org build of Python on macOS has no CA certificates by default.
    results = json.loads(subprocess.check_output(["curl", "-s", url]))["results"]
    position = next((i + 1 for i, app in enumerate(results) if app["trackId"] == APP_ID), None)
    print(f"{term:24} {position or '-'}")
