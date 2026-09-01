export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Economics",
  "Physics",
  "Biology",
  "Psychology",
] as const;

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"] as const;

export const COURSE_COLORS = [
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
];

export const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#f43f5e", "#8b5cf6", "#14b8a6", "#f97316",
  "#64748b", "#db2777",
];

export const FILE_ICONS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOC",
  doc: "DOC",
  pptx: "PPT",
  ppt: "PPT",
  md: "MD",
  txt: "TXT",
  png: "IMG",
  jpg: "IMG",
  jpeg: "IMG",
  zip: "ZIP",
};

export const MAX_UPLOAD_SIZE = 25 * 1024 * 1024; // 25MB
