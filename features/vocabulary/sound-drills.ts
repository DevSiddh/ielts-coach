export type SoundDrill = {
  id: string;
  label: string;
  focus: string;
  tip: string;
  words: string[];
};

export const soundDrills: SoundDrill[] = [
  {
    id: "th",
    label: "th",
    focus: "Tongue between teeth",
    tip: "Keep the tongue light between the teeth; do not replace it with t or d.",
    words: ["think", "three", "through", "although", "weather", "clothes"]
  },
  {
    id: "v-w",
    label: "v / w",
    focus: "Lip-teeth vs rounded lips",
    tip: "For v, touch top teeth to lower lip. For w, round both lips without touching teeth.",
    words: ["very", "voice", "value", "water", "work", "weather"]
  },
  {
    id: "r-l",
    label: "r / l",
    focus: "Tongue position",
    tip: "For l, touch behind the teeth. For r, pull the tongue back and keep it from touching.",
    words: ["right", "light", "really", "library", "career", "culture"]
  },
  {
    id: "sh-ch",
    label: "sh / ch",
    focus: "Soft stream vs stop-release",
    tip: "Sh is smooth air. Ch starts with a small stop, then releases.",
    words: ["ship", "cheap", "share", "chair", "schedule", "culture"]
  },
  {
    id: "silent-letters",
    label: "silent letters",
    focus: "Do not pronounce hidden letters",
    tip: "English spelling often shows letters that disappear in speech.",
    words: ["debt", "subtle", "island", "receipt", "foreign", "queue"]
  },
  {
    id: "stress",
    label: "stress",
    focus: "One syllable is stronger",
    tip: "Make the stressed syllable clearer, longer, and slightly louder.",
    words: ["analysis", "develop", "opportunity", "photograph", "pronunciation", "entrepreneur"]
  },
  {
    id: "vowels",
    label: "long / short vowels",
    focus: "Length changes meaning",
    tip: "Hold long vowels a little longer; keep short vowels quick and relaxed.",
    words: ["ship", "sheep", "sit", "seat", "full", "fool"]
  }
];
