import type { WritingPrompt } from "./types";

export const writingPrompts: WritingPrompt[] = [
  {
    id: "education-online-learning",
    taskType: "academic-task-2",
    theme: "education",
    title: "Online learning",
    instruction: "Write at least 250 words.",
    question:
      "Some people believe that online learning is more effective than classroom learning. To what extent do you agree or disagree?",
    planningHints: ["State your position clearly.", "Compare online flexibility with classroom interaction.", "Use one concrete example."]
  },
  {
    id: "technology-children-screens",
    taskType: "academic-task-2",
    theme: "technology",
    title: "Children and screen time",
    instruction: "Write at least 250 words.",
    question:
      "Many children spend a large amount of time using smartphones and tablets. What are the causes of this, and what effects can it have?",
    planningHints: ["Explain two causes.", "Describe one short-term and one long-term effect.", "End with a clear judgement."]
  },
  {
    id: "environment-public-transport",
    taskType: "academic-task-2",
    theme: "environment",
    title: "Public transport",
    instruction: "Write at least 250 words.",
    question:
      "Governments should invest more money in public transport rather than building new roads. Discuss both views and give your own opinion.",
    planningHints: ["Discuss both sides.", "Give your opinion in the introduction and conclusion.", "Mention congestion or pollution."]
  },
  {
    id: "work-four-day-week",
    taskType: "academic-task-2",
    theme: "work",
    title: "Four-day work week",
    instruction: "Write at least 250 words.",
    question:
      "Some people think employees should work four days a week instead of five. Do the advantages outweigh the disadvantages?",
    planningHints: ["Decide whether advantages outweigh disadvantages.", "Cover productivity and business cost.", "Use balanced linking."]
  },
  {
    id: "society-older-people",
    taskType: "academic-task-2",
    theme: "society",
    title: "Ageing population",
    instruction: "Write at least 250 words.",
    question:
      "In many countries, the number of older people is increasing. What problems does this cause, and what solutions can governments introduce?",
    planningHints: ["Identify two problems.", "Match each problem with a solution.", "Keep the conclusion practical."]
  },
  {
    id: "health-fast-food",
    taskType: "academic-task-2",
    theme: "health",
    title: "Fast food and health",
    instruction: "Write at least 250 words.",
    question:
      "Some people believe governments should regulate fast food to improve public health. Others think people should make their own choices. Discuss both views and give your opinion.",
    planningHints: ["Discuss freedom of choice and public health.", "State your own view.", "Use examples such as taxes, labels, or school meals."]
  }
];
