import sys
import yt_dlp

log_info = 'INFO - ' 
log_error = 'ERROR - '

def download_video(url, filename, vid_quality):
    ydl_opts = {
        'format': vid_quality,
        'outtmpl': output_name
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python download_video.py <URL> <filename> <quality>")
        sys.exit(1)

    video_url = sys.argv[1]
    output_name = sys.argv[2]
    vid_quality = sys.argv[3]
    downloaded = False

    if sys.argv[3] == '':
        vid_quality = '\"18/best[height<=360]\"'

    try:
        download_video(video_url, output_name, vid_quality)
        downloaded = True
    except Exception as e:
        print(f"{log_error} {e}")

    if downloaded:
        print(f"{log_info} Downloaded: {output_name}")