const stringSimilarity = require('string-similarity');
const pool = require('../config/database');

class PlagiarismService {
  /**
   * Calculate similarity between two texts
   */
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    // Normalize texts
    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);

    if (normalized1.length === 0 || normalized2.length === 0) return 0;

    // Use Dice coefficient for similarity
    const similarity = stringSimilarity.compareTwoStrings(normalized1, normalized2);
    return Math.round(similarity * 100 * 100) / 100; // Return as percentage with 2 decimals
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
    // Simple implementation - extract first 200 chars of matching content
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
   * Perform comprehensive plagiarism check
   */
  async performPlagiarismCheck(submissionId, assignmentId, text) {
    try {
      // Check against other submissions
      const submissionMatches = await this.checkAgainstSubmissions(submissionId, assignmentId, text);

      // Check against external sources
      const externalMatches = await this.checkAgainstExternalSources(text);

      // Combine results
      const allMatches = [...submissionMatches.matches, ...externalMatches.matches];
      const overallMaxSimilarity = Math.max(submissionMatches.maxSimilarity, externalMatches.maxSimilarity);

      // Save matches to database
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

      // Update submission with similarity score
      const status = overallMaxSimilarity > 50 ? 'rejected' : 'checked';
      const rejectionReason = overallMaxSimilarity > 50
        ? `Assignment rejected due to ${overallMaxSimilarity.toFixed(2)}% similarity with other sources. Maximum allowed similarity is 50%.`
        : null;

      await pool.execute(
        `UPDATE submissions 
         SET similarity_score = ?, status = ?, rejection_reason = ?, checked_at = NOW()
         WHERE id = ?`,
        [overallMaxSimilarity, status, rejectionReason, submissionId]
      );

      return {
        similarityScore: overallMaxSimilarity,
        status: status,
        rejectionReason: rejectionReason,
        matches: allMatches
      };
    } catch (error) {
      console.error('Error performing plagiarism check:', error);
      throw error;
    }
  }
}

module.exports = new PlagiarismService();

