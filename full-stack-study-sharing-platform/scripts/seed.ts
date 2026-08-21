import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import {
  users,
  courses,
  enrollments,
  notes,
  noteLikes,
  bookmarks,
  comments,
  conversations,
  conversationMembers,
  messages,
  sessions,
} from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { sql } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/* Minimal valid one-page PDF generator (with xref table)              */
/* ------------------------------------------------------------------ */
function makePdf(title: string, lines: string[]): Buffer {
  const esc = (s: string) =>
    s.replace(/[^\x20-\x7E]/g, "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const wrap = (s: string, max = 82): string[] => {
    const words = s.split(" ");
    const out: string[] = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > max) {
        out.push(cur.trim());
        cur = w;
      } else cur = (cur + " " + w).trim();
    }
    if (cur) out.push(cur.trim());
    return out.length ? out : [""];
  };
  const flat = lines.flatMap((l) => wrap(l));
  const parts: string[] = [];
  let y = 742;
  parts.push(`BT /F1 18 Tf 56 ${y} Td (${esc(title)}) Tj ET`);
  y -= 36;
  for (const ln of flat.slice(0, 34)) {
    parts.push(`BT /F1 10.5 Tf 56 ${y} Td (${esc(ln)}) Tj ET`);
    y -= 16;
  }
  const stream = parts.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++)
    out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(out, "latin1");
}

const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

async function main() {
  console.log("Clearing existing data…");
  await db.delete(messages);
  await db.delete(conversationMembers);
  await db.delete(conversations);
  await db.delete(comments);
  await db.delete(bookmarks);
  await db.delete(noteLikes);
  await db.delete(notes);
  await db.delete(enrollments);
  await db.delete(courses);
  await db.delete(sessions);
  await db.delete(users);

  const pw = hashPassword("password123");

  /* ------------------------------ users ----------------------------- */
  const people = [
    { key: "maya", name: "Maya Chen", email: "maya@university.edu", department: "Computer Science", year: "3rd Year", color: "#6366f1", bio: "CS junior. Systems nerd, occasional ML tourist. Sharing notes since day one." },
    { key: "jonas", name: "Jonas Weber", email: "jonas@university.edu", department: "Computer Science", year: "3rd Year", color: "#0ea5e9", bio: "Algorithms enjoyer. Ask me about dynamic programming." },
    { key: "aisha", name: "Aisha Bello", email: "aisha@university.edu", department: "Computer Science", year: "2nd Year", color: "#f43f5e", bio: "OS and low-level stuff. Building an operating system for fun." },
    { key: "diego", name: "Diego Fuentes", email: "diego@university.edu", department: "Computer Science", year: "4th Year", color: "#8b5cf6", bio: "Databases, distributed systems, and film photography." },
    { key: "priya", name: "Priya Nair", email: "priya@university.edu", department: "Mathematics", year: "2nd Year", color: "#10b981", bio: "Mathematics major. LaTeX wizard. My notes have citations." },
    { key: "tom", name: "Tom Becker", email: "tom@university.edu", department: "Mathematics", year: "3rd Year", color: "#f59e0b", bio: "Probability and statistics. Tutoring on weekends." },
    { key: "elena", name: "Elena Rossi", email: "elena@university.edu", department: "Electrical Engineering", year: "2nd Year", color: "#14b8a6", bio: "Circuits, signals, and synthesizers." },
    { key: "sam", name: "Sam Okafor", email: "sam@university.edu", department: "Electrical Engineering", year: "3rd Year", color: "#f97316", bio: "Embedded systems. I talk to microcontrollers." },
    { key: "laura", name: "Laura Kim", email: "laura@university.edu", department: "Mechanical Engineering", year: "3rd Year", color: "#db2777", bio: "Thermo and fluids. Rocket team structures lead." },
    { key: "omar", name: "Omar Haddad", email: "omar@university.edu", department: "Economics", year: "2nd Year", color: "#64748b", bio: "Econometrics and coffee. Data-curious." },
    { key: "sofia", name: "Sofia Petrova", email: "sofia@university.edu", department: "Physics", year: "3rd Year", color: "#0ea5e9", bio: "Classical mechanics survivor. Quantum soon." },
    { key: "ben", name: "Ben Carter", email: "ben@university.edu", department: "Biology", year: "2nd Year", color: "#10b981", bio: "Genetics and bioinformatics. Lab rat (affectionate)." },
    { key: "nina", name: "Nina Johansson", email: "nina@university.edu", department: "Psychology", year: "2nd Year", color: "#f43f5e", bio: "Cognitive psych. I study memory and then forget my keys." },
    { key: "mateo", name: "Mateo Silva", email: "mateo@university.edu", department: "Mathematics", year: "4th Year", color: "#6366f1", bio: "Real analysis enjoyer. Grad school applications season." },
  ];
  const userIds: Record<string, string> = {};
  for (const p of people) {
    const [row] = await db
      .insert(users)
      .values({ name: p.name, email: p.email, passwordHash: pw, department: p.department, year: p.year, avatarColor: p.color, bio: p.bio })
      .returning({ id: users.id });
    userIds[p.key] = row.id;
  }
  console.log(`Inserted ${people.length} users`);

  /* ----------------------------- courses ---------------------------- */
  const courseData = [
    { key: "cs201", code: "CS201", name: "Data Structures", department: "Computer Science", professor: "Prof. R. Iyer", color: "#6366f1", by: "maya", description: "Linked lists, trees, heaps, hash tables and the trade-offs between them. Weekly labs in C++." },
    { key: "cs301", code: "CS301", name: "Design & Analysis of Algorithms", department: "Computer Science", professor: "Prof. D. Klein", color: "#0ea5e9", by: "jonas", description: "Greedy, divide & conquer, dynamic programming, NP-completeness and reductions." },
    { key: "cs315", code: "CS315", name: "Database Systems", department: "Computer Science", professor: "Prof. M. Osei", color: "#8b5cf6", by: "diego", description: "Relational algebra, SQL, normalization, indexing, transactions and query optimization." },
    { key: "cs350", code: "CS350", name: "Operating Systems", department: "Computer Science", professor: "Prof. L. Zhang", color: "#f43f5e", by: "aisha", description: "Processes, threads, scheduling, memory management, file systems and synchronization." },
    { key: "cs410", code: "CS410", name: "Machine Learning", department: "Computer Science", professor: "Prof. A. Novak", color: "#10b981", by: "diego", description: "Regression, classification, trees, ensembles, neural networks and model evaluation." },
    { key: "ma101", code: "MA101", name: "Calculus I", department: "Mathematics", professor: "Prof. H. Weiss", color: "#f59e0b", by: "priya", description: "Limits, derivatives, integrals, and the fundamental theorem of calculus." },
    { key: "ma204", code: "MA204", name: "Linear Algebra", department: "Mathematics", professor: "Prof. T. Adeyemi", color: "#14b8a6", by: "priya", description: "Vector spaces, eigenvalues, orthogonality, SVD and applications." },
    { key: "ma260", code: "MA260", name: "Probability & Statistics", department: "Mathematics", professor: "Prof. S. Lindqvist", color: "#f97316", by: "tom", description: "Random variables, distributions, estimation, hypothesis testing and regression." },
    { key: "ee220", code: "EE220", name: "Circuit Analysis", department: "Electrical Engineering", professor: "Prof. V. Moreau", color: "#0ea5e9", by: "elena", description: "Nodal and mesh analysis, Thevenin equivalents, AC steady-state, transient response." },
    { key: "ee320", code: "EE320", name: "Signals & Systems", department: "Electrical Engineering", professor: "Prof. K. Tanaka", color: "#8b5cf6", by: "sam", description: "LTI systems, Fourier series and transforms, Laplace and Z transforms, sampling." },
    { key: "me210", code: "ME210", name: "Thermodynamics", department: "Mechanical Engineering", professor: "Prof. C. Alvarez", color: "#f43f5e", by: "laura", description: "Energy, entropy, cycles, power and refrigeration systems, psychrometrics." },
    { key: "ec201", code: "EC201", name: "Microeconomics", department: "Economics", professor: "Prof. N. O'Connell", color: "#10b981", by: "omar", description: "Consumer and producer theory, market structures, welfare and externalities." },
    { key: "ec310", code: "EC310", name: "Econometrics", department: "Economics", professor: "Prof. J. Duarte", color: "#f59e0b", by: "omar", description: "OLS, inference, instrumental variables, panel data and causal identification." },
    { key: "ph150", code: "PH150", name: "Classical Mechanics", department: "Physics", professor: "Prof. E. Baranov", color: "#6366f1", by: "sofia", description: "Newtonian mechanics, energy, momentum, oscillations, Lagrangian formalism." },
    { key: "bio220", code: "BIO220", name: "Genetics", department: "Biology", professor: "Prof. F. Ndlovu", color: "#14b8a6", by: "ben", description: "Mendelian and molecular genetics, gene regulation, genomics and technologies." },
    { key: "psyc240", code: "PSYC240", name: "Cognitive Psychology", department: "Psychology", professor: "Prof. A. Kowalski", color: "#f97316", by: "nina", description: "Attention, memory, language, problem solving and decision making." },
  ];
  const courseIds: Record<string, string> = {};
  for (const c of courseData) {
    const [row] = await db
      .insert(courses)
      .values({ code: c.code, name: c.name, department: c.department, professor: c.professor, color: c.color, description: c.description, createdById: userIds[c.by] })
      .returning({ id: courses.id });
    courseIds[c.key] = row.id;
  }
  console.log(`Inserted ${courseData.length} courses`);

  /* --------------------------- enrollments -------------------------- */
  const enrolleeMap: Record<string, string[]> = {
    cs201: ["maya", "jonas", "aisha", "diego"],
    cs301: ["maya", "jonas", "diego"],
    cs315: ["maya", "diego", "aisha"],
    cs350: ["maya", "aisha", "jonas"],
    cs410: ["jonas", "diego", "maya"],
    ma101: ["priya", "tom", "mateo"],
    ma204: ["priya", "tom", "mateo", "maya"],
    ma260: ["tom", "priya", "mateo", "omar"],
    ee220: ["elena", "sam"],
    ee320: ["elena", "sam"],
    me210: ["laura"],
    ec201: ["omar"],
    ec310: ["omar", "tom"],
    ph150: ["sofia"],
    bio220: ["ben"],
    psyc240: ["nina"],
  };
  for (const [ck, members] of Object.entries(enrolleeMap)) {
    for (const m of members) {
      await db.insert(enrollments).values({ userId: userIds[m], courseId: courseIds[ck] }).onConflictDoNothing();
    }
  }
  console.log("Enrollments done");

  /* ------------------------------ notes ----------------------------- */
  type SeedNote = {
    course: string; by: string; title: string; desc: string; tags: string[];
    downloads: number; ageH: number; kind?: "pdf" | "md"; scan?: boolean;
  };
  const noteData: SeedNote[] = [
    { course: "cs201", by: "jonas", title: "Lecture 12 — AVL Trees & Rotations (annotated)", desc: "Full walkthrough of AVL insertion with LL/RR/LR/RL rotations, height proofs, and the tricky double-rotation example from class.", tags: ["lecture-notes", "trees", "avl"], downloads: 189, ageH: 3 * 24 },
    { course: "cs201", by: "maya", title: "Problem Set 5 — Hash Tables solutions", desc: "My worked solutions for PS5 including open addressing probe sequences, load-factor analysis, and the collision-counting bonus question.", tags: ["solutions", "hashing", "problem-set"], downloads: 145, ageH: 6 * 24 },
    { course: "cs201", by: "aisha", title: "Midterm 2024 past exam + grading key", desc: "Scanned past midterm with the official grading key attached. The red-black tree deletion question comes up every year — learn it.", tags: ["past-exam", "midterm"], downloads: 231, ageH: 12 * 24, scan: true },
    { course: "cs301", by: "maya", title: "Dynamic Programming patterns cheat sheet", desc: "One-pager of the 8 DP patterns that cover ~90% of Klein's exam questions: LIS, knapsack variants, interval DP, DP on trees, bitmasking.", tags: ["cheat-sheet", "dp", "exam-prep"], downloads: 342, ageH: 2 * 24 },
    { course: "cs301", by: "jonas", title: "Lectures 1–9 condensed summary", desc: "Everything from asymptotic analysis through greedy exchange arguments, condensed to 12 pages with all proofs sketched.", tags: ["summary", "greedy", "complexity"], downloads: 178, ageH: 8 * 24 },
    { course: "cs301", by: "diego", title: "NP-Completeness reductions practice problems", desc: "14 reduction problems with hints, ranked by difficulty. Includes the 3SAT → CLIQUE → VERTEX-COVER chain in full detail.", tags: ["np-complete", "practice", "reductions"], downloads: 97, ageH: 15 * 24 },
    { course: "cs315", by: "diego", title: "Normalization masterclass — 1NF to BCNF", desc: "Step-by-step decomposition guide with 6 fully worked examples. Includes the functional-dependency closure algorithm and a printable worksheet.", tags: ["normalization", "bcnf", "guide"], downloads: 210, ageH: 4 * 24 },
    { course: "cs315", by: "maya", title: "SQL practice — 50 queries with answers", desc: "50 queries over the university schema from basic joins to correlated subqueries, window functions and recursive CTEs. Answer key at the back.", tags: ["sql", "practice", "window-functions"], downloads: 264, ageH: 1 * 24 },
    { course: "cs315", by: "aisha", title: "Transactions & concurrency control notes", desc: "Serializability theory, 2PL vs timestamp ordering, deadlock detection protocols, and isolation levels as implemented in PostgreSQL.", tags: ["transactions", "concurrency"], downloads: 88, ageH: 9 * 24 },
    { course: "cs350", by: "aisha", title: "Synchronization problems cookbook", desc: "Producer-consumer, readers-writers, dining philosophers (4 solutions!), sleeping barber — each with semaphores, monitors, and common pitfalls.", tags: ["synchronization", "semaphores", "guide"], downloads: 301, ageH: 5 * 24 },
    { course: "cs350", by: "maya", title: "Memory management — paging explained with diagrams", desc: "Virtual memory deep dive: multi-level page tables, TLB mechanics, page replacement algorithms with frame-by-frame walkthroughs.", tags: ["memory", "paging", "diagrams"], downloads: 156, ageH: 7 * 24 },
    { course: "cs350", by: "jonas", title: "Final exam review session notes (whiteboard scan)", desc: "Scans from the final review session — scheduling algorithm speedrun, file system layout, and the classic ABA problem discussion.", tags: ["final", "review", "scan"], downloads: 122, ageH: 20 * 24, scan: true },
    { course: "cs410", by: "diego", title: "Gradient descent visualized — from scratch", desc: "Derivations for linear/logistic regression with learning-rate experiments and the bias-variance tradeoff, all with clean visualizations.", tags: ["ml", "gradient-descent", "visual"], downloads: 198, ageH: 3 * 24 },
    { course: "cs410", by: "jonas", title: "Midterm formula sheet (allowed!)", desc: "The one-page formula sheet I used for the midterm: Bayes rules, MSE/MAE, entropy & information gain, perceptron updates, k-means.", tags: ["formula-sheet", "midterm"], downloads: 276, ageH: 11 * 24 },
    { course: "ma204", by: "priya", title: "Eigenvalues & diagonalization — complete notes", desc: "Typeset notes covering characteristic polynomials, algebraic vs geometric multiplicity, diagonalization criteria, and spectral theorem.", tags: ["eigenvalues", "typeset", "complete"], downloads: 187, ageH: 2 * 24 },
    { course: "ma204", by: "tom", title: "SVD workshop — theory + applications handout", desc: "SVD from first principles: geometric interpretation, Eckart-Young theorem, PCA connection and image compression demo.", tags: ["svd", "pca", "workshop"], downloads: 143, ageH: 6 * 24 },
    { course: "ma260", by: "tom", title: "Every distribution you'll need, tabulated", desc: "PMF/PDF, support, mean, variance, MGF for 16 distributions. Plus: which one to use when, in a decision tree.", tags: ["distributions", "reference", "cheat-sheet"], downloads: 225, ageH: 4 * 24 },
    { course: "ma260", by: "priya", title: "Hypothesis testing worked examples", desc: "Z-tests, t-tests, chi-square, ANOVA — 20 worked examples with assumptions checklist for each. Errors to avoid highlighted.", tags: ["hypothesis-testing", "examples"], downloads: 132, ageH: 10 * 24 },
    { course: "ee320", by: "elena", title: "Fourier transforms visual companion", desc: "Intuition-first treatment: time-frequency duality, all transform pairs plotted, convolution illustrated with animations described frame by frame.", tags: ["fourier", "visual", "transforms"], downloads: 167, ageH: 5 * 24 },
    { course: "ee220", by: "sam", title: "Lab 4 report — RC transient response", desc: "Full lab report with oscilloscope captures, theoretical vs measured time constants, error analysis. Got 98 — steal the format.", tags: ["lab-report", "rc-circuits"], downloads: 94, ageH: 13 * 24, scan: true },
    { course: "ec310", by: "omar", title: "OLS derivations + Gauss-Markov proof", desc: "Matrix-based OLS derivation, unbiasedness and efficiency proofs, heteroskedasticity-robust errors, plus R/Stata code snippets.", tags: ["ols", "proofs", "econometrics"], downloads: 118, ageH: 8 * 24 },
    { course: "ph150", by: "sofia", title: "Lagrangian mechanics crash course", desc: "From D'Alembert's principle to the Euler-Lagrange equations in 10 pages, with the double pendulum worked end-to-end.", tags: ["lagrangian", "crash-course"], downloads: 156, ageH: 7 * 24 },
    { course: "bio220", by: "ben", title: "Gene regulation — lac operon and beyond", desc: "Lac/trp operons, enhancers, epigenetic mechanisms with clean figures. Includes the CRISPR lecture summary everyone asked for.", tags: ["gene-regulation", "crisp"], downloads: 76, ageH: 9 * 24 },
    { course: "psyc240", by: "nina", title: "Memory systems — lecture pack (weeks 1–6)", desc: "Working memory models, encoding vs retrieval, long-term potentiation basics, forgetting curves and study strategies that actually work.", tags: ["memory", "lecture-pack"], downloads: 84, ageH: 14 * 24, kind: "md" },
  ];

  const noteIds: { id: string; byKey: string; index: number }[] = [];
  for (let i = 0; i < noteData.length; i++) {
    const n = noteData[i];
    const isMd = n.kind === "md";
    const slug = n.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
    const fileName = `seed-${slug}.${isMd ? "md" : "pdf"}`;
    let buf: Buffer;
    if (isMd) {
      buf = Buffer.from(
        `# ${n.title}\n\n${n.desc}\n\n## Outline\n\n- Sensory memory and the modal model\n- Baddeley's working memory model\n- Encoding strategies: elaboration, chunking, dual coding\n- Retrieval practice and spacing effects\n- Ebbinghaus forgetting curve replications\n- Sleep and memory consolidation\n\n## Exam tips\n\nFocus on being able to *compare* models rather than recite them. The long-answer question is almost always applied: expect a clinical case study.\n\n> Shared via StudyShare`,
        "utf-8",
      );
    } else {
      buf = makePdf(n.title, [
        n.desc,
        "",
        `Course: ${courseData.find((c) => c.key === n.course)?.code} — ${courseData.find((c) => c.key === n.course)?.name}`,
        `Shared by ${people.find((p) => p.key === n.by)?.name} (${people.find((p) => p.key === n.by)?.department})`,
        `Tags: ${n.tags.join(", ")}`,
        "",
        "This is a placeholder document generated by the StudyShare seeder so that",
        "previews and downloads work out of the box. Upload a real file to replace it.",
        "",
        "StudyShare — share notes, ace exams, together.",
      ]);
    }
    fs.writeFileSync(path.join(uploadsDir, fileName), buf);
    const [row] = await db
      .insert(notes)
      .values({
        title: n.title,
        description: n.desc,
        courseId: courseIds[n.course],
        uploaderId: userIds[n.by],
        fileName,
        originalName: fileName.replace(/^seed-/, ""),
        fileType: isMd ? "md" : "pdf",
        fileSize: buf.length,
        tags: n.tags,
        downloads: n.downloads,
        isScan: Boolean(n.scan),
        createdAt: hoursAgo(n.ageH),
      })
      .returning({ id: notes.id });
    noteIds.push({ id: row.id, byKey: n.by, index: i });
  }
  console.log(`Inserted ${noteIds.length} notes`);

  /* ------------------------------- likes ---------------------------- */
  const noteIndexByKey = (idx: number) => noteIds.find((n) => n.index === idx)!;
  const likePlan: [number, string[]][] = [
    [0, ["maya", "aisha", "diego", "tom", "elena", "sofia"]],
    [1, ["jonas", "aisha", "priya", "laura", "nina", "ben", "omar"]],
    [2, ["maya", "jonas", "diego", "elena", "sam"]],
    [3, ["jonas", "aisha", "diego", "priya", "tom", "elena", "sam", "laura", "sofia", "ben"]],
    [5, ["maya", "aisha", "tom"]],
    [6, ["maya", "jonas", "elena", "omar", "nina"]],
    [7, ["jonas", "aisha", "priya", "sofia", "ben", "laura"]],
    [9, ["maya", "diego", "tom", "sofia"]],
    [10, ["jonas", "aisha", "diego", "elena", "sam", "laura"]],
    [12, ["maya", "jonas", "priya"]],
    [13, ["maya", "aisha", "diego", "tom", "nina", "ben", "elena", "laura"]],
    [14, ["maya", "jonas", "diego", "sofia", "omar"]],
    [16, ["maya", "priya", "omar", "nina", "sam"]],
    [18, ["sam", "maya", "sofia", "diego"]],
    [21, ["maya", "priya", "tom", "nina"]],
  ];
  for (const [idx, likers] of likePlan) {
    for (const lk of likers) {
      await db.insert(noteLikes).values({ userId: userIds[lk], noteId: noteIndexByKey(idx).id }).onConflictDoNothing();
    }
  }

  /* ---------------------------- bookmarks --------------------------- */
  for (const idx of [3, 6, 9, 13, 16]) {
    await db.insert(bookmarks).values({ userId: userIds.maya, noteId: noteIndexByKey(idx).id, createdAt: hoursAgo(idx + 2) }).onConflictDoNothing();
  }
  for (const idx of [0, 3]) {
    await db.insert(bookmarks).values({ userId: userIds.jonas, noteId: noteIndexByKey(idx).id }).onConflictDoNothing();
  }

  /* ---------------------------- comments ---------------------------- */
  const commentPlan: [number, string, string][] = [
    [3, "jonas", "This cheat sheet saved me on the midterm. The interval DP section is gold."],
    [3, "aisha", "Can confirm — 8 patterns covered 4 out of 5 exam questions."],
    [3, "priya", "Beautifully organized. Bookmarking the bitmasking section."],
    [7, "aisha", "The window functions part finally made it click for me. Thank you!"],
    [7, "diego", "Query 43 has a typo — should be HAVING not WHERE. Otherwise flawless."],
    [7, "maya", "Good catch, I'll fix it and re-upload tonight!"],
    [9, "maya", "The 4th dining philosophers solution with the waiter semaphore is so elegant."],
    [9, "diego", "Used this for the assignment — the pitfalls section prevented at least two deadlocks."],
    [0, "aisha", "The LR rotation diagram is way clearer than the slides."],
    [14, "diego", "Priya these are immaculate as always. The geometric multiplicity examples helped a ton."],
    [14, "maya", "Is there a follow-up on Jordan canonical form coming?"],
    [16, "omar", "The decision tree for choosing a distribution is genius."],
    [2, "maya", "That tree deletion question really does come back every year, thanks for scanning this."],
  ];
  for (const [idx, byKey, content] of commentPlan) {
    await db.insert(comments).values({ noteId: noteIndexByKey(idx).id, authorId: userIds[byKey], content, createdAt: hoursAgo(Math.max(1, noteIndexByKey(idx).index)) });
  }

  /* -------------------------- conversations ------------------------- */
  async function makeConvo(a: string, b: string, msgs: [string, string, number][]) {
    const [convo] = await db.insert(conversations).values({ createdAt: new Date() }).returning({ id: conversations.id });
    await db.insert(conversationMembers).values([
      { conversationId: convo.id, userId: userIds[a] },
      { conversationId: convo.id, userId: userIds[b] },
    ]);
    let lastAt = new Date();
    for (const [sender, content, hAgo] of msgs) {
      lastAt = hoursAgo(hAgo);
      await db.insert(messages).values({ conversationId: convo.id, senderId: userIds[sender], content, createdAt: lastAt });
    }
    return { id: convo.id, lastAt };
  }

  // Maya <-> Jonas: algorithms study chat
  await makeConvo("maya", "jonas", [
    ["jonas", "yo, are you going to Klein's review session tomorrow?", 30],
    ["maya", "yes! 6pm right? I made a DP cheat sheet btw, want it?", 29],
    ["jonas", "absolutely, send it over", 28],
    ["maya", "just uploaded it on StudyShare — DP patterns cheat sheet under CS301", 28],
    ["jonas", "legend. the interval DP section is exactly what I was missing", 26],
    ["maya", "right?? also did you figure out problem 4 on the practice set?", 20],
    ["jonas", "the reduction one? yeah — reduce from 3SAT not VERTEX-COVER, way cleaner", 19.5],
    ["maya", "UGH that's why mine was getting ugly. thank you", 19],
    ["jonas", "lol any time. library tomorrow before the session? 4pm?", 5],
    ["maya", "deal. I'll bring the past midterms", 4.5],
    ["jonas", "perfect, see you then.", 4],
  ]);

  // Maya <-> Aisha: OS project (with 2 unread for Maya)
  await makeConvo("maya", "aisha", [
    ["maya", "did you get the scheduler working for the OS project?", 50],
    ["aisha", "mostly! priority scheduling works but there's a race on wakeup", 49],
    ["maya", "do you hold the runqueue lock when you set task state?", 48],
    ["aisha", "…I did not. that would explain the Heisenbug", 47],
    ["maya", "classic. also Zhang said the report needs a benchmark section", 40],
    ["aisha", "ugh noted. hey — your memory management notes are REALLY good", 2],
    ["aisha", "the multi-level page table diagram especially. mind if I share them with my group?", 1],
  ]);

  // Maya <-> Priya: linear algebra
  await makeConvo("maya", "priya", [
    ["priya", "maya!! your SVD intuition question from class — I wrote it up", 26],
    ["maya", "you are the best. sending to the whole CS301 group", 25],
    ["priya", "please do! also your DP cheat sheet is circulating in the math major group chat, you're famous", 24],
    ["maya", "no wayyyy. wait until they see the formula sheet", 23],
    ["priya", "upload it for MA260 and I'll owe you coffee forever", 22],
    ["maya", "it's literally already on my to-do list", 8],
    ["priya", "deal. good luck with Klein tomorrow!", 7],
  ]);

  // Set Maya's read state: read c1 fully, read priya convo fully; aisha convo unread (leave default lastReadAt slightly older)
  // default lastReadAt is now(), which would mark everything read — move it back for the aisha convo only.
  // Simplest: update lastReadAt for all, then set the aisha one back 3 hours.
  await db.execute(sql.raw(`update conversation_members set last_read_at = now() where user_id = '${userIds.maya}'`));
  const aishaConvo = await db.execute(
    sql.raw(`select cm.conversation_id from conversation_members cm join conversation_members cm2 on cm.conversation_id = cm2.conversation_id where cm.user_id = '${userIds.maya}' and cm2.user_id = '${userIds.aisha}'`),
  );
  const aishaConvoId = (aishaConvo.rows[0] as { conversation_id: string }).conversation_id;
  await db.execute(
    sql.raw(`update conversation_members set last_read_at = '${new Date(Date.now() - 3 * 3600_000).toISOString()}' where user_id = '${userIds.maya}' and conversation_id = '${aishaConvoId}'`),
  );

  console.log("Conversations seeded");
  console.log("✅ Seed complete! Demo login: maya@university.edu / password123");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
