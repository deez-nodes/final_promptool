import type { Draft, DraftMode, SectionColor, SectionStyle, HeadingLevel } from "@/store/types"

export interface TemplateSection {
  name: string
  color: SectionColor
  style?: SectionStyle
  headingLevel?: HeadingLevel
  freeText?: string
  points?: string[]
  kept?: boolean
}

export interface PromptTemplate {
  id: string
  name: string
  group: string
  description: string
  mode: DraftMode
  sections: TemplateSection[]
}

export const TEMPLATE_GROUPS = [
  "Engineering",
  "Product",
  "Analysis",
  "Writing",
  "Replies",
]

export const TEMPLATES: PromptTemplate[] = [
  // Engineering
  {
    id: "code-review",
    name: "Code review",
    group: "Engineering",
    description: "Structured review with severity and rationale",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Senior engineer performing a focused code review.",
      },
      {
        name: "Context",
        color: "amber",
        freeText:
          "Describe the change, the language and framework, and what the author was trying to achieve.",
      },
      {
        name: "What to review",
        color: "sky",
        points: [
          "Correctness: edge cases, error paths, off-by-one errors",
          "Security: untrusted input, auth checks, injection",
          "Readability: naming, structure, dead code",
          "Performance: avoidable work on hot paths",
        ],
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Do not rewrite the whole file; suggest the smallest viable change",
          "Cite the specific line you are referring to",
          "Separate must-fix problems from preferences",
        ],
      },
      {
        name: "Output",
        color: "green",
        points: [
          "Lead with the single most important issue",
          "For each finding give: severity, location, why it matters, suggested fix",
        ],
      },
    ],
  },
  {
    id: "bug-investigation",
    name: "Bug investigation",
    group: "Engineering",
    description: "Reproduce, isolate, and propose a root-cause fix",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Debugging partner who reasons from evidence, not guesses.",
      },
      {
        name: "Symptom",
        color: "rose",
        freeText: "What happens, what was expected, and how reliably it reproduces.",
      },
      {
        name: "Evidence",
        color: "amber",
        points: [
          "Error message or stack trace",
          "Relevant code path",
          "Recent changes that could be related",
          "Environment and versions",
        ],
      },
      {
        name: "Approach",
        color: "sky",
        points: [
          "State the most likely cause and the reasoning behind it",
          "List hypotheses in order of likelihood",
          "Propose the cheapest experiment that distinguishes them",
          "Give the fix only after the cause is identified",
        ],
      },
      {
        name: "Constraints",
        color: "slate",
        points: [
          "Do not guess about code you have not been shown",
          "Say explicitly what information is missing",
        ],
      },
    ],
  },
  {
    id: "feature-implementation",
    name: "Feature implementation",
    group: "Engineering",
    description: "Plan then build a feature end to end",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Pragmatic senior developer who ships working code.",
      },
      {
        name: "Goal",
        color: "green",
        freeText:
          "Describe the feature from the user's point of view: what they can do that they could not before.",
      },
      {
        name: "Stack",
        color: "slate",
        points: [
          "Language and framework",
          "Existing patterns and conventions to follow",
          "Files or modules that are relevant",
        ],
      },
      {
        name: "Requirements",
        color: "sky",
        points: [
          "The happy path in concrete steps",
          "Edge cases and empty states that must be handled",
          "What must not break",
        ],
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Follow the existing structure and naming",
          "No new dependencies without asking",
          "Keep the change scoped to the request",
        ],
      },
    ],
  },
  {
    id: "refactor-plan",
    name: "Refactor plan",
    group: "Engineering",
    description: "Safe, incremental restructuring with no behaviour change",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Staff engineer planning a refactor that ships safely.",
      },
      {
        name: "Current state",
        color: "amber",
        freeText: "Describe what exists today and what is painful about it.",
      },
      {
        name: "Target state",
        color: "green",
        freeText: "Describe the structure you want to end up with and why.",
      },
      {
        name: "Rules",
        color: "rose",
        points: [
          "Behaviour must not change",
          "Each step must leave the codebase working",
          "Do not mix refactoring with feature work",
          "Preserve the public interface unless asked otherwise",
        ],
      },
      {
        name: "Output",
        color: "sky",
        points: [
          "Ordered list of steps, each independently reviewable",
          "Name the files touched in each step",
          "State how to verify nothing broke",
        ],
      },
    ],
  },
  {
    id: "architecture-decision",
    name: "Architecture decision",
    group: "Engineering",
    description: "Compare options and land on a recommendation",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Architect who favours boring, well-understood solutions.",
      },
      {
        name: "Decision",
        color: "amber",
        freeText: "State the decision that needs to be made in one sentence.",
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Team size and experience",
          "Scale and traffic expectations",
          "Budget, timeline, and operational limits",
          "Existing systems this must fit with",
        ],
      },
      {
        name: "Options",
        color: "sky",
        points: [
          "List at least three realistic options, including doing nothing",
          "For each: how it works, cost, risks, and when it is the right choice",
        ],
      },
      {
        name: "Output",
        color: "green",
        points: [
          "Recommend one option and justify it against the constraints",
          "Name the trade-off you are accepting",
          "Describe what would change your mind",
        ],
      },
    ],
  },
  {
    id: "test-generation",
    name: "Test generation",
    group: "Engineering",
    description: "Meaningful tests that would actually catch regressions",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Engineer who writes tests that fail for the right reasons.",
      },
      {
        name: "Subject",
        color: "amber",
        freeText: "The function, module, or component under test, plus its contract.",
      },
      {
        name: "Coverage",
        color: "sky",
        points: [
          "Typical inputs",
          "Boundary values",
          "Invalid and empty inputs",
          "Failure and error paths",
        ],
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Test behaviour, not implementation details",
          "One clear assertion per test where possible",
          "Match the existing test framework and style",
          "No tests that pass no matter what the code does",
        ],
      },
    ],
  },
  {
    id: "documentation",
    name: "Documentation",
    group: "Engineering",
    description: "Clear docs written for the actual reader",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Technical writer who explains without condescending.",
      },
      {
        name: "Audience",
        color: "amber",
        freeText: "Who reads this, what they already know, and what they need to do next.",
      },
      {
        name: "Content",
        color: "sky",
        points: [
          "What it is and why it exists",
          "How to get started, with a complete working example",
          "Common tasks and how to do them",
          "Pitfalls and how to avoid them",
        ],
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Short sentences and concrete examples over abstract description",
          "Define jargon on first use",
          "Do not document behaviour you have not been told about",
        ],
      },
    ],
  },

  // Product
  {
    id: "prd",
    name: "Product requirements",
    group: "Product",
    description: "Turn a rough idea into a buildable spec",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Product manager who writes specs engineers can build from.",
      },
      {
        name: "Problem",
        color: "rose",
        freeText: "Who is hurting, how badly, and what they do today instead.",
      },
      {
        name: "Outcome",
        color: "green",
        freeText: "The measurable change in user behaviour that signals success.",
      },
      {
        name: "Requirements",
        color: "sky",
        points: [
          "Core flow described step by step",
          "Explicit non-goals for this version",
          "Edge cases and failure states",
        ],
      },
      {
        name: "Constraints",
        color: "amber",
        points: [
          "Timeline and scope limits",
          "Technical or policy limits",
          "What is explicitly out of scope",
        ],
      },
    ],
  },
  {
    id: "user-interview",
    name: "User interview",
    group: "Product",
    description: "Questions that surface real behaviour, not opinions",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Researcher who asks about what people did, not what they would like.",
      },
      {
        name: "Goal",
        color: "green",
        freeText: "The specific uncertainty this conversation is meant to reduce.",
      },
      {
        name: "Questions",
        color: "sky",
        points: [
          "Walk me through the last time you did this",
          "What did you try before that",
          "What was the hardest part",
          "What happened when it went wrong",
          "If this disappeared tomorrow, what would you do instead",
        ],
      },
      {
        name: "Rules",
        color: "rose",
        points: [
          "Never ask whether they would use a hypothetical feature",
          "Ask follow-up questions about specifics and feelings",
          "Do not lead the participant toward an answer",
        ],
      },
    ],
  },

  // Analysis
  {
    id: "data-analysis",
    name: "Data analysis",
    group: "Analysis",
    description: "Rigorous read of a dataset or result set",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Analyst who distrusts convenient conclusions.",
      },
      {
        name: "Question",
        color: "green",
        freeText: "The exact question the data is meant to answer.",
      },
      {
        name: "Data",
        color: "amber",
        freeText: "What the dataset contains, how it was collected, and what is missing.",
      },
      {
        name: "Method",
        color: "sky",
        points: [
          "State assumptions before calculating",
          "Check for missing, duplicated, or mislabelled data",
          "Distinguish correlation from causation explicitly",
          "Give uncertainty alongside every estimate",
        ],
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Do not invent numbers",
          "Say when the data cannot answer the question",
        ],
      },
    ],
  },
  {
    id: "decision-memo",
    name: "Decision memo",
    group: "Analysis",
    description: "Weigh trade-offs and commit to a call",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Advisor who gives a clear recommendation, not a survey.",
      },
      {
        name: "Situation",
        color: "amber",
        freeText: "The decision, the deadline, and who it affects.",
      },
      {
        name: "Options",
        color: "sky",
        points: [
          "Each realistic option with its cost and benefit",
          "What you give up by choosing it",
        ],
      },
      {
        name: "Output",
        color: "green",
        points: [
          "One recommendation, stated plainly",
          "The strongest argument against it",
          "The first concrete step to take",
        ],
      },
    ],
  },
  {
    id: "explainer",
    name: "Deep explainer",
    group: "Analysis",
    description: "Understand a hard concept from first principles",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Teacher who builds understanding from the ground up.",
      },
      {
        name: "Topic",
        color: "amber",
        freeText: "What you want to understand, and the level you are starting from.",
      },
      {
        name: "Approach",
        color: "sky",
        points: [
          "Start with the problem it solves before the mechanism",
          "Use one running concrete example throughout",
          "Introduce jargon only after the idea is clear",
          "Point out the common misconception",
        ],
      },
      {
        name: "Check",
        color: "green",
        points: [
          "End with three questions that test real understanding",
          "Flag anything that is a simplification rather than the truth",
        ],
      },
    ],
  },

  // Writing
  {
    id: "editing",
    name: "Sharp editing",
    group: "Writing",
    description: "Tighten prose without losing the voice",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Editor who cuts without flattening the writer's voice.",
      },
      {
        name: "Text",
        color: "amber",
        freeText: "Paste the draft here.",
      },
      {
        name: "Priorities",
        color: "sky",
        points: [
          "Clarity before elegance",
          "Cut anything that does not earn its place",
          "Keep the author's voice and intent",
        ],
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Preserve every factual claim",
          "Do not add ideas that were not there",
          "Explain each substantive change briefly",
        ],
      },
    ],
  },
  {
    id: "professional-email",
    name: "Professional email",
    group: "Writing",
    description: "Clear and courteous, however awkward the message",
    mode: "base",
    sections: [
      {
        name: "Role",
        color: "purple",
        freeText: "Writer who is direct without being cold.",
      },
      {
        name: "Situation",
        color: "amber",
        freeText: "Who you are writing to, your relationship, and what happened.",
      },
      {
        name: "Goal",
        color: "green",
        freeText: "What you need from them, and by when.",
      },
      {
        name: "Tone",
        color: "sky",
        points: [
          "Match the recipient's seniority and formality",
          "No filler openers or fake enthusiasm",
          "One clear ask, stated early",
        ],
      },
      {
        name: "Constraints",
        color: "rose",
        points: [
          "Under 150 words unless the situation demands more",
          "Do not apologise for things that are not your fault",
        ],
      },
    ],
  },

  // Replies
  {
    id: "course-correct",
    name: "Course correct",
    group: "Replies",
    description: "Steer a running task back on track",
    mode: "reply",
    sections: [
      {
        name: "Mode",
        color: "purple",
        kept: true,
        freeText: "Course correction mid-task. Do not restart or re-plan from scratch.",
      },
      {
        name: "What went wrong",
        color: "rose",
        freeText: "Describe the drift: what it did that it should not have, or missed.",
      },
      {
        name: "What to keep",
        color: "green",
        points: [
          "The parts of the existing work that are still correct",
        ],
      },
      {
        name: "What to change",
        color: "amber",
        points: [
          "The specific adjustments to make from here",
        ],
      },
      {
        name: "Constraints",
        color: "slate",
        points: [
          "Do not undo work that was already correct",
          "Ask before making assumptions about intent",
        ],
      },
    ],
  },
  {
    id: "scope-check",
    name: "Scope check",
    group: "Replies",
    description: "Stop a task sprawling beyond what was asked",
    mode: "reply",
    sections: [
      {
        name: "Mode",
        color: "purple",
        kept: true,
        freeText: "Scope check. Keep the change minimal and on task.",
      },
      {
        name: "In scope",
        color: "green",
        points: ["What was actually requested"],
      },
      {
        name: "Out of scope",
        color: "rose",
        points: [
          "Everything else that has crept in: refactors, renames, extra features, speculative work",
        ],
      },
      {
        name: "Directions",
        color: "sky",
        points: [
          "Revert anything outside the request",
          "Make the smallest change that satisfies it",
          "Note good ideas separately instead of implementing them",
        ],
      },
    ],
  },
  {
    id: "ship-review",
    name: "Pre-ship review",
    group: "Replies",
    description: "Final check before calling something done",
    mode: "reply",
    sections: [
      {
        name: "Mode",
        color: "purple",
        kept: true,
        freeText: "Final review before this is considered complete.",
      },
      {
        name: "Delivered",
        color: "green",
        points: ["What is actually finished and working"],
      },
      {
        name: "Not delivered",
        color: "rose",
        points: [
          "Anything claimed but not done, broken, or unfinished",
        ],
      },
      {
        name: "Verification",
        color: "sky",
        points: [
          "How each thing was checked",
          "What was not tested and why",
          "Known gaps or risks",
        ],
      },
      {
        name: "Constraints",
        color: "slate",
        points: [
          "Report failures plainly rather than describing them as done",
          "Do not claim verification that did not happen",
        ],
      },
    ],
  },
]

export function getTemplate(id: string): PromptTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function createDraftFromTemplate(template: PromptTemplate): Draft {
  return {
    title: template.name,
    sections: template.sections.map((t) => ({
      id: crypto.randomUUID(),
      name: t.name,
      color: t.color,
      style: t.style ?? "heading",
      headingLevel: t.headingLevel ?? 1,
      collapsed: false,
      kept: t.kept ?? false,
      points: (t.points ?? []).map((text) => ({
        id: crypto.randomUUID(),
        text,
      })),
      freeText: t.freeText ?? "",
    })),
  }
}
