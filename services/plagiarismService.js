const stringSimilarity = require('string-similarity');
const pool = require('../config/database');

// Optional: spell checker for plagiarism score (spelling + AI, etc.)
let spellDictionary = null;
function getSpellDictionary(callback) {
  if (spellDictionary) return callback(null, spellDictionary);
  try {
    const SpellChecker = require('simple-spellchecker');
    SpellChecker.getDictionary('en-US', (err, dict) => {
      if (!err && dict) spellDictionary = dict;
      callback(err, spellDictionary || dict);
    });
  } catch (e) {
    callback(e, null);
  }
}

class PlagiarismService {
  /**
   * Normalize text for comparison
   */
  normalize(text) {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate similarity between two texts (existing – copy/similarity detection)
   */
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    const normalized1 = this.normalize(text1);
    const normalized2 = this.normalize(text2);

    if (normalized1.length === 0 || normalized2.length === 0) return 0;

    const similarity = stringSimilarity.compareTwoStrings(normalized1, normalized2);
    return Math.round(similarity * 100 * 100) / 100;
  }

  /**
   * Compute plagiarism score from writing quality: spelling mistakes, AI content, etc.
   * Returns { plagiarismScore (0–100, higher = more issues), spellingErrorsCount, totalWords, aiScore }.
   */
  computeWritingPlagiarismScore(text, callback) {
    if (!text || typeof text !== 'string') {
      return callback(null, { plagiarismScore: 0, spellingErrorsCount: 0, totalWords: 0, aiScore: 0 });
    }

    const words = this.normalize(text).split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return callback(null, { plagiarismScore: 0, spellingErrorsCount: 0, totalWords: 0, aiScore: 0 });
    }

    getSpellDictionary((err, dict) => {
      let spellingErrorsCount = 0;
      const skipPattern = /^[0-9]+$/; // skip pure numbers

      if (err || !dict) {
        // No dictionary: no spelling penalty
        const plagiarismScore = 0;
        return callback(null, {
          plagiarismScore,
          spellingErrorsCount: 0,
          totalWords: words.length,
          aiScore: 0
        });
      }

      for (const word of words) {
        if (word.length <= 1 || skipPattern.test(word)) continue;
        if (!dict.spellCheck(word)) spellingErrorsCount++;
      }

      const spellingErrorPct = words.length > 0
        ? Math.round((spellingErrorsCount / words.length) * 100 * 100) / 100
        : 0;
      // AI detection: placeholder (0 = not detected). Integrate an API here if needed.
      const aiScore = 0;
      const plagiarismScore = Math.min(100, Math.round((spellingErrorPct * 0.8 + aiScore * 0.2) * 100) / 100);

      callback(null, {
        plagiarismScore,
        spellingErrorsCount,
        totalWords: words.length,
        aiScore
      });
    });
  }

  /**
   * Check plagiarism against other submissions
   */
  async checkAgainstSubmissions(submissionId, assignmentId, text) {
    try {
      const [submissions] = await pool.execute(
        `SELECT id, extracted_text, student_id, file_name 
         FROM submissions 
         WHERE assignment_id = ? AND id != ? AND extracted_text IS NOT NULL AND extracted_text != ''`,
        [assignmentId, submissionId]
      );

      const matches = [];
      let maxSimilarity = 0;

      for (const submission of submissions) {
        const similarity = this.calculateSimilarity(text, submission.extracted_text);

        if (similarity > 0) {
          matches.push({
            submission_id: submission.id,
            matched_submission_id: submission.id,
            matched_source_type: 'submission',
            similarity_percentage: similarity,
            matched_text: this.extractSimilarSections(text, submission.extracted_text)
          });

          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
          }
        }
      }

      return { matches, maxSimilarity };
    } catch (error) {
      console.error('Error checking against submissions:', error);
      throw error;
    }
  }

  /**
   * Check plagiarism against external sources
   */
  async checkAgainstExternalSources(text) {
    try {
      const [sources] = await pool.execute(
        `SELECT id, extracted_text, title 
         FROM external_sources 
         WHERE extracted_text IS NOT NULL AND extracted_text != ''`
      );

      const matches = [];
      let maxSimilarity = 0;

      for (const source of sources) {
        const similarity = this.calculateSimilarity(text, source.extracted_text);

        if (similarity > 0) {
          matches.push({
            submission_id: null,
            matched_submission_id: null,
            matched_source_type: 'external',
            similarity_percentage: similarity,
            matched_text: this.extractSimilarSections(text, source.extracted_text),
            external_source_id: source.id,
            external_source_title: source.title
          });

          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
          }
        }
      }

      return { matches, maxSimilarity };
    } catch (error) {
      console.error('Error checking against external sources:', error);
      throw error;
    }
  }

  /**
   * Extract similar sections between two texts
   */
  extractSimilarSections(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    let commonWords = [];
    for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
      if (words1[i] === words2[i]) {
        commonWords.push(words1[i]);
      }
    }

    return commonWords.slice(0, 20).join(' ') || 'Similar content detected';
  }

  /**
   * Perform plagiarism check:
   * - Similarity score (existing): match with other submissions/sources.
   * - Plagiarism score (new): writing quality – spelling mistakes, AI content, etc.
   */
  async performPlagiarismCheck(submissionId, assignmentId, text) {
    try {
      // --- Similarity (copy detection) ---
      const submissionMatches = await this.checkAgainstSubmissions(submissionId, assignmentId, text);
      const externalMatches = await this.checkAgainstExternalSources(text);

      const allMatches = [...submissionMatches.matches, ...externalMatches.matches];
      const overallMaxSimilarity = Math.max(submissionMatches.maxSimilarity, externalMatches.maxSimilarity);

      // Rejection based only on similarity (as before)
      const status = overallMaxSimilarity > 50 ? 'rejected' : 'checked';
      const rejectionReason = overallMaxSimilarity > 50
        ? `Assignment rejected due to ${overallMaxSimilarity.toFixed(2)}% similarity with other sources. Maximum allowed is 50%.`
        : null;

      // --- Plagiarism score (writing: spelling, AI, etc.) ---
      const writingResult = await new Promise((resolve) => {
        this.computeWritingPlagiarismScore(text, (err, result) => {
          resolve(err ? { plagiarismScore: 0, spellingErrorsCount: 0, totalWords: 0, aiScore: 0 } : result);
        });
      });

      const { plagiarismScore, spellingErrorsCount, totalWords, aiScore } = writingResult;

      // Save similarity matches to database
      if (allMatches.length > 0) {
        for (const match of allMatches) {
          await pool.execute(
            `INSERT INTO plagiarism_matches 
             (submission_id, matched_submission_id, matched_source_type, similarity_percentage, matched_text)
             VALUES (?, ?, ?, ?, ?)`,
            [
              submissionId,
              match.matched_submission_id || null,
              match.matched_source_type,
              match.similarity_percentage,
              match.matched_text
            ]
          );
        }
      }

      // Update submission: similarity_score (copy), plagiarism_score (writing)
      await pool.execute(
        `UPDATE submissions 
         SET similarity_score = ?, status = ?, rejection_reason = ?, checked_at = NOW()
         WHERE id = ?`,
        [overallMaxSimilarity, status, rejectionReason, submissionId]
      );

      try {
        await pool.execute(
          `UPDATE submissions SET plagiarism_score = ?, originality_score = ? WHERE id = ?`,
          [plagiarismScore, Math.round((100 - plagiarismScore) * 100) / 100, submissionId]
        );
      } catch (e) {
        // Columns may not exist
      }

      return {
        similarityScore: overallMaxSimilarity,
        plagiarismScore,
        spellingErrorsCount,
        totalWords,
        aiScore,
        status,
        rejectionReason,
        matches: allMatches
      };
    } catch (error) {
      console.error('Error performing plagiarism check:', error);
      throw error;
    }
  }
}

module.exports = new PlagiarismService();
