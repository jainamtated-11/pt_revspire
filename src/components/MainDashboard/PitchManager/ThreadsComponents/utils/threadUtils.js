/**
 * Parse the commented_by JSON string to an object
 * @param {string} commentedByString - The JSON string to parse
 * @returns {Object} Parsed object with name and email
 */
export const parseCommentedBy = (commentedByString) => {
  try {
    return JSON.parse(commentedByString);
  } catch (e) {
    return { name: 'Unknown User', email: '' };
  }
};

/**
 * Extract domain from an email address
 * @param {string} email - The email to extract domain from
 * @returns {string} The domain part of the email
 */
export const getEmailDomain = (email) => {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1];
};

/**
 * Sort threads by creation date (newest first)
 * @param {Array} threads - The threads to sort
 * @returns {Array} Sorted threads
 */
export const sortThreads = (threads) => {
  return [...threads].sort(
    (a, b) => new Date(b.thread.created_at) - new Date(a.thread.created_at)
  );
};

/**
 * Sort comments by creation date (oldest first)
 * @param {Array} comments - The comments to sort
 * @returns {Array} Sorted comments
 */
export const sortComments = (comments) => {
  return [...comments].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
};

/**
 * Filter threads based on user permissions
 * @param {Array} threads - The threads to filter
 * @param {string} userEmail - User's email
 * @param {boolean} isCompanyMail - Whether the email is a company email
 * @param {boolean} isExternalUser - Whether the user is external
 * @returns {Array} Filtered threads
 */
export const filterThreads = (threads, userEmail, isCompanyMail, isExternalUser) => {
  const isRevspireClient = document.cookie
    .split('; ')
    .find((row) => row.startsWith('revspireClient=')) === '1';

  // If not a revspireClient, show all threads
  if (!isRevspireClient) {
    return threads;
  }

  if (!threads || !userEmail) return [];

  // If not an external user, show all threads
  if (!isExternalUser) {
    return threads;
  }

  const userDomain = getEmailDomain(userEmail);

  return threads.filter((thread) => {
    const threadCreator = parseCommentedBy(thread.thread.commented_by);

    if (isCompanyMail) {
      // If company email, show all threads from same domain
      return getEmailDomain(threadCreator.email) === userDomain;
    } else {
      // If personal email, show only user's own threads
      return threadCreator.email === userEmail;
    }
  });
};
