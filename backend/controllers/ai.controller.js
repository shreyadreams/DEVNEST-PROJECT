const axios = require('axios');
const UserProgress = require('../models/UserProgress.model');
const DSAProblem = require('../models/DSAProblem.model');

// ─────────────────────────────────────────
// POST /api/ai/roadmap
// User ka progress dekho → Claude se roadmap lo
// ─────────────────────────────────────────
const getRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;

    // User ka solved problems fetch karo
    const solvedList = await UserProgress.find({
      user: userId, solved: true
    }).populate('problem');

    const totalProblems = await DSAProblem.countDocuments();
    const totalSolved = solvedList.length;

    // Topic wise progress
    const topicWise = {};
    solvedList.forEach(entry => {
      const topic = entry.problem.topic;
      topicWise[topic] = (topicWise[topic] || 0) + 1;
    });

    // Weak topics nikalo — jo topics mein 0 ya kam solved hain
    const allTopics = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming', 'Graphs'];
    const weakTopics = allTopics.filter(topic => !topicWise[topic] || topicWise[topic] < 2);

    // Claude API call
    const prompt = `
You are an expert coding interview mentor. Analyze this developer's DSA progress and give personalized advice.

Developer Stats:
- Total Problems Solved: ${totalSolved} out of ${totalProblems}
- Topic-wise Progress: ${JSON.stringify(topicWise)}
- Weak Topics (less than 2 problems solved): ${weakTopics.join(', ')}

Please provide:
1. A personalized 4-week study roadmap (week by week)
2. Top 3 topics to focus on RIGHT NOW
3. Interview readiness scores for these companies (0-100):
   - Google
   - Amazon  
   - Microsoft
   - Flipkart
4. One motivational tip

Keep response concise and actionable. Format as JSON with keys:
{
  "roadmap": [{"week": 1, "focus": "...", "tasks": ["...", "..."]}],
  "topTopics": ["topic1", "topic2", "topic3"],
  "readinessScores": {"Google": 0, "Amazon": 0, "Microsoft": 0, "Flipkart": 0},
  "tip": "..."
}
`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    // Response parse karo
    const rawText = response.data.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!aiData) {
      return res.status(500).json({ message: 'AI response parsing failed' });
    }

    res.json({
      success: true,
      data: {
        ...aiData,
        stats: {
          totalSolved,
          totalProblems,
          topicWise,
          weakTopics,
          percentage: Math.round((totalSolved / totalProblems) * 100)
        }
      }
    });

  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

module.exports = { getRoadmap };