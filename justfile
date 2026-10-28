port := "8080"

# serve with live reload (refreshes the browser on file save)
default:
    bunx live-server --port={{port}} --no-browser

# plain static server, no reload, no deps
serve:
    python3 -m http.server {{port}}
