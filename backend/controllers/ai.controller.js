const axios = require('axios');

// ─────────────────────────────────────────
// LeetCode Stats — Official GraphQL API
// ─────────────────────────────────────────
const getLeetCodeStats = async (username) => {
  try {
    const res = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `query($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum { difficulty count }
            }
            profile { ranking }
          }
        }`,
        variables: { username }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    const nums = res.data?.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!nums) return null;
    const easy   = nums.find(s => s.difficulty === 'Easy')?.count   || 0;
    const medium = nums.find(s => s.difficulty === 'Medium')?.count || 0;
    const hard   = nums.find(s => s.difficulty === 'Hard')?.count   || 0;
    return {
      platform: 'LeetCode',
      totalSolved: easy + medium + hard,
      easy, medium, hard,
      ranking: res.data?.data?.matchedUser?.profile?.ranking || 0
    };
  } catch (err) {
    console.log('LeetCode fetch failed:', err.message);
    return null;
  }
};

// ─────────────────────────────────────────
// GFG Stats — Multiple fallback APIs
// ─────────────────────────────────────────
const getGFGStats = async (username) => {
  // Try multiple GFG API endpoints
  const endpoints = [
    `https://geeks-for-geeks-stats-api.vercel.app/?raw=Y&userName=${username}`,
    `https://gfgstatsapi.vercel.app/api/${username}`,
    `https://geeksforgeeks-api.vercel.app/api/${username}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await axios.get(url, {
        timeout: 8000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const d = res.data;
      if (!d || d.status === 'error' || d.error) continue;

      // Handle different response shapes
      const totalSolved = d.totalProblemsSolved || d.total_problems_solved || 
                          d.solved || d.info?.totalProblemsSolved || 0;
      const easy   = d.Easy?.count   || d.easy   || d.info?.easy   || 0;
      const medium = d.Medium?.count || d.medium || d.info?.medium || 0;
      const hard   = d.Hard?.count   || d.hard   || d.info?.hard   || 0;
      const school = d.School?.count || d.school || 0;
      const score  = d.codingScore   || d.score  || d.info?.codingScore || 0;

      if (totalSolved > 0 || easy > 0 || medium > 0 || hard > 0) {
        return { platform: 'GeeksForGeeks', totalSolved, easy, medium, hard, school, score };
      }
    } catch (err) {
      console.log(`GFG endpoint failed (${url}):`, err.message);
    }
  }

  // Final fallback: scrape GFG profile page
  try {
    const res = await axios.get(
      `https://auth.geeksforgeeks.org/user/${username}/practice/`,
      { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const html = res.data;
    const scoreMatch = html.match(/Coding Score.*?(\d+)/s);
    const solvedMatch = html.match(/Problems Solved.*?(\d+)/s);
    if (solvedMatch || scoreMatch) {
      return {
        platform: 'GeeksForGeeks',
        totalSolved: parseInt(solvedMatch?.[1] || '0'),
        easy: 0, medium: 0, hard: 0, school: 0,
        score: parseInt(scoreMatch?.[1] || '0')
      };
    }
  } catch (err) {
    console.log('GFG scrape failed:', err.message);
  }

  console.log('All GFG endpoints failed for:', username);
  return null;
};

// ─────────────────────────────────────────
// Codeforces Stats — Official API (reliable)
// ─────────────────────────────────────────
const getCodeforcesStats = async (username) => {
  try {
    const [userRes, subsRes] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${username}`, { timeout: 10000 }),
      axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=2000`, { timeout: 10000 })
    ]);

    if (userRes.data?.status !== 'OK') return null;
    const user = userRes.data.result[0];

    const solved = new Set();
    (subsRes.data?.result || []).forEach(sub => {
      if (sub.verdict === 'OK') {
        solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    });

    return {
      platform: 'Codeforces',
      totalSolved: solved.size,
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      maxRank: user.maxRank || 'unrated'
    };
  } catch (err) {
    console.log('Codeforces fetch failed:', err.message);
    return null;
  }
};

// ─────────────────────────────────────────
// GitHub Stats
// ─────────────────────────────────────────
const getGitHubStats = async (username) => {
  try {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      })
    };

    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 10000 }),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers, timeout: 10000 })
    ]);

    const repos = reposRes.data;
    const languages = {};
    let totalStars = 0;
    repos.forEach(repo => {
      if (repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
      totalStars += repo.stargazers_count || 0;
    });

    return {
      platform: 'GitHub',
      publicRepos: userRes.data.public_repos,
      followers: userRes.data.followers,
      totalStars,
      topLanguages: Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([lang]) => lang)
    };
  } catch (err) {
    console.log('GitHub fetch failed:', err.message);
    return null;
  }
};

// ─────────────────────────────────────────
// POST /api/ai/roadmap
// ─────────────────────────────────────────
const getRoadmap = async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user._id);

    // Fetch all platforms in parallel
    const [leetcode, gfg, codeforces, github] = await Promise.all([
      user.leetcodeUsername   ? getLeetCodeStats(user.leetcodeUsername)     : null,
      user.gfgUsername        ? getGFGStats(user.gfgUsername)               : null,
      user.codeforcesUsername ? getCodeforcesStats(user.codeforcesUsername) : null,
      user.githubUsername     ? getGitHubStats(user.githubUsername)         : null,
    ]);

    // Log what we got
    console.log('Platform stats fetched:', {
      leetcode: leetcode ? `${leetcode.totalSolved} solved` : 'not connected',
      gfg: gfg ? `${gfg.totalSolved} solved` : 'not connected / failed',
      codeforces: codeforces ? `${codeforces.totalSolved} solved` : 'not connected / failed',
      github: github ? `${github.publicRepos} repos` : 'not connected',
    });

    const totalDSASolved = (leetcode?.totalSolved || 0) + (gfg?.totalSolved || 0) + (codeforces?.totalSolved || 0);
    const connectedCount = [leetcode, gfg, codeforces, github].filter(Boolean).length;

    // Build prompt summary
    const platformSummary = [
      leetcode   && `LeetCode: ${leetcode.totalSolved} problems (Easy:${leetcode.easy}, Med:${leetcode.medium}, Hard:${leetcode.hard})`,
      gfg        && `GFG: ${gfg.totalSolved} problems solved, score: ${gfg.score}`,
      codeforces && `Codeforces: ${codeforces.totalSolved} problems, rating: ${codeforces.rating} (${codeforces.rank})`,
      github     && `GitHub: ${github.publicRepos} repos, top languages: ${github.topLanguages.join(', ')}`,
    ].filter(Boolean).join('\n');

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GROQ_API_KEY not set in .env' });
    }

    const prompt = `You are an expert coding interview mentor for Indian developers preparing for placements.

REAL platform data:
${platformSummary || 'No platforms connected yet — give general beginner advice'}

Provide a JSON response only. No markdown, no extra text, start directly with {:

{
  "roadmap": [
    {"week": 1, "focus": "...", "tasks": ["...", "...", "..."]},
    {"week": 2, "focus": "...", "tasks": ["...", "...", "..."]},
    {"week": 3, "focus": "...", "tasks": ["...", "...", "..."]},
    {"week": 4, "focus": "...", "tasks": ["...", "...", "..."]}
  ],
  "topTopics": ["topic1", "topic2", "topic3"],
  "tip": "one specific motivational tip",
  "strengths": ["strength based on data", "another strength"],
  "improvements": ["specific area to improve", "another area"]
}`;

    const groqRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a coding mentor. Respond only with valid JSON starting with {. No markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1200
      },
      { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );

    const rawText = groqRes.data.choices?.[0]?.message?.content;
    if (!rawText) return res.status(500).json({ message: 'Groq returned empty response' });

    let aiData = null;
    try {
      const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      aiData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse failed:', rawText.substring(0, 300));
      return res.status(500).json({ message: 'AI response parsing failed', raw: rawText });
    }

    res.json({
      success: true,
      data: {
        ...aiData,
        platformStats: {
          leetcode,
          gfg,
          codeforces,
          github,
          totalDSASolved,
          connectedCount
        }
      }
    });

  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, JSON.stringify(error.response.data));
      return res.status(500).json({
        message: 'AI service error',
        detail: error.response.data?.error?.message || error.message
      });
    }
    console.error('Controller Error:', error.message);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

module.exports = { getRoadmap };