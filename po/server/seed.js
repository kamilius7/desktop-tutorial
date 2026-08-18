const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('Seeding database...');

// Clear existing data
db.exec(`
  DELETE FROM messages;
  DELETE FROM room_members;
  DELETE FROM chat_rooms;
  DELETE FROM scans;
  DELETE FROM enrollments;
  DELETE FROM notes;
  DELETE FROM courses;
  DELETE FROM users;
`);

// Reset auto-increment
db.exec(`
  DELETE FROM sqlite_sequence;
`);

const hash = bcrypt.hashSync('password123', 10);

// ===== USERS =====
const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role, department, level, bio, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

const users = [
  ['Dr. Admin', 'admin@studyshare.com', hash, 'admin', 'Computer Science', 'Faculty', 'Platform administrator and CS professor.', '2024-01-15 08:00:00'],
  ['Amina Bello', 'amina@university.edu', hash, 'student', 'Computer Science', '300 Level', 'Full-stack dev enthusiast. Love sharing notes!', '2024-02-01 10:30:00'],
  ['Chidi Okonkwo', 'chidi@university.edu', hash, 'student', 'Engineering', '200 Level', 'Mechatronics student. Always scanning whiteboards.', '2024-02-10 14:15:00'],
  ['Fatima Hassan', 'fatima@university.edu', hash, 'student', 'Business Administration', '400 Level', 'MBA track. Passionate about entrepreneurship.', '2024-02-15 09:00:00'],
  ['Kwame Asante', 'kwame@university.edu', hash, 'student', 'Computer Science', '300 Level', 'AI/ML researcher. Python evangelist.', '2024-03-01 11:45:00'],
  ['Grace Okafor', 'grace@university.edu', hash, 'student', 'Law', '300 Level', 'Debate champion. Loves constitutional law.', '2024-03-05 16:20:00'],
  ['David Kimani', 'david@university.edu', hash, 'student', 'Engineering', '400 Level', 'Final year EE student. Building IoT projects.', '2024-03-10 08:30:00'],
  ['Zainab Mohammed', 'zainab@university.edu', hash, 'student', 'Business Administration', '200 Level', 'Accounting major. Spreadsheet wizard.', '2024-03-15 13:00:00'],
];

const userIds = [];
for (const u of users) {
  const result = insertUser.run(...u);
  userIds.push(result.lastInsertRowid);
}

// ===== COURSES =====
const insertCourse = db.prepare(
  'INSERT INTO courses (code, title, department, level, description, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const courses = [
  ['CSC301', 'Data Structures & Algorithms', 'Computer Science', '300 Level', 'Advanced data structures including trees, graphs, hash tables, and algorithm analysis.', '#1B4332', '🌲'],
  ['CSC201', 'Introduction to Programming', 'Computer Science', '200 Level', 'Fundamentals of programming using Python. Variables, loops, functions, and OOP basics.', '#2D6A4F', '🐍'],
  ['CSC401', 'Artificial Intelligence', 'Computer Science', '400 Level', 'Machine learning, neural networks, NLP, and AI ethics. Hands-on projects with TensorFlow.', '#40916C', '🤖'],
  ['ENG201', 'Thermodynamics', 'Engineering', '200 Level', 'Laws of thermodynamics, entropy, heat engines, and practical applications.', '#E76F51', '⚙️'],
  ['ENG301', 'Control Systems', 'Engineering', '300 Level', 'Feedback systems, transfer functions, stability analysis, and PID controllers.', '#F4A261', '🎛️'],
  ['ENG401', 'Renewable Energy Systems', 'Engineering', '400 Level', 'Solar, wind, and hydroelectric power systems design and analysis.', '#E9C46A', '⚡'],
  ['BUS201', 'Principles of Management', 'Business Administration', '200 Level', 'Management theories, organizational behavior, and leadership principles.', '#264653', '📊'],
  ['BUS301', 'Financial Accounting', 'Business Administration', '300 Level', 'Double-entry bookkeeping, financial statements, and accounting standards.', '#2A9D8F', '💰'],
  ['BUS401', 'Entrepreneurship & Innovation', 'Business Administration', '400 Level', 'Business planning, startup funding, lean methodology, and pitch presentations.', '#606C38', '🚀'],
  ['LAW201', 'Constitutional Law', 'Law', '200 Level', 'Fundamental rights, separation of powers, and judicial review.', '#BC6C25', '⚖️'],
  ['LAW301', 'Contract Law', 'Law', '300 Level', 'Formation of contracts, terms, breach, and remedies.', '#8B5E3C', '📜'],
  ['LAW401', 'International Law', 'Law', '400 Level', 'Public international law, treaties, human rights law, and ICJ jurisdiction.', '#A47148', '🌍'],
];

const courseIds = [];
for (const c of courses) {
  const result = insertCourse.run(...c);
  courseIds.push(result.lastInsertRowid);
}

// ===== ENROLLMENTS =====
const insertEnrollment = db.prepare('INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES (?, ?, ?)');

const enrollments = [
  [userIds[1], courseIds[0], '2024-09-01'],
  [userIds[1], courseIds[1], '2024-09-01'],
  [userIds[1], courseIds[2], '2024-09-05'],
  [userIds[2], courseIds[3], '2024-09-02'],
  [userIds[2], courseIds[4], '2024-09-02'],
  [userIds[3], courseIds[6], '2024-09-03'],
  [userIds[3], courseIds[7], '2024-09-03'],
  [userIds[3], courseIds[8], '2024-09-10'],
  [userIds[4], courseIds[0], '2024-09-01'],
  [userIds[4], courseIds[2], '2024-09-01'],
  [userIds[5], courseIds[9], '2024-09-04'],
  [userIds[5], courseIds[10], '2024-09-04'],
  [userIds[6], courseIds[4], '2024-09-02'],
  [userIds[6], courseIds[5], '2024-09-05'],
  [userIds[7], courseIds[6], '2024-09-06'],
  [userIds[7], courseIds[7], '2024-09-06'],
];

for (const e of enrollments) {
  insertEnrollment.run(...e);
}

// ===== NOTES =====
const insertNote = db.prepare(
  'INSERT INTO notes (title, content, course_id, author_id, tags, downloads, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

const notes = [
  ['Binary Trees Complete Guide', 'Comprehensive notes on binary trees, BST, AVL trees, and red-black trees. Includes code examples in Python and Java. Covers insertion, deletion, traversal (in-order, pre-order, post-order), and balancing operations.', courseIds[0], userIds[1], '["trees","binary-search","data-structures"]', 42, '2024-10-05 09:30:00'],
  ['Graph Algorithms Cheatsheet', 'BFS, DFS, Dijkstra, Bellman-Ford, and Floyd-Warshall algorithms with time complexity analysis. Includes adjacency list vs matrix comparison and practical examples.', courseIds[0], userIds[4], '["graphs","bfs","dfs","shortest-path"]', 38, '2024-10-08 14:00:00'],
  ['Sorting Algorithms Comparison', 'Detailed comparison of sorting algorithms: QuickSort, MergeSort, HeapSort, BubbleSort, InsertionSort. Time/space complexity table and when to use each one.', courseIds[0], userIds[1], '["sorting","complexity","algorithms"]', 55, '2024-10-12 11:15:00'],
  ['Python Basics - Variables & Data Types', 'Introduction to Python variables, strings, integers, floats, lists, tuples, dictionaries, and sets. Includes type conversion and string formatting examples.', courseIds[1], userIds[1], '["python","basics","variables"]', 67, '2024-09-20 08:45:00'],
  ['Functions & Modules in Python', 'How to define functions, default arguments, *args/**kwargs, lambda functions, and creating/importing modules. Decorators introduction.', courseIds[1], userIds[4], '["python","functions","modules"]', 45, '2024-09-25 10:00:00'],
  ['OOP in Python - Classes & Inheritance', 'Object-oriented programming concepts: classes, objects, inheritance, polymorphism, encapsulation, and magic methods. Real-world examples included.', courseIds[1], userIds[1], '["python","oop","classes","inheritance"]', 51, '2024-10-01 13:30:00'],
  ['Machine Learning Fundamentals', 'Introduction to supervised vs unsupervised learning, regression, classification, clustering. Overview of scikit-learn library and common algorithms.', courseIds[2], userIds[4], '["ml","supervised","sklearn","regression"]', 73, '2024-10-10 15:00:00'],
  ['Neural Networks & Deep Learning', 'Perceptrons, activation functions, backpropagation, CNNs, and RNNs explained with diagrams. TensorFlow/Keras code examples for image classification.', courseIds[2], userIds[4], '["neural-networks","deep-learning","cnn","tensorflow"]', 89, '2024-10-15 09:00:00'],
  ['Laws of Thermodynamics Summary', 'Zeroth through Third laws explained with real-world examples. Entropy, enthalpy, and Gibbs free energy calculations. Includes worked problems from past exams.', courseIds[3], userIds[2], '["thermodynamics","entropy","laws"]', 34, '2024-10-02 11:00:00'],
  ['Heat Engine Cycles', 'Carnot cycle, Otto cycle, Diesel cycle, and Rankine cycle. PV diagrams, efficiency calculations, and comparison table. Ideal vs real engines.', courseIds[3], userIds[2], '["heat-engines","carnot","cycles"]', 28, '2024-10-07 16:30:00'],
  ['Transfer Functions & Block Diagrams', 'Laplace transforms for control systems, block diagram reduction, Mason\'s gain formula, and signal flow graphs. Step-by-step examples.', courseIds[4], userIds[6], '["control-systems","transfer-functions","laplace"]', 31, '2024-10-04 10:00:00'],
  ['PID Controller Tuning Guide', 'Practical guide to PID controller tuning methods: Ziegler-Nichols, Cohen-Coon, and manual tuning. Includes MATLAB/Simulink examples.', courseIds[4], userIds[6], '["pid","controller","tuning","matlab"]', 22, '2024-10-09 14:00:00'],
  ['Solar Energy System Design', 'Photovoltaic cell fundamentals, solar panel sizing, inverter selection, and battery storage calculations. Includes a case study for a 5kW residential system.', courseIds[5], userIds[6], '["solar","photovoltaic","design"]', 19, '2024-10-11 09:00:00'],
  ['Management Theories Overview', 'Classical, behavioral, and modern management theories. Taylor, Fayol, Weber, Mayo, and contingency theory comparison. Essay-ready notes.', courseIds[6], userIds[3], '["management","theories","classical","modern"]', 41, '2024-09-22 10:30:00'],
  ['Leadership Styles & Case Studies', 'Autocratic, democratic, laissez-faire, transformational, and servant leadership. Includes case studies of Steve Jobs, Nelson Mandela, and Indra Nooyi.', courseIds[6], userIds[7], '["leadership","styles","case-studies"]', 36, '2024-09-28 14:00:00'],
  ['Balance Sheet & Income Statement', 'How to read and prepare financial statements. Assets, liabilities, equity, revenue, and expenses explained with real company examples.', courseIds[7], userIds[3], '["accounting","balance-sheet","income-statement"]', 48, '2024-10-03 11:00:00'],
  ['Journal Entries Masterclass', 'Double-entry bookkeeping rules, common journal entries, adjusting entries, and closing entries. 50+ practice problems with solutions.', courseIds[7], userIds[7], '["journal-entries","bookkeeping","accounting"]', 39, '2024-10-06 09:30:00'],
  ['Business Model Canvas Guide', 'How to create a business model canvas with examples. Value proposition, customer segments, revenue streams, and cost structure deep dive.', courseIds[8], userIds[3], '["business-model","canvas","startup"]', 52, '2024-10-08 13:00:00'],
  ['Pitch Deck Template & Tips', 'How to create a compelling investor pitch deck. 10-slide structure, storytelling techniques, and common mistakes to avoid. Includes a template.', courseIds[8], userIds[3], '["pitch-deck","investor","startup"]', 61, '2024-10-12 16:00:00'],
  ['Constitutional Rights Summary', 'Key fundamental rights: right to life, dignity, fair hearing, freedom of expression, and freedom of association. Case law references included.', courseIds[9], userIds[5], '["rights","constitution","fundamental"]', 33, '2024-10-01 10:00:00'],
  ['Separation of Powers Doctrine', 'Executive, legislative, and judicial powers. Checks and balances system. Landmark cases: Marbury v Madison, and local equivalents.', courseIds[9], userIds[5], '["separation-of-powers","checks-balances"]', 27, '2024-10-05 15:00:00'],
  ['Contract Formation Elements', 'Offer, acceptance, consideration, intention to create legal relations, and capacity. Classic cases: Carlill v Carbolic Smoke Ball Co.', courseIds[10], userIds[5], '["contracts","formation","offer","acceptance"]', 30, '2024-10-07 09:00:00'],
  ['Breach of Contract & Remedies', 'Types of breach (actual, anticipatory), remedies available (damages, specific performance, injunctions). Measure of damages and mitigation.', courseIds[10], userIds[5], '["breach","remedies","damages"]', 25, '2024-10-10 11:00:00'],
  ['United Nations & ICJ', 'Structure of the UN, Security Council, General Assembly, and International Court of Justice. Sources of international law and treaty interpretation.', courseIds[11], userIds[5], '["united-nations","icj","international-law"]', 21, '2024-10-13 14:00:00'],
  ['Hash Tables Deep Dive', 'Hash functions, collision resolution (chaining vs open addressing), load factor, and rehashing. Implementation in Python with performance benchmarks.', courseIds[0], userIds[4], '["hash-tables","hashing","collision"]', 44, '2024-10-14 10:30:00'],
];

const noteIds = [];
for (const n of notes) {
  const result = insertNote.run(...n);
  noteIds.push(result.lastInsertRowid);
}

// ===== CHAT ROOMS =====
const insertRoom = db.prepare(
  'INSERT INTO chat_rooms (name, type, course_id) VALUES (?, ?, ?)'
);

const rooms = [
  ['General Discussion', 'group', null],
  ['CS Students Hub', 'group', courseIds[0]],
  ['Engineering Lounge', 'group', courseIds[3]],
  ['Business & Finance Talk', 'group', courseIds[6]],
  ['Law Study Group', 'group', courseIds[9]],
  ['AI & ML Research', 'group', courseIds[2]],
  ['Exam Prep 2024', 'group', null],
];

const roomIds = [];
for (const r of rooms) {
  const result = insertRoom.run(...r);
  roomIds.push(result.lastInsertRowid);
}

// Add all users to general rooms
const insertMember = db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)');
for (const uid of userIds) {
  insertMember.run(roomIds[0], uid); // General
  insertMember.run(roomIds[6], uid); // Exam Prep
}
// Department-specific rooms
[userIds[1], userIds[4]].forEach(uid => insertMember.run(roomIds[1], uid)); // CS
[userIds[2], userIds[6]].forEach(uid => insertMember.run(roomIds[2], uid)); // Engineering
[userIds[3], userIds[7]].forEach(uid => insertMember.run(roomIds[3], uid)); // Business
[userIds[5]].forEach(uid => insertMember.run(roomIds[4], uid)); // Law
[userIds[1], userIds[4]].forEach(uid => insertMember.run(roomIds[5], uid)); // AI/ML

// ===== MESSAGES =====
const insertMessage = db.prepare(
  'INSERT INTO messages (sender_id, room_id, content, created_at) VALUES (?, ?, ?, ?)'
);

const messages = [
  // General Discussion
  [userIds[0], roomIds[0], 'Welcome to StudyShare everyone! 🎉 Feel free to share notes and help each other out.', '2024-10-01 08:00:00'],
  [userIds[1], roomIds[0], 'Thanks Dr. Admin! This platform is amazing for sharing study materials.', '2024-10-01 08:15:00'],
  [userIds[2], roomIds[0], 'Just uploaded my thermodynamics notes. Check them out! 📝', '2024-10-01 09:30:00'],
  [userIds[3], roomIds[0], 'Has anyone started the management assignment due next week?', '2024-10-01 10:00:00'],
  [userIds[4], roomIds[0], 'I just shared my ML notes with neural network diagrams. Hope they help!', '2024-10-01 11:00:00'],
  [userIds[5], roomIds[0], 'Looking for study partners for constitutional law exam 📚', '2024-10-01 12:30:00'],
  [userIds[6], roomIds[0], 'The PID controller notes I shared have MATLAB examples. Very useful for the lab!', '2024-10-01 14:00:00'],
  [userIds[7], roomIds[0], 'Can someone explain the balance sheet equation? I keep getting confused 😅', '2024-10-01 15:30:00'],
  [userIds[3], roomIds[0], '@Zainab Assets = Liabilities + Equity. Think of it as what you OWN = what you OWE + what you\'re WORTH', '2024-10-01 15:45:00'],
  [userIds[7], roomIds[0], 'That actually makes sense! Thanks Fatima! 🙏', '2024-10-01 16:00:00'],

  // CS Students Hub
  [userIds[1], roomIds[1], 'Who\'s ready for the DSA midterm? 😰', '2024-10-02 09:00:00'],
  [userIds[4], roomIds[1], 'I uploaded comprehensive notes on binary trees and graph algorithms. Check the notes section!', '2024-10-02 09:30:00'],
  [userIds[1], roomIds[1], 'The sorting algorithms cheat sheet is 🔥. Thanks Kwame!', '2024-10-02 10:00:00'],
  [userIds[4], roomIds[1], 'Anyone want to form a study group for the AI exam?', '2024-10-02 11:00:00'],
  [userIds[1], roomIds[1], 'Count me in! Let\'s meet at the library tomorrow at 2pm', '2024-10-02 11:15:00'],
  [userIds[4], roomIds[1], 'Perfect! I\'ll bring my neural networks notes. They cover CNNs really well.', '2024-10-02 11:30:00'],
  [userIds[1], roomIds[1], 'Just finished the hash tables notes. Open addressing vs chaining is tricky stuff.', '2024-10-14 11:00:00'],

  // Engineering Lounge
  [userIds[2], roomIds[2], 'The thermodynamics professor is really tough this semester 😤', '2024-10-03 08:00:00'],
  [userIds[6], roomIds[2], 'True, but his examples are actually practical. I uploaded heat engine cycle notes.', '2024-10-03 08:30:00'],
  [userIds[2], roomIds[2], 'Thanks David! Your control systems notes are a lifesaver for the lab report.', '2024-10-03 09:00:00'],
  [userIds[6], roomIds[2], 'Anyone interested in the renewable energy project? We need team members.', '2024-10-03 10:00:00'],
  [userIds[2], roomIds[2], 'I\'m in! Solar energy design sounds interesting.', '2024-10-03 10:15:00'],

  // Business & Finance Talk
  [userIds[3], roomIds[3], 'The business model canvas assignment is due Friday. Anyone started?', '2024-10-04 09:00:00'],
  [userIds[7], roomIds[3], 'I uploaded detailed journal entry notes. Should help with the accounting exam!', '2024-10-04 10:00:00'],
  [userIds[3], roomIds[3], 'Thanks Zainab! Also check out my pitch deck template. It has great examples.', '2024-10-04 10:30:00'],
  [userIds[7], roomIds[3], 'That pitch deck guide is amazing! Using it for our entrepreneurship presentation.', '2024-10-04 11:00:00'],

  // Law Study Group
  [userIds[5], roomIds[4], 'Constitutional law exam is going to be intense. Who\'s studying together?', '2024-10-05 09:00:00'],
  [userIds[5], roomIds[4], 'I\'ve shared notes on fundamental rights and separation of powers. Very detailed!', '2024-10-05 09:30:00'],

  // AI & ML Research
  [userIds[4], roomIds[5], 'Just found an amazing paper on transformer architectures. Mind-blowing! 🤯', '2024-10-06 14:00:00'],
  [userIds[1], roomIds[5], 'Share the link! I\'ve been reading about attention mechanisms.', '2024-10-06 14:30:00'],
  [userIds[4], roomIds[5], 'The deep learning notes I shared cover the basics of transformers. Start there!', '2024-10-06 15:00:00'],

  // Exam Prep
  [userIds[0], roomIds[6], 'Exam season is approaching! Use this room to coordinate study sessions. 📖', '2024-11-01 08:00:00'],
  [userIds[1], roomIds[6], 'Creating a study schedule. Who wants to join?', '2024-11-01 09:00:00'],
  [userIds[4], roomIds[6], 'I can help with CS and AI topics. Let me know what you need!', '2024-11-01 10:00:00'],
  [userIds[6], roomIds[6], 'Engineering students, I have control systems and thermodynamics revision materials ready.', '2024-11-01 11:00:00'],
  [userIds[3], roomIds[6], 'Business students - accounting and management notes are all uploaded. Let\'s ace these exams! 💪', '2024-11-01 12:00:00'],
];

for (const m of messages) {
  insertMessage.run(...m);
}

// ===== SCANS =====
const insertScan = db.prepare(
  'INSERT INTO scans (user_id, title, file_url, type, created_at) VALUES (?, ?, ?, ?, ?)'
);

const scans = [
  [userIds[2], 'Thermodynamics Lecture 5 Whiteboard', '/uploads/sample-scan-1.pdf', 'whiteboard', '2024-10-03 12:00:00'],
  [userIds[2], 'Control Systems Lab Assignment', '/uploads/sample-scan-2.pdf', 'assignment', '2024-10-05 14:00:00'],
  [userIds[1], 'DSA Handwritten Notes - Trees', '/uploads/sample-scan-3.pdf', 'notes', '2024-10-06 10:00:00'],
  [userIds[6], 'Signal Processing Diagram', '/uploads/sample-scan-4.pdf', 'whiteboard', '2024-10-07 09:00:00'],
  [userIds[3], 'Financial Statement Analysis Template', '/uploads/sample-scan-5.pdf', 'notes', '2024-10-08 11:00:00'],
  [userIds[4], 'Neural Network Architecture Diagram', '/uploads/sample-scan-6.pdf', 'whiteboard', '2024-10-09 15:00:00'],
  [userIds[5], 'Constitutional Law Case Notes', '/uploads/sample-scan-7.pdf', 'notes', '2024-10-10 13:00:00'],
  [userIds[7], 'Accounting Practice Problems', '/uploads/sample-scan-8.pdf', 'assignment', '2024-10-11 10:00:00'],
];

for (const s of scans) {
  insertScan.run(...s);
}

console.log('Seed complete!');
console.log(`  ${users.length} users`);
console.log(`  ${courses.length} courses`);
console.log(`  ${notes.length} notes`);
console.log(`  ${rooms.length} chat rooms`);
console.log(`  ${messages.length} messages`);
console.log(`  ${scans.length} scans`);
console.log(`  ${enrollments.length} enrollments`);
console.log('\nDemo login: admin@studyshare.com / password123');
console.log('Student login: amina@university.edu / password123');
