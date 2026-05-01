import argparse
import json
import math
import wave


def read_wav(path):
    with wave.open(path, "rb") as wav:
        channels = wav.getnchannels()
        sample_rate = wav.getframerate()
        sample_width = wav.getsampwidth()
        frames = wav.readframes(wav.getnframes())
    if sample_width != 2:
        raise ValueError("Only 16-bit PCM WAV audio is supported for local signal extraction.")

    samples = []
    step = sample_width * channels
    for index in range(0, len(frames), step):
        channel_values = []
        for channel in range(channels):
            start = index + channel * sample_width
            value = int.from_bytes(frames[start : start + sample_width], "little", signed=True)
            channel_values.append(value / 32768)
        samples.append(sum(channel_values) / len(channel_values))
    return samples, sample_rate


def rms(chunk):
    if not chunk:
        return 0
    return math.sqrt(sum(sample * sample for sample in chunk) / len(chunk))


def contiguous_regions(flags, frame_seconds):
    regions = []
    start = None
    for index, active in enumerate(flags):
        if active and start is None:
            start = index
        if start is not None and (not active or index == len(flags) - 1):
            end_index = index + 1 if active and index == len(flags) - 1 else index
            regions.append(
                {
                    "start": round(start * frame_seconds, 2),
                    "end": round(end_index * frame_seconds, 2),
                    "duration": round((end_index - start) * frame_seconds, 2),
                }
            )
            start = None
    return regions


def main():
    parser = argparse.ArgumentParser(description="Extract simple IELTS speaking audio signals from WAV.")
    parser.add_argument("audio_path")
    parser.add_argument("--frame-ms", type=int, default=100)
    parser.add_argument("--silence-threshold", type=float, default=0.012)
    parser.add_argument("--min-pause-ms", type=int, default=500)
    args = parser.parse_args()

    samples, sample_rate = read_wav(args.audio_path)
    frame_size = max(1, int(sample_rate * args.frame_ms / 1000))
    frame_seconds = args.frame_ms / 1000
    duration = len(samples) / sample_rate if sample_rate else 0
    energies = [rms(samples[index : index + frame_size]) for index in range(0, len(samples), frame_size)]
    speech_flags = [energy >= args.silence_threshold for energy in energies]
    silence_flags = [not flag for flag in speech_flags]
    speech_regions = contiguous_regions(speech_flags, frame_seconds)
    silence_regions = [
        region
        for region in contiguous_regions(silence_flags, frame_seconds)
        if region["duration"] >= args.min_pause_ms / 1000
    ]

    speech_seconds = sum(region["duration"] for region in speech_regions)
    long_pauses = [region for region in silence_regions if region["duration"] >= 1.0]
    hesitation_clusters = [
        {
            "start": max(0, round(region["start"] - 0.4, 2)),
            "end": round(region["end"] + 0.4, 2),
            "pauseDuration": region["duration"],
        }
        for region in silence_regions
        if region["duration"] >= 0.7
    ]

    print(
        json.dumps(
            {
                "source": "local-wav-rms",
                "durationSeconds": round(duration, 2),
                "speechSeconds": round(speech_seconds, 2),
                "silenceSeconds": round(max(0, duration - speech_seconds), 2),
                "speechRatio": round(speech_seconds / duration, 3) if duration else 0,
                "longPauses": long_pauses,
                "pauseCount": len(silence_regions),
                "longPauseCount": len(long_pauses),
                "hesitationClusters": hesitation_clusters,
                "setupNote": "Audio signal extraction currently supports WAV. WebM/other formats need ffmpeg conversion first.",
            }
        )
    )


if __name__ == "__main__":
    main()
