export type UserDTO = {
  id: string;
  name: string;
  email: string;
  department: string;
  bio: string;
  year: string;
  avatarColor: string;
<<<<<<< HEAD
  role?: "student" | "admin";
  emailVerified?: boolean;
=======
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
};

export type CourseDTO = {
  id: string;
  code: string;
  name: string;
  department: string;
  professor: string;
  semester: string;
  description: string;
  color: string;
  createdById: string | null;
  createdAt: string;
  memberCount: number;
  noteCount: number;
  joined: boolean;
};

export type NoteDTO = {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  courseColor: string;
  department: string;
  uploaderId: string;
  uploaderName: string;
  uploaderColor: string;
  uploaderDepartment: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  tags: string[];
  downloads: number;
  likes: number;
  commentCount: number;
  liked: boolean;
  bookmarked: boolean;
  isScan: boolean;
  createdAt: string;
};

export type CommentDTO = {
  id: string;
  noteId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  content: string;
  createdAt: string;
};

export type ConversationDTO = {
  id: string;
  otherId: string;
  otherName: string;
  otherColor: string;
  otherDepartment: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSenderId: string | null;
  unreadCount: number;
};

export type MessageDTO = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  content: string;
  createdAt: string;
  pending?: boolean;
};

<<<<<<< HEAD
/** The only user shape exposed to another user. Never add private account fields here. */
export type PublicProfileDTO = {
  id: string;
  name: string;
  department: string;
  bio: string;
  year: string;
  avatarColor: string;
=======
export type StudentDTO = UserDTO & {
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  noteCount: number;
  likeCount: number;
};

<<<<<<< HEAD
export type StudentDTO = PublicProfileDTO;

=======
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
export type DashboardDTO = {
  stats: {
    myNotes: number;
    totalDownloads: number;
    totalLikes: number;
    coursesJoined: number;
  };
  feed: NoteDTO[];
  trendingCourses: CourseDTO[];
<<<<<<< HEAD
  topContributors: PublicProfileDTO[];
=======
  topContributors: StudentDTO[];
>>>>>>> e04521ffaa2aa3b64df73fd7d66c755ff8e512dd
  recentBookmarks: NoteDTO[];
};
