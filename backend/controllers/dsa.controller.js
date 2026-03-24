const DSAProblem = require('../models/DSAProblem.model');
const UserProgress = require('../models/UserProgress.model');

// ─────────────────────────────────────────
// GET /api/dsa/problems
// Saare problems fetch karo — filter bhi kar sakte ho
// e.g: ?sheet=Striver ya ?topic=Arrays ya ?difficulty=Easy
// ─────────────────────────────────────────
const getProblems = async (req, res) => {
  try {
    const { sheet, topic, difficulty } = req.query;
    const filter = {};
    if (sheet) filter.sheet = sheet;
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    const problems = await DSAProblem.find(filter).sort({ order: 1 });

    res.json({ success: true, problems, total: problems.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// POST /api/dsa/solve/:problemId
// Problem ko solved mark karo
// ─────────────────────────────────────────
const markSolved = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id; // protect middleware se aata hai

    // Pehle check karo — problem exist karti hai?
    const problem = await DSAProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // findOneAndUpdate — agar entry hai toh update karo
    // nahi hai toh naya banao (upsert: true)
    const progress = await UserProgress.findOneAndUpdate(
      { user: userId, problem: problemId },
      { 
        solved: true, 
        solvedAt: new Date(),
        notes: req.body.notes || ''
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// POST /api/dsa/unsolve/:problemId
// Galti se solve kiya — wapas unsolved karo
// ─────────────────────────────────────────
const markUnsolved = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    await UserProgress.findOneAndUpdate(
      { user: userId, problem: problemId },
      { solved: false, solvedAt: null },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Marked as unsolved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// GET /api/dsa/progress
// Us user ka poora progress — kitne solve kiye
// Topic wise, sheet wise breakdown
// ─────────────────────────────────────────
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // User ke saare solved problems nikalo
    // populate('problem') → problem ki details bhi saath lao
    const solvedList = await UserProgress.find({ 
      user: userId, 
      solved: true 
    }).populate('problem');

    // Topic wise count karo
    // e.g: { Arrays: 5, Trees: 3, DP: 2 }
    const topicWise = {};
    solvedList.forEach(entry => {
      const topic = entry.problem.topic;
      topicWise[topic] = (topicWise[topic] || 0) + 1;
    });

    // Sheet wise count karo
    // e.g: { Striver: 45, Blind75: 20 }
    const sheetWise = {};
    solvedList.forEach(entry => {
      const sheet = entry.problem.sheet;
      sheetWise[sheet] = (sheetWise[sheet] || 0) + 1;
    });

    // Total problems kitne hain DB mein
    const totalProblems = await DSAProblem.countDocuments();

    res.json({
      success: true,
      totalSolved: solvedList.length,
      totalProblems,
      topicWise,
      sheetWise,
      percentage: Math.round((solvedList.length / totalProblems) * 100)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// POST /api/dsa/seed
// Database mein problems daalo ek baar
// Yeh sirf ek baar run karna hai!
// ─────────────────────────────────────────
const seedProblems = async (req, res) => {
  try {
    await DSAProblem.deleteMany({});

    const problems = [

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 1: Learn the Basics
      // ─────────────────────────────────────────
      { title:'User Input / Output',              slug:'user-input-output',         difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:1  },
      { title:'Data Types',                        slug:'data-types',                difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:2  },
      { title:'If Else statements',               slug:'if-else',                   difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:3  },
      { title:'Switch Statement',                 slug:'switch-statement',          difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:4  },
      { title:'Arrays',                           slug:'arrays-basics',             difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:5  },
      { title:'Strings',                          slug:'strings-basics',            difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:6  },
      { title:'For Loops',                        slug:'for-loops',                 difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:7  },
      { title:'While Loops',                      slug:'while-loops',               difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:8  },
      { title:'Functions',                        slug:'functions-basics',          difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:9  },
      { title:'Time Complexity',                  slug:'time-complexity',           difficulty:'Easy',   topic:'Basics',  sheet:'Striver A2Z', step:'Step 1: Learn the Basics', order:10 },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 2: Sorting
      // ─────────────────────────────────────────
      { title:'Selection Sort',   slug:'selection-sort',  difficulty:'Easy', topic:'Sorting', sheet:'Striver A2Z', step:'Step 2: Sorting Techniques', order:11 },
      { title:'Bubble Sort',      slug:'bubble-sort',     difficulty:'Easy', topic:'Sorting', sheet:'Striver A2Z', step:'Step 2: Sorting Techniques', order:12 },
      { title:'Insertion Sort',   slug:'insertion-sort',  difficulty:'Easy', topic:'Sorting', sheet:'Striver A2Z', step:'Step 2: Sorting Techniques', order:13 },
      { title:'Merge Sort',       slug:'merge-sort',      difficulty:'Medium', topic:'Sorting', sheet:'Striver A2Z', step:'Step 2: Sorting Techniques', order:14 },
      { title:'Quick Sort',       slug:'quick-sort',      difficulty:'Medium', topic:'Sorting', sheet:'Striver A2Z', step:'Step 2: Sorting Techniques', order:15 },
      { title:'Recursive Bubble Sort', slug:'recursive-bubble-sort', difficulty:'Easy', topic:'Sorting', sheet:'Striver A2Z', step:'Step 2: Sorting Techniques', order:16 },
      { title:'Recursive Insertion Sort', slug:'recursive-insertion-sort', difficulty:'Easy', topic:'Sorting', sheet:'Striver A2Z', step:'Step 2: Sorting Techniques', order:17 },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 3: Arrays
      // ─────────────────────────────────────────
      { title:'Largest Element in Array',          slug:'largest-element',          difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:18, leetcodeUrl:'https://leetcode.com/problems/find-maximum-element' },
      { title:'Second Largest Element',            slug:'second-largest',           difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:19 },
      { title:'Check Array Sorted',                slug:'check-array-sorted',       difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:20 },
      { title:'Remove Duplicates from Sorted Array', slug:'remove-duplicates',      difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:21, leetcodeUrl:'https://leetcode.com/problems/remove-duplicates-from-sorted-array' },
      { title:'Left Rotate Array by One',          slug:'left-rotate-by-one',       difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:22 },
      { title:'Rotate Array by K places',          slug:'rotate-by-k',              difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:23, leetcodeUrl:'https://leetcode.com/problems/rotate-array' },
      { title:'Move Zeros to End',                 slug:'move-zeros',               difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:24, leetcodeUrl:'https://leetcode.com/problems/move-zeroes' },
      { title:'Linear Search',                     slug:'linear-search',            difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:25 },
      { title:'Union of Two Sorted Arrays',        slug:'union-sorted-arrays',      difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:26 },
      { title:'Intersection of Two Sorted Arrays', slug:'intersection-sorted',      difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:27 },
      { title:'Missing Number',                    slug:'missing-number',           difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:28, leetcodeUrl:'https://leetcode.com/problems/missing-number' },
      { title:'Maximum Consecutive Ones',          slug:'max-consecutive-ones',     difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:29, leetcodeUrl:'https://leetcode.com/problems/max-consecutive-ones' },
      { title:'Single Number',                     slug:'single-number',            difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:30, leetcodeUrl:'https://leetcode.com/problems/single-number' },
      { title:'Two Sum',                           slug:'two-sum',                  difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:31, leetcodeUrl:'https://leetcode.com/problems/two-sum' },
      { title:'Sort Array of 0s 1s 2s',           slug:'sort-012',                 difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:32, leetcodeUrl:'https://leetcode.com/problems/sort-colors' },
      { title:'Maximum Subarray (Kadane\'s)',      slug:'kadanes-algorithm',        difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:33, leetcodeUrl:'https://leetcode.com/problems/maximum-subarray' },
      { title:'Best Time to Buy and Sell Stock',   slug:'buy-sell-stock',           difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:34, leetcodeUrl:'https://leetcode.com/problems/best-time-to-buy-and-sell-stock' },
      { title:'Rearrange Positive and Negative',  slug:'rearrange-pos-neg',        difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:35 },
      { title:'Next Permutation',                  slug:'next-permutation',         difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:36, leetcodeUrl:'https://leetcode.com/problems/next-permutation' },
      { title:'Leaders in an Array',               slug:'leaders-in-array',         difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:37 },
      { title:'Longest Consecutive Sequence',      slug:'longest-consecutive',      difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:38, leetcodeUrl:'https://leetcode.com/problems/longest-consecutive-sequence' },
      { title:'Set Matrix Zeroes',                 slug:'set-matrix-zeroes',        difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:39, leetcodeUrl:'https://leetcode.com/problems/set-matrix-zeroes' },
      { title:'Rotate Matrix 90 degrees',          slug:'rotate-matrix',            difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:40, leetcodeUrl:'https://leetcode.com/problems/rotate-image' },
      { title:'Spiral Order Matrix',               slug:'spiral-matrix',            difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:41, leetcodeUrl:'https://leetcode.com/problems/spiral-matrix' },
      { title:'Count Subarrays with XOR = K',     slug:'subarray-xor-k',           difficulty:'Hard',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:42 },
      { title:'Merge Overlapping Intervals',       slug:'merge-intervals',          difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:43, leetcodeUrl:'https://leetcode.com/problems/merge-intervals' },
      { title:'Merge Two Sorted Arrays',           slug:'merge-sorted-arrays',      difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:44, leetcodeUrl:'https://leetcode.com/problems/merge-sorted-array' },
      { title:'Find Duplicate in Array',           slug:'find-duplicate',           difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:45, leetcodeUrl:'https://leetcode.com/problems/find-the-duplicate-number' },
      { title:'Count Inversions',                  slug:'count-inversions',         difficulty:'Hard',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:46 },
      { title:'Majority Element (n/2)',            slug:'majority-element',         difficulty:'Easy',   topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:47, leetcodeUrl:'https://leetcode.com/problems/majority-element' },
      { title:'Majority Element (n/3)',            slug:'majority-element-n3',      difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:48, leetcodeUrl:'https://leetcode.com/problems/majority-element-ii' },
      { title:'3 Sum',                             slug:'three-sum',                difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:49, leetcodeUrl:'https://leetcode.com/problems/3sum' },
      { title:'4 Sum',                             slug:'four-sum',                 difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:50, leetcodeUrl:'https://leetcode.com/problems/4sum' },
      { title:'Largest Subarray with 0 Sum',      slug:'largest-subarray-zero-sum', difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:51 },
      { title:'Subarray with given XOR',           slug:'subarray-xor',             difficulty:'Medium', topic:'Arrays', sheet:'Striver A2Z', step:'Step 3: Arrays', order:52 },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 4: Binary Search
      // ─────────────────────────────────────────
      { title:'Binary Search',                     slug:'binary-search',            difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:53, leetcodeUrl:'https://leetcode.com/problems/binary-search' },
      { title:'Lower Bound',                       slug:'lower-bound',              difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:54 },
      { title:'Upper Bound',                       slug:'upper-bound',              difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:55 },
      { title:'Search Insert Position',            slug:'search-insert-position',   difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:56, leetcodeUrl:'https://leetcode.com/problems/search-insert-position' },
      { title:'Floor and Ceil in Sorted Array',   slug:'floor-ceil',               difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:57 },
      { title:'First and Last Occurrence',         slug:'first-last-occurrence',    difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:58 },
      { title:'Count Occurrences in Sorted Array', slug:'count-occurrences',        difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:59 },
      { title:'Search in Rotated Sorted Array',   slug:'search-rotated',           difficulty:'Medium', topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:60, leetcodeUrl:'https://leetcode.com/problems/search-in-rotated-sorted-array' },
      { title:'Find Minimum in Rotated Sorted Array', slug:'min-rotated',          difficulty:'Medium', topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:61, leetcodeUrl:'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array' },
      { title:'Find Peak Element',                 slug:'find-peak',               difficulty:'Medium', topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:62, leetcodeUrl:'https://leetcode.com/problems/find-peak-element' },
      { title:'Square Root using BS',             slug:'sqrt-bs',                  difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:63, leetcodeUrl:'https://leetcode.com/problems/sqrtx' },
      { title:'Nth Root of Number',               slug:'nth-root',                 difficulty:'Easy',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:64 },
      { title:'Koko Eating Bananas',              slug:'koko-eating-bananas',       difficulty:'Medium', topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:65, leetcodeUrl:'https://leetcode.com/problems/koko-eating-bananas' },
      { title:'Minimum Days to Make Bouquets',    slug:'min-days-bouquets',         difficulty:'Medium', topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:66, leetcodeUrl:'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets' },
      { title:'Aggressive Cows',                  slug:'aggressive-cows',           difficulty:'Hard',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:67 },
      { title:'Book Allocation Problem',          slug:'book-allocation',           difficulty:'Hard',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:68 },
      { title:'Split Array Largest Sum',          slug:'split-array',               difficulty:'Hard',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:69, leetcodeUrl:'https://leetcode.com/problems/split-array-largest-sum' },
      { title:'Median of Two Sorted Arrays',      slug:'median-two-sorted',         difficulty:'Hard',   topic:'Binary Search', sheet:'Striver A2Z', step:'Step 4: Binary Search', order:70, leetcodeUrl:'https://leetcode.com/problems/median-of-two-sorted-arrays' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 5: Strings
      // ─────────────────────────────────────────
      { title:'Reverse Words in String',           slug:'reverse-words',            difficulty:'Medium', topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:71, leetcodeUrl:'https://leetcode.com/problems/reverse-words-in-a-string' },
      { title:'Longest Palindromic Substring',     slug:'longest-palindrome',       difficulty:'Medium', topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:72, leetcodeUrl:'https://leetcode.com/problems/longest-palindromic-substring' },
      { title:'Roman to Integer',                  slug:'roman-to-integer',         difficulty:'Easy',   topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:73, leetcodeUrl:'https://leetcode.com/problems/roman-to-integer' },
      { title:'Implement Atoi',                    slug:'implement-atoi',           difficulty:'Medium', topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:74, leetcodeUrl:'https://leetcode.com/problems/string-to-integer-atoi' },
      { title:'Count and Say',                     slug:'count-and-say',            difficulty:'Medium', topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:75, leetcodeUrl:'https://leetcode.com/problems/count-and-say' },
      { title:'Compare Version Numbers',           slug:'compare-versions',         difficulty:'Medium', topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:76, leetcodeUrl:'https://leetcode.com/problems/compare-version-numbers' },
      { title:'Anagram Check',                     slug:'anagram-check',            difficulty:'Easy',   topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:77, leetcodeUrl:'https://leetcode.com/problems/valid-anagram' },
      { title:'Longest Common Prefix',             slug:'longest-common-prefix',    difficulty:'Easy',   topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:78, leetcodeUrl:'https://leetcode.com/problems/longest-common-prefix' },
      { title:'Rabin Karp Algorithm',              slug:'rabin-karp',               difficulty:'Medium', topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:79 },
      { title:'KMP Algorithm',                     slug:'kmp-algorithm',            difficulty:'Hard',   topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:80 },
      { title:'Minimum Characters to Add',        slug:'min-chars-add',             difficulty:'Hard',   topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:81 },
      { title:'Longest Substring Without Repeating', slug:'longest-substring',      difficulty:'Medium', topic:'Strings', sheet:'Striver A2Z', step:'Step 5: Strings', order:82, leetcodeUrl:'https://leetcode.com/problems/longest-substring-without-repeating-characters' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 6: Linked List
      // ─────────────────────────────────────────
      { title:'Introduction to Linked List',       slug:'ll-intro',                 difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:83 },
      { title:'Reverse a Linked List',             slug:'reverse-ll',               difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:84, leetcodeUrl:'https://leetcode.com/problems/reverse-linked-list' },
      { title:'Middle of Linked List',             slug:'middle-ll',                difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:85, leetcodeUrl:'https://leetcode.com/problems/middle-of-the-linked-list' },
      { title:'Merge Two Sorted Linked Lists',     slug:'merge-two-ll',             difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:86, leetcodeUrl:'https://leetcode.com/problems/merge-two-sorted-lists' },
      { title:'Remove Nth Node From End',          slug:'remove-nth-node',          difficulty:'Medium', topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:87, leetcodeUrl:'https://leetcode.com/problems/remove-nth-node-from-end-of-list' },
      { title:'Delete Given Node',                 slug:'delete-node',              difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:88, leetcodeUrl:'https://leetcode.com/problems/delete-node-in-a-linked-list' },
      { title:'Add Two Numbers',                   slug:'add-two-numbers-ll',       difficulty:'Medium', topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:89, leetcodeUrl:'https://leetcode.com/problems/add-two-numbers' },
      { title:'Detect Cycle in Linked List',       slug:'detect-cycle',             difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:90, leetcodeUrl:'https://leetcode.com/problems/linked-list-cycle' },
      { title:'Find Length of Cycle',              slug:'length-of-cycle',          difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:91 },
      { title:'Segregate Odd Even Nodes',          slug:'odd-even-ll',              difficulty:'Medium', topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:92, leetcodeUrl:'https://leetcode.com/problems/odd-even-linked-list' },
      { title:'Remove Duplicates from Sorted LL', slug:'remove-dup-ll',             difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:93, leetcodeUrl:'https://leetcode.com/problems/remove-duplicates-from-sorted-list' },
      { title:'Sort Linked List of 0s 1s 2s',     slug:'sort-ll-012',              difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:94 },
      { title:'Check Palindrome LL',               slug:'palindrome-ll',            difficulty:'Easy',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:95, leetcodeUrl:'https://leetcode.com/problems/palindrome-linked-list' },
      { title:'Flatten a Linked List',             slug:'flatten-ll',               difficulty:'Medium', topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:96 },
      { title:'Rotate a Linked List',              slug:'rotate-ll',                difficulty:'Medium', topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:97, leetcodeUrl:'https://leetcode.com/problems/rotate-list' },
      { title:'Clone List with Random Pointer',   slug:'clone-ll',                  difficulty:'Medium', topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:98, leetcodeUrl:'https://leetcode.com/problems/copy-list-with-random-pointer' },
      { title:'LRU Cache',                         slug:'lru-cache',                difficulty:'Hard',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:99, leetcodeUrl:'https://leetcode.com/problems/lru-cache' },
      { title:'Merge K Sorted Lists',             slug:'merge-k-sorted',            difficulty:'Hard',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:100, leetcodeUrl:'https://leetcode.com/problems/merge-k-sorted-lists' },
      { title:'Reverse Nodes in K Group',         slug:'reverse-k-group',           difficulty:'Hard',   topic:'Linked List', sheet:'Striver A2Z', step:'Step 6: Linked List', order:101, leetcodeUrl:'https://leetcode.com/problems/reverse-nodes-in-k-group' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 7: Recursion
      // ─────────────────────────────────────────
      { title:'Fibonacci Number',                  slug:'fibonacci',                difficulty:'Easy',   topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:102, leetcodeUrl:'https://leetcode.com/problems/fibonacci-number' },
      { title:'Reverse an Array',                  slug:'reverse-array-recursion',  difficulty:'Easy',   topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:103 },
      { title:'Check Palindrome',                  slug:'palindrome-recursion',     difficulty:'Easy',   topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:104 },
      { title:'Sum of First N Numbers',            slug:'sum-n-numbers',            difficulty:'Easy',   topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:105 },
      { title:'Power Function',                    slug:'power-function',           difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:106, leetcodeUrl:'https://leetcode.com/problems/powx-n' },
      { title:'Generate All Subsequences',         slug:'all-subsequences',         difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:107 },
      { title:'Subsets',                           slug:'subsets',                  difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:108, leetcodeUrl:'https://leetcode.com/problems/subsets' },
      { title:'Combination Sum I',                 slug:'combination-sum-1',        difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:109, leetcodeUrl:'https://leetcode.com/problems/combination-sum' },
      { title:'Combination Sum II',                slug:'combination-sum-2',        difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:110, leetcodeUrl:'https://leetcode.com/problems/combination-sum-ii' },
      { title:'Subset Sum I',                      slug:'subset-sum-1',             difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:111 },
      { title:'Subset Sum II',                     slug:'subset-sum-2',             difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:112 },
      { title:'Permutations',                      slug:'permutations',             difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:113, leetcodeUrl:'https://leetcode.com/problems/permutations' },
      { title:'N Queens Problem',                  slug:'n-queens',                 difficulty:'Hard',   topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:114, leetcodeUrl:'https://leetcode.com/problems/n-queens' },
      { title:'Sudoku Solver',                     slug:'sudoku-solver',            difficulty:'Hard',   topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:115, leetcodeUrl:'https://leetcode.com/problems/sudoku-solver' },
      { title:'Word Search',                       slug:'word-search',              difficulty:'Medium', topic:'Recursion', sheet:'Striver A2Z', step:'Step 7: Recursion', order:116, leetcodeUrl:'https://leetcode.com/problems/word-search' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 8: Bit Manipulation
      // ─────────────────────────────────────────
      { title:'Check if ith bit is set',           slug:'check-ith-bit',            difficulty:'Easy',   topic:'Bit Manipulation', sheet:'Striver A2Z', step:'Step 8: Bit Manipulation', order:117 },
      { title:'Check if number is odd',            slug:'check-odd',                difficulty:'Easy',   topic:'Bit Manipulation', sheet:'Striver A2Z', step:'Step 8: Bit Manipulation', order:118 },
      { title:'Check if number is power of 2',    slug:'power-of-two',              difficulty:'Easy',   topic:'Bit Manipulation', sheet:'Striver A2Z', step:'Step 8: Bit Manipulation', order:119, leetcodeUrl:'https://leetcode.com/problems/power-of-two' },
      { title:'Count Set Bits',                    slug:'count-set-bits',           difficulty:'Easy',   topic:'Bit Manipulation', sheet:'Striver A2Z', step:'Step 8: Bit Manipulation', order:120 },
      { title:'Single Number',                     slug:'single-number-xor',        difficulty:'Easy',   topic:'Bit Manipulation', sheet:'Striver A2Z', step:'Step 8: Bit Manipulation', order:121, leetcodeUrl:'https://leetcode.com/problems/single-number' },
      { title:'Two Numbers with Odd Occurrences',  slug:'two-odd-occurrences',      difficulty:'Medium', topic:'Bit Manipulation', sheet:'Striver A2Z', step:'Step 8: Bit Manipulation', order:122 },
      { title:'Minimum XOR',                       slug:'minimum-xor',              difficulty:'Easy',   topic:'Bit Manipulation', sheet:'Striver A2Z', step:'Step 8: Bit Manipulation', order:123 },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 9: Stack & Queue
      // ─────────────────────────────────────────
      { title:'Implement Stack using Array',       slug:'stack-array',              difficulty:'Easy',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:124 },
      { title:'Implement Queue using Array',       slug:'queue-array',              difficulty:'Easy',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:125 },
      { title:'Implement Stack using Queue',       slug:'stack-using-queue',        difficulty:'Easy',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:126, leetcodeUrl:'https://leetcode.com/problems/implement-stack-using-queues' },
      { title:'Implement Queue using Stack',       slug:'queue-using-stack',        difficulty:'Easy',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:127, leetcodeUrl:'https://leetcode.com/problems/implement-queue-using-stacks' },
      { title:'Valid Parentheses',                 slug:'valid-parentheses',        difficulty:'Easy',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:128, leetcodeUrl:'https://leetcode.com/problems/valid-parentheses' },
      { title:'Next Greater Element',              slug:'next-greater-element',     difficulty:'Medium', topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:129, leetcodeUrl:'https://leetcode.com/problems/next-greater-element-i' },
      { title:'Previous Smaller Element',          slug:'prev-smaller-element',     difficulty:'Medium', topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:130 },
      { title:'Stock Span Problem',                slug:'stock-span',               difficulty:'Medium', topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:131 },
      { title:'Largest Rectangle in Histogram',   slug:'largest-rectangle',         difficulty:'Hard',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:132, leetcodeUrl:'https://leetcode.com/problems/largest-rectangle-in-histogram' },
      { title:'Sliding Window Maximum',            slug:'sliding-window-max',       difficulty:'Hard',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:133, leetcodeUrl:'https://leetcode.com/problems/sliding-window-maximum' },
      { title:'LRU Cache Implementation',         slug:'lru-cache-impl',            difficulty:'Hard',   topic:'Stack & Queue', sheet:'Striver A2Z', step:'Step 9: Stack & Queue', order:134, leetcodeUrl:'https://leetcode.com/problems/lru-cache' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 10: Greedy
      // ─────────────────────────────────────────
      { title:'Assign Cookies',                    slug:'assign-cookies',           difficulty:'Easy',   topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:135, leetcodeUrl:'https://leetcode.com/problems/assign-cookies' },
      { title:'Fractional Knapsack',               slug:'fractional-knapsack',      difficulty:'Medium', topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:136 },
      { title:'Job Sequencing Problem',            slug:'job-sequencing',           difficulty:'Medium', topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:137 },
      { title:'Huffman Coding',                    slug:'huffman-coding',           difficulty:'Hard',   topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:138 },
      { title:'N meetings in one room',            slug:'n-meetings',               difficulty:'Easy',   topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:139 },
      { title:'Minimum Platforms',                 slug:'minimum-platforms',        difficulty:'Medium', topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:140 },
      { title:'Jump Game',                         slug:'jump-game',                difficulty:'Medium', topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:141, leetcodeUrl:'https://leetcode.com/problems/jump-game' },
      { title:'Jump Game II',                      slug:'jump-game-2',              difficulty:'Medium', topic:'Greedy', sheet:'Striver A2Z', step:'Step 10: Greedy Algorithms', order:142, leetcodeUrl:'https://leetcode.com/problems/jump-game-ii' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 11: Binary Trees
      // ─────────────────────────────────────────
      { title:'Inorder Traversal',                 slug:'inorder-traversal',        difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:143, leetcodeUrl:'https://leetcode.com/problems/binary-tree-inorder-traversal' },
      { title:'Preorder Traversal',                slug:'preorder-traversal',       difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:144, leetcodeUrl:'https://leetcode.com/problems/binary-tree-preorder-traversal' },
      { title:'Postorder Traversal',               slug:'postorder-traversal',      difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:145, leetcodeUrl:'https://leetcode.com/problems/binary-tree-postorder-traversal' },
      { title:'Level Order Traversal',             slug:'level-order',              difficulty:'Medium', topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:146, leetcodeUrl:'https://leetcode.com/problems/binary-tree-level-order-traversal' },
      { title:'Height of Binary Tree',             slug:'height-binary-tree',       difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:147, leetcodeUrl:'https://leetcode.com/problems/maximum-depth-of-binary-tree' },
      { title:'Check Balanced Binary Tree',        slug:'balanced-binary-tree',     difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:148, leetcodeUrl:'https://leetcode.com/problems/balanced-binary-tree' },
      { title:'Diameter of Binary Tree',           slug:'diameter-binary-tree',     difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:149, leetcodeUrl:'https://leetcode.com/problems/diameter-of-binary-tree' },
      { title:'Maximum Path Sum',                  slug:'max-path-sum',             difficulty:'Hard',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:150, leetcodeUrl:'https://leetcode.com/problems/binary-tree-maximum-path-sum' },
      { title:'Identical Trees',                   slug:'identical-trees',          difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:151, leetcodeUrl:'https://leetcode.com/problems/same-tree' },
      { title:'Zigzag Traversal',                  slug:'zigzag-traversal',         difficulty:'Medium', topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:152, leetcodeUrl:'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal' },
      { title:'Boundary Traversal',                slug:'boundary-traversal',       difficulty:'Medium', topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:153 },
      { title:'Vertical Order Traversal',          slug:'vertical-order',           difficulty:'Hard',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:154, leetcodeUrl:'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree' },
      { title:'Top View of Binary Tree',           slug:'top-view',                 difficulty:'Medium', topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:155 },
      { title:'Bottom View of Binary Tree',        slug:'bottom-view',              difficulty:'Medium', topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:156 },
      { title:'Left and Right View',               slug:'left-right-view',          difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:157 },
      { title:'Symmetric Tree',                    slug:'symmetric-tree',           difficulty:'Easy',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:158, leetcodeUrl:'https://leetcode.com/problems/symmetric-tree' },
      { title:'Lowest Common Ancestor',            slug:'lca-binary-tree',          difficulty:'Medium', topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:159, leetcodeUrl:'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree' },
      { title:'Serialize and Deserialize',         slug:'serialize-deserialize',    difficulty:'Hard',   topic:'Trees', sheet:'Striver A2Z', step:'Step 11: Binary Trees', order:160, leetcodeUrl:'https://leetcode.com/problems/serialize-and-deserialize-binary-tree' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 12: BST
      // ─────────────────────────────────────────
      { title:'Search in BST',                     slug:'search-bst',               difficulty:'Easy',   topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:161, leetcodeUrl:'https://leetcode.com/problems/search-in-a-binary-search-tree' },
      { title:'Insert into BST',                   slug:'insert-bst',               difficulty:'Medium', topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:162, leetcodeUrl:'https://leetcode.com/problems/insert-into-a-binary-search-tree' },
      { title:'Delete from BST',                   slug:'delete-bst',               difficulty:'Medium', topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:163, leetcodeUrl:'https://leetcode.com/problems/delete-node-in-a-bst' },
      { title:'Kth Smallest in BST',               slug:'kth-smallest-bst',         difficulty:'Medium', topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:164, leetcodeUrl:'https://leetcode.com/problems/kth-smallest-element-in-a-bst' },
      { title:'Validate BST',                      slug:'validate-bst',             difficulty:'Medium', topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:165, leetcodeUrl:'https://leetcode.com/problems/validate-binary-search-tree' },
      { title:'LCA in BST',                        slug:'lca-bst',                  difficulty:'Easy',   topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:166, leetcodeUrl:'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree' },
      { title:'Construct BST from Preorder',       slug:'bst-from-preorder',        difficulty:'Medium', topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:167, leetcodeUrl:'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal' },
      { title:'Inorder Successor in BST',          slug:'inorder-successor-bst',    difficulty:'Medium', topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:168 },
      { title:'BST Iterator',                      slug:'bst-iterator',             difficulty:'Medium', topic:'BST', sheet:'Striver A2Z', step:'Step 12: BST', order:169, leetcodeUrl:'https://leetcode.com/problems/binary-search-tree-iterator' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 13: Graphs
      // ─────────────────────────────────────────
      { title:'BFS Traversal',                     slug:'bfs-graph',                difficulty:'Easy',   topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:170 },
      { title:'DFS Traversal',                     slug:'dfs-graph',                difficulty:'Easy',   topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:171 },
      { title:'Detect Cycle Undirected (BFS)',     slug:'cycle-undirected-bfs',     difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:172 },
      { title:'Detect Cycle Undirected (DFS)',     slug:'cycle-undirected-dfs',     difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:173 },
      { title:'Detect Cycle Directed (DFS)',       slug:'cycle-directed-dfs',       difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:174 },
      { title:'Topological Sort (DFS)',            slug:'topo-dfs',                 difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:175 },
      { title:'Topological Sort (BFS/Kahn)',       slug:'topo-bfs',                 difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:176 },
      { title:'Number of Islands',                 slug:'number-of-islands',        difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:177, leetcodeUrl:'https://leetcode.com/problems/number-of-islands' },
      { title:'Flood Fill',                        slug:'flood-fill',               difficulty:'Easy',   topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:178, leetcodeUrl:'https://leetcode.com/problems/flood-fill' },
      { title:'Rotten Oranges',                    slug:'rotten-oranges',           difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:179, leetcodeUrl:'https://leetcode.com/problems/rotting-oranges' },
      { title:'Dijkstra\'s Algorithm',             slug:'dijkstra',                 difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:180 },
      { title:'Bellman Ford Algorithm',            slug:'bellman-ford',             difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:181 },
      { title:'Floyd Warshall',                    slug:'floyd-warshall',           difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:182 },
      { title:'Prim\'s Algorithm (MST)',           slug:'prims-mst',                difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:183 },
      { title:'Kruskal\'s Algorithm (MST)',        slug:'kruskals-mst',             difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:184 },
      { title:'Course Schedule',                   slug:'course-schedule',          difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:185, leetcodeUrl:'https://leetcode.com/problems/course-schedule' },
      { title:'Clone Graph',                       slug:'clone-graph',              difficulty:'Medium', topic:'Graphs', sheet:'Striver A2Z', step:'Step 13: Graphs', order:186, leetcodeUrl:'https://leetcode.com/problems/clone-graph' },

      // ─────────────────────────────────────────
      // STRIVER A2Z — Step 14: Dynamic Programming
      // ─────────────────────────────────────────
      { title:'Climbing Stairs',                   slug:'climbing-stairs',          difficulty:'Easy',   topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:187, leetcodeUrl:'https://leetcode.com/problems/climbing-stairs' },
      { title:'Frog Jump',                         slug:'frog-jump-dp',             difficulty:'Easy',   topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:188 },
      { title:'House Robber',                      slug:'house-robber',             difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:189, leetcodeUrl:'https://leetcode.com/problems/house-robber' },
      { title:'House Robber II',                   slug:'house-robber-2',           difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:190, leetcodeUrl:'https://leetcode.com/problems/house-robber-ii' },
      { title:'0/1 Knapsack',                      slug:'01-knapsack',              difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:191 },
      { title:'Subset Sum',                        slug:'subset-sum-dp',            difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:192 },
      { title:'Coin Change',                       slug:'coin-change',              difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:193, leetcodeUrl:'https://leetcode.com/problems/coin-change' },
      { title:'Coin Change II',                    slug:'coin-change-2',            difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:194, leetcodeUrl:'https://leetcode.com/problems/coin-change-ii' },
      { title:'Longest Common Subsequence',        slug:'lcs',                      difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:195, leetcodeUrl:'https://leetcode.com/problems/longest-common-subsequence' },
      { title:'Longest Increasing Subsequence',    slug:'lis',                      difficulty:'Medium', topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:196, leetcodeUrl:'https://leetcode.com/problems/longest-increasing-subsequence' },
      { title:'Edit Distance',                     slug:'edit-distance',            difficulty:'Hard',   topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:197, leetcodeUrl:'https://leetcode.com/problems/edit-distance' },
      { title:'Matrix Chain Multiplication',       slug:'matrix-chain',             difficulty:'Hard',   topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:198 },
      { title:'Palindrome Partitioning II',        slug:'palindrome-partition-2',   difficulty:'Hard',   topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:199, leetcodeUrl:'https://leetcode.com/problems/palindrome-partitioning-ii' },
      { title:'Burst Balloons',                    slug:'burst-balloons',           difficulty:'Hard',   topic:'Dynamic Programming', sheet:'Striver A2Z', step:'Step 14: DP', order:200, leetcodeUrl:'https://leetcode.com/problems/burst-balloons' },

      // ─────────────────────────────────────────
      // BLIND 75
      // ─────────────────────────────────────────
      { title:'Two Sum',                           slug:'blind-two-sum',            difficulty:'Easy',   topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:1, leetcodeUrl:'https://leetcode.com/problems/two-sum' },
      { title:'Best Time to Buy and Sell Stock',   slug:'blind-buy-sell',           difficulty:'Easy',   topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:2, leetcodeUrl:'https://leetcode.com/problems/best-time-to-buy-and-sell-stock' },
      { title:'Contains Duplicate',               slug:'blind-contains-dup',        difficulty:'Easy',   topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:3, leetcodeUrl:'https://leetcode.com/problems/contains-duplicate' },
      { title:'Product of Array Except Self',     slug:'blind-product-except-self', difficulty:'Medium', topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:4, leetcodeUrl:'https://leetcode.com/problems/product-of-array-except-self' },
      { title:'Maximum Subarray',                  slug:'blind-max-subarray',       difficulty:'Medium', topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:5, leetcodeUrl:'https://leetcode.com/problems/maximum-subarray' },
      { title:'Maximum Product Subarray',          slug:'blind-max-product',        difficulty:'Medium', topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:6, leetcodeUrl:'https://leetcode.com/problems/maximum-product-subarray' },
      { title:'Find Minimum in Rotated Sorted',   slug:'blind-min-rotated',         difficulty:'Medium', topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:7, leetcodeUrl:'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array' },
      { title:'Search in Rotated Sorted Array',   slug:'blind-search-rotated',      difficulty:'Medium', topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:8, leetcodeUrl:'https://leetcode.com/problems/search-in-rotated-sorted-array' },
      { title:'3 Sum',                             slug:'blind-3sum',               difficulty:'Medium', topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:9, leetcodeUrl:'https://leetcode.com/problems/3sum' },
      { title:'Container With Most Water',         slug:'blind-container-water',    difficulty:'Medium', topic:'Arrays', sheet:'Blind 75', step:'Arrays & Hashing', order:10, leetcodeUrl:'https://leetcode.com/problems/container-with-most-water' },
      { title:'Valid Anagram',                     slug:'blind-valid-anagram',      difficulty:'Easy',   topic:'Strings', sheet:'Blind 75', step:'Strings', order:11, leetcodeUrl:'https://leetcode.com/problems/valid-anagram' },
      { title:'Valid Palindrome',                  slug:'blind-valid-palindrome',   difficulty:'Easy',   topic:'Strings', sheet:'Blind 75', step:'Strings', order:12, leetcodeUrl:'https://leetcode.com/problems/valid-palindrome' },
      { title:'Longest Substring Without Repeating', slug:'blind-longest-substr',   difficulty:'Medium', topic:'Strings', sheet:'Blind 75', step:'Strings', order:13, leetcodeUrl:'https://leetcode.com/problems/longest-substring-without-repeating-characters' },
      { title:'Longest Repeating Character Replacement', slug:'blind-char-replace', difficulty:'Medium', topic:'Strings', sheet:'Blind 75', step:'Strings', order:14, leetcodeUrl:'https://leetcode.com/problems/longest-repeating-character-replacement' },
      { title:'Minimum Window Substring',          slug:'blind-min-window',         difficulty:'Hard',   topic:'Strings', sheet:'Blind 75', step:'Strings', order:15, leetcodeUrl:'https://leetcode.com/problems/minimum-window-substring' },
      { title:'Valid Parentheses',                 slug:'blind-valid-parens',       difficulty:'Easy',   topic:'Strings', sheet:'Blind 75', step:'Strings', order:16, leetcodeUrl:'https://leetcode.com/problems/valid-parentheses' },
      { title:'Climbing Stairs',                   slug:'blind-climbing-stairs',    difficulty:'Easy',   topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:17, leetcodeUrl:'https://leetcode.com/problems/climbing-stairs' },
      { title:'Coin Change',                       slug:'blind-coin-change',        difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:18, leetcodeUrl:'https://leetcode.com/problems/coin-change' },
      { title:'Longest Increasing Subsequence',    slug:'blind-lis',               difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:19, leetcodeUrl:'https://leetcode.com/problems/longest-increasing-subsequence' },
      { title:'Longest Common Subsequence',        slug:'blind-lcs',               difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:20, leetcodeUrl:'https://leetcode.com/problems/longest-common-subsequence' },
      { title:'Word Break',                        slug:'blind-word-break',        difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:21, leetcodeUrl:'https://leetcode.com/problems/word-break' },
      { title:'Combination Sum',                   slug:'blind-combination-sum',   difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:22, leetcodeUrl:'https://leetcode.com/problems/combination-sum' },
      { title:'House Robber',                      slug:'blind-house-robber',      difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:23, leetcodeUrl:'https://leetcode.com/problems/house-robber' },
      { title:'House Robber II',                   slug:'blind-house-robber-2',    difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:24, leetcodeUrl:'https://leetcode.com/problems/house-robber-ii' },
      { title:'Decode Ways',                       slug:'blind-decode-ways',       difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:25, leetcodeUrl:'https://leetcode.com/problems/decode-ways' },
      { title:'Unique Paths',                      slug:'blind-unique-paths',      difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:26, leetcodeUrl:'https://leetcode.com/problems/unique-paths' },
      { title:'Jump Game',                         slug:'blind-jump-game',         difficulty:'Medium', topic:'Dynamic Programming', sheet:'Blind 75', step:'Dynamic Programming', order:27, leetcodeUrl:'https://leetcode.com/problems/jump-game' },
      { title:'Invert Binary Tree',                slug:'blind-invert-tree',       difficulty:'Easy',   topic:'Trees', sheet:'Blind 75', step:'Trees', order:28, leetcodeUrl:'https://leetcode.com/problems/invert-binary-tree' },
      { title:'Maximum Depth of Binary Tree',      slug:'blind-max-depth',         difficulty:'Easy',   topic:'Trees', sheet:'Blind 75', step:'Trees', order:29, leetcodeUrl:'https://leetcode.com/problems/maximum-depth-of-binary-tree' },
      { title:'Same Tree',                         slug:'blind-same-tree',         difficulty:'Easy',   topic:'Trees', sheet:'Blind 75', step:'Trees', order:30, leetcodeUrl:'https://leetcode.com/problems/same-tree' },
      { title:'Subtree of Another Tree',           slug:'blind-subtree',           difficulty:'Easy',   topic:'Trees', sheet:'Blind 75', step:'Trees', order:31, leetcodeUrl:'https://leetcode.com/problems/subtree-of-another-tree' },
      { title:'Lowest Common Ancestor BST',        slug:'blind-lca-bst',           difficulty:'Medium', topic:'Trees', sheet:'Blind 75', step:'Trees', order:32, leetcodeUrl:'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree' },
      { title:'Binary Tree Level Order Traversal', slug:'blind-level-order',       difficulty:'Medium', topic:'Trees', sheet:'Blind 75', step:'Trees', order:33, leetcodeUrl:'https://leetcode.com/problems/binary-tree-level-order-traversal' },
      { title:'Validate BST',                      slug:'blind-validate-bst',      difficulty:'Medium', topic:'Trees', sheet:'Blind 75', step:'Trees', order:34, leetcodeUrl:'https://leetcode.com/problems/validate-binary-search-tree' },
      { title:'Kth Smallest in BST',               slug:'blind-kth-smallest',      difficulty:'Medium', topic:'Trees', sheet:'Blind 75', step:'Trees', order:35, leetcodeUrl:'https://leetcode.com/problems/kth-smallest-element-in-a-bst' },
      { title:'Construct Tree from Pre and Inorder', slug:'blind-construct-tree',  difficulty:'Medium', topic:'Trees', sheet:'Blind 75', step:'Trees', order:36, leetcodeUrl:'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal' },
      { title:'Binary Tree Max Path Sum',          slug:'blind-max-path-sum',      difficulty:'Hard',   topic:'Trees', sheet:'Blind 75', step:'Trees', order:37, leetcodeUrl:'https://leetcode.com/problems/binary-tree-maximum-path-sum' },
      { title:'Serialize and Deserialize',         slug:'blind-serialize',         difficulty:'Hard',   topic:'Trees', sheet:'Blind 75', step:'Trees', order:38, leetcodeUrl:'https://leetcode.com/problems/serialize-and-deserialize-binary-tree' },
      { title:'Number of Islands',                 slug:'blind-num-islands',       difficulty:'Medium', topic:'Graphs', sheet:'Blind 75', step:'Graphs', order:39, leetcodeUrl:'https://leetcode.com/problems/number-of-islands' },
      { title:'Clone Graph',                       slug:'blind-clone-graph',       difficulty:'Medium', topic:'Graphs', sheet:'Blind 75', step:'Graphs', order:40, leetcodeUrl:'https://leetcode.com/problems/clone-graph' },
      { title:'Pacific Atlantic Water Flow',       slug:'blind-pacific-atlantic',  difficulty:'Medium', topic:'Graphs', sheet:'Blind 75', step:'Graphs', order:41, leetcodeUrl:'https://leetcode.com/problems/pacific-atlantic-water-flow' },
      { title:'Course Schedule',                   slug:'blind-course-schedule',   difficulty:'Medium', topic:'Graphs', sheet:'Blind 75', step:'Graphs', order:42, leetcodeUrl:'https://leetcode.com/problems/course-schedule' },
      { title:'Reverse Linked List',               slug:'blind-reverse-ll',        difficulty:'Easy',   topic:'Linked List', sheet:'Blind 75', step:'Linked List', order:43, leetcodeUrl:'https://leetcode.com/problems/reverse-linked-list' },
      { title:'Linked List Cycle',                 slug:'blind-ll-cycle',          difficulty:'Easy',   topic:'Linked List', sheet:'Blind 75', step:'Linked List', order:44, leetcodeUrl:'https://leetcode.com/problems/linked-list-cycle' },
      { title:'Merge Two Sorted Lists',            slug:'blind-merge-lists',       difficulty:'Easy',   topic:'Linked List', sheet:'Blind 75', step:'Linked List', order:45, leetcodeUrl:'https://leetcode.com/problems/merge-two-sorted-lists' },
      { title:'Merge K Sorted Lists',              slug:'blind-merge-k',           difficulty:'Hard',   topic:'Linked List', sheet:'Blind 75', step:'Linked List', order:46, leetcodeUrl:'https://leetcode.com/problems/merge-k-sorted-lists' },
      { title:'Remove Nth Node From End',          slug:'blind-remove-nth',        difficulty:'Medium', topic:'Linked List', sheet:'Blind 75', step:'Linked List', order:47, leetcodeUrl:'https://leetcode.com/problems/remove-nth-node-from-end-of-list' },
      { title:'Reorder List',                      slug:'blind-reorder-list',      difficulty:'Medium', topic:'Linked List', sheet:'Blind 75', step:'Linked List', order:48, leetcodeUrl:'https://leetcode.com/problems/reorder-list' },

      // ─────────────────────────────────────────
      // NEETCODE 150 — Extra problems
      // ─────────────────────────────────────────
      { title:'Duplicate Integer',                 slug:'nc-duplicate-int',        difficulty:'Easy',   topic:'Arrays', sheet:'NeetCode 150', step:'Arrays & Hashing', order:1, leetcodeUrl:'https://leetcode.com/problems/contains-duplicate' },
      { title:'Is Anagram',                        slug:'nc-is-anagram',           difficulty:'Easy',   topic:'Strings', sheet:'NeetCode 150', step:'Arrays & Hashing', order:2, leetcodeUrl:'https://leetcode.com/problems/valid-anagram' },
      { title:'Two Sum',                           slug:'nc-two-sum',              difficulty:'Easy',   topic:'Arrays', sheet:'NeetCode 150', step:'Arrays & Hashing', order:3, leetcodeUrl:'https://leetcode.com/problems/two-sum' },
      { title:'Group Anagrams',                    slug:'nc-group-anagrams',       difficulty:'Medium', topic:'Strings', sheet:'NeetCode 150', step:'Arrays & Hashing', order:4, leetcodeUrl:'https://leetcode.com/problems/group-anagrams' },
      { title:'Top K Frequent Elements',           slug:'nc-top-k',                difficulty:'Medium', topic:'Arrays', sheet:'NeetCode 150', step:'Arrays & Hashing', order:5, leetcodeUrl:'https://leetcode.com/problems/top-k-frequent-elements' },
      { title:'Encode and Decode Strings',         slug:'nc-encode-decode',        difficulty:'Medium', topic:'Strings', sheet:'NeetCode 150', step:'Arrays & Hashing', order:6 },
      { title:'Product of Array Except Self',      slug:'nc-product-except',       difficulty:'Medium', topic:'Arrays', sheet:'NeetCode 150', step:'Arrays & Hashing', order:7, leetcodeUrl:'https://leetcode.com/problems/product-of-array-except-self' },
      { title:'Valid Sudoku',                      slug:'nc-valid-sudoku',         difficulty:'Medium', topic:'Arrays', sheet:'NeetCode 150', step:'Arrays & Hashing', order:8, leetcodeUrl:'https://leetcode.com/problems/valid-sudoku' },
      { title:'Longest Consecutive Sequence',      slug:'nc-longest-consecutive',  difficulty:'Medium', topic:'Arrays', sheet:'NeetCode 150', step:'Arrays & Hashing', order:9, leetcodeUrl:'https://leetcode.com/problems/longest-consecutive-sequence' },
      { title:'Two Pointers: Valid Palindrome',    slug:'nc-valid-palindrome',     difficulty:'Easy',   topic:'Two Pointers', sheet:'NeetCode 150', step:'Two Pointers', order:10, leetcodeUrl:'https://leetcode.com/problems/valid-palindrome' },
      { title:'Two Sum II',                        slug:'nc-two-sum-2',            difficulty:'Medium', topic:'Two Pointers', sheet:'NeetCode 150', step:'Two Pointers', order:11, leetcodeUrl:'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted' },
      { title:'3Sum',                              slug:'nc-3sum',                 difficulty:'Medium', topic:'Two Pointers', sheet:'NeetCode 150', step:'Two Pointers', order:12, leetcodeUrl:'https://leetcode.com/problems/3sum' },
      { title:'Container With Most Water',         slug:'nc-container-water',      difficulty:'Medium', topic:'Two Pointers', sheet:'NeetCode 150', step:'Two Pointers', order:13, leetcodeUrl:'https://leetcode.com/problems/container-with-most-water' },
      { title:'Trapping Rain Water',               slug:'nc-trapping-rain',        difficulty:'Hard',   topic:'Two Pointers', sheet:'NeetCode 150', step:'Two Pointers', order:14, leetcodeUrl:'https://leetcode.com/problems/trapping-rain-water' },
      { title:'Best Time to Buy and Sell Stock',   slug:'nc-buy-sell',             difficulty:'Easy',   topic:'Sliding Window', sheet:'NeetCode 150', step:'Sliding Window', order:15, leetcodeUrl:'https://leetcode.com/problems/best-time-to-buy-and-sell-stock' },
      { title:'Longest Substring Without Repeating', slug:'nc-longest-substr',     difficulty:'Medium', topic:'Sliding Window', sheet:'NeetCode 150', step:'Sliding Window', order:16, leetcodeUrl:'https://leetcode.com/problems/longest-substring-without-repeating-characters' },
      { title:'Longest Repeating Character',       slug:'nc-longest-char',         difficulty:'Medium', topic:'Sliding Window', sheet:'NeetCode 150', step:'Sliding Window', order:17, leetcodeUrl:'https://leetcode.com/problems/longest-repeating-character-replacement' },
      { title:'Permutation in String',             slug:'nc-permutation-string',   difficulty:'Medium', topic:'Sliding Window', sheet:'NeetCode 150', step:'Sliding Window', order:18, leetcodeUrl:'https://leetcode.com/problems/permutation-in-string' },
      { title:'Minimum Window Substring',          slug:'nc-min-window',           difficulty:'Hard',   topic:'Sliding Window', sheet:'NeetCode 150', step:'Sliding Window', order:19, leetcodeUrl:'https://leetcode.com/problems/minimum-window-substring' },
      { title:'Sliding Window Maximum',            slug:'nc-sliding-max',          difficulty:'Hard',   topic:'Sliding Window', sheet:'NeetCode 150', step:'Sliding Window', order:20, leetcodeUrl:'https://leetcode.com/problems/sliding-window-maximum' },
    ];

    await DSAProblem.insertMany(problems);
    res.json({ success: true, message: `${problems.length} problems seeded!` });

  } catch (error) {
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
};
module.exports = { getProblems, markSolved, markUnsolved, getUserProgress, seedProblems };