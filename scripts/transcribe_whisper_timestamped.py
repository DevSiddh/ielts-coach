import argparse
import json
import os
from pathlib import Path
import sys


def configure_ffmpeg_path() -> None:
    configured = os.environ.get("IELTS_COACH_FFMPEG")
    if configured:
        ffmpeg_dir = str(Path(configured).parent)
    else:
        ffmpeg_dir = str(Path.cwd() / "ffmpeg-8.1-essentials_build" / "bin")

    if Path(ffmpeg_dir).exists():
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")


def main() -> int:
    parser = argparse.ArgumentParser(description="Transcribe IELTS speaking audio with whisper-timestamped.")
    parser.add_argument("audio_path")
    parser.add_argument("--model", default="base.en")
    parser.add_argument("--language", default="en")
    parser.add_argument("--vad", action="store_true")
    args = parser.parse_args()
    configure_ffmpeg_path()

    try:
        import whisper_timestamped as whisper
    except ImportError:
        print(
            json.dumps(
                {
                    "error": "whisper-timestamped is not installed. Run: python -m pip install -r requirements-transcription.txt"
                }
            ),
            file=sys.stderr,
        )
        return 2

    try:
        audio = whisper.load_audio(args.audio_path)
        model = whisper.load_model(args.model)
        result = whisper.transcribe(
            model,
            audio,
            language=args.language,
            detect_disfluencies=True,
            compute_word_confidence=True,
            vad=args.vad,
            beam_size=5,
            best_of=5,
            temperature=0,
        )
    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 1

    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
