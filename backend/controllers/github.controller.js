const axios = require('axios');

const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: process.env.GITHUB_TOKEN
      ? `token ${process.env.GITHUB_TOKEN}`
      : '',
    Accept: 'application/vnd.github.v3+json'
  }
});

const getGithubStats = async (req, res) => {
  try {
    const { username } = req.params;

    const profileRes = await githubAPI.get(`/users/${username}`);
    const profile = profileRes.data;

    const reposRes = await githubAPI.get(`/users/${username}/repos`, {
      params: { per_page: 100, sort: 'updated' }
    });
    const repos = reposRes.data;

    const languageCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, count }));

    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const eventsRes = await githubAPI.get(`/users/${username}/events`, {
      params: { per_page: 100 }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCommits = eventsRes.data.filter(event =>
      event.type === 'PushEvent' &&
      new Date(event.created_at) > thirtyDaysAgo
    ).length;

    res.json({
      success: true,
      data: {
        name:        profile.name || username,
        username:    profile.login,
        avatar:      profile.avatar_url,
        bio:         profile.bio || '',
        location:    profile.location || '',
        followers:   profile.followers,
        following:   profile.following,
        profileUrl:  profile.html_url,
        totalRepos:  profile.public_repos,
        totalStars,
        recentCommits,
        topLanguages,
        joinedAt:    profile.created_at
      }
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' });
    }
    if (error.response?.status === 403) {
      return res.status(403).json({ message: 'GitHub API rate limit exceeded' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getGithubRepos = async (req, res) => {
  try {
    const { username } = req.params;

    const reposRes = await githubAPI.get(`/users/${username}/repos`, {
      params: { per_page: 50, sort: 'updated', type: 'owner' }
    });

    const repos = reposRes.data
      .filter(repo => !repo.fork)
      .map(repo => ({
        id:          repo.id,
        name:        repo.name,
        description: repo.description || '',
        language:    repo.language || 'Unknown',
        stars:       repo.stargazers_count,
        forks:       repo.forks_count,
        url:         repo.html_url,
        homepage:    repo.homepage || '',
        updatedAt:   repo.updated_at,
        topics:      repo.topics || []
      }));

    res.json({ success: true, repos, total: repos.length });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getContributionData = async (req, res) => {
  try {
    const { username } = req.params;

    const eventsRes = await githubAPI.get(`/users/${username}/events`, {
      params: { per_page: 100 }
    });

    const pushEvents = eventsRes.data.filter(e => e.type === 'PushEvent');

    const contributionMap = {};
    pushEvents.forEach(event => {
      const date = event.created_at.split('T')[0];
      const commitsInPush = event.payload.commits?.length || 1;
      contributionMap[date] = (contributionMap[date] || 0) + commitsInPush;
    });

    const contributions = Object.entries(contributionMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, contributions });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getGithubStats, getGithubRepos, getContributionData };