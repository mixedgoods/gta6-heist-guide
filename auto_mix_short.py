import os
import random
import subprocess
import glob

WORKSPACE = r"C:\Users\Shawn\Desktop\gta6heistguide"
MUSIC_VAULT = os.path.join(WORKSPACE, "Flow_Music_Vault")
VIDEO_VAULT = os.path.join(WORKSPACE, "Flow_Video_Vault")

def run_command(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[-] Error executing: {cmd}\n{result.stderr}")
    return result.returncode == 0

def process_short(vo_path, screen_recording_path, output_path):
    music_files = glob.glob(os.path.join(MUSIC_VAULT, "*.mp3"))
    video_files = glob.glob(os.path.join(VIDEO_VAULT, "*.mp4"))

    if not music_files or not video_files:
        print("[-] Vaults are missing assets. Run harvester first.")
        return

    selected_music = random.choice(music_files)
    selected_broll = random.choice(video_files)

    print(f"[+] Selected Background Track: {os.path.basename(selected_music)}")
    print(f"[+] Selected B-Roll Loop: {os.path.basename(selected_broll)}")

    filter_complex = (
        f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];"
        f"[1:v]scale=900:-1[vid];"
        f"[bg][vid]overlay=(W-w)/2:(H-h)/2,"
        f"drawtext=text='gta6heistguide.com - Elite Vault Intel':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=50[v]"
    )

    audio_complex = (
        f"[2:a]volume=1.0[vo];"
        f"[3:a]volume=0.15[music];" 
        f"[vo][music]amix=inputs=2:duration=first:dropout_transition=2[a]"
    )

    cmd = (
        f"ffmpeg -y -stream_loop -1 -i \"{selected_broll}\" "
        f"-i \"{screen_recording_path}\" "
        f"-i \"{vo_path}\" "
        f"-i \"{selected_music}\" "
        f"-filter_complex \"{filter_complex}; {audio_complex}\" "
        f"-map \"[v]\" -map \"[a]\" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k "
        f"\"{output_path}\""
    )

    print("[+] Rendering automated vertical short with FFmpeg...")
    if run_command(cmd):
        with open(output_path, "ab") as f:
            f.write(os.urandom(random.randint(16, 64)))
        print(f"[+] Successfully generated and hashed: {output_path}")

if __name__ == "__main__":
    print("[*] Automated Media Pipeline module ready for gta6heistguide workspace.")