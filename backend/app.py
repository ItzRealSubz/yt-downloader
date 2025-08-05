from flask import Flask, request, send_file, jsonify
import yt_dlp
import os
import traceback

app = Flask(__name__)
DOWNLOAD_DIR = "/tmp/downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route("/download", methods=["POST"])
def download():
    try:
        data = request.json
        url = data.get("url")
        format_type = data.get("format")
        quality = data.get("quality")

        if not url:
            return jsonify({"error": "Missing URL"}), 400

        filename = "output"
        output_path = os.path.join(DOWNLOAD_DIR, filename + ".%(ext)s")

        if format_type == "mp3":
            ydl_opts = {
                'format': 'bestaudio',
                'outtmpl': output_path,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': quality,
                }]
            }
        else:
            resolution_map = {
                "480p": "bestvideo[height<=480]+bestaudio/best[height<=480]",
                "720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
                "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
            }
            ydl_opts = {
                'format': resolution_map.get(quality, "best"),
                'outtmpl': output_path,
                'merge_output_format': 'mp4'
            }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            info = ydl.extract_info(url, download=False)

        title = info.get("title", "download")
        ext = "mp3" if format_type == "mp3" else "mp4"
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '.', '_', '-')).rstrip()
        final_path = os.path.join(DOWNLOAD_DIR, f"{safe_title}.{ext}")

        # Rename downloaded file
        for f in os.listdir(DOWNLOAD_DIR):
            if f.startswith("output") and f.endswith(ext):
                os.rename(os.path.join(DOWNLOAD_DIR, f), final_path)
                break

        return send_file(final_path, as_attachment=True)

    except Exception as e:
        print("🔥 Error during download:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
