/**
 * Security utility functies
 * Deze module bevat functies voor beveiliging
 */

/**
 * Maskeert een API key voor veilige weergave
 * @param {string} apiKey - De API key die gemaskeerd moet worden
 * @returns {string} - De gemaskeerde API key
 */
function maskApiKey(apiKey) {
  if (!apiKey) return null;
  
  // Voor korte API keys (minder dan 7 tekens), toon eerste 3 en laatste 2
  if (apiKey.length < 7) {
    const firstPart = apiKey.substring(0, 3);
    const lastPart = apiKey.substring(apiKey.length - 2);
    return `${firstPart}...${lastPart}`;
  }
  
  // Voor normale API keys, toon eerste 3 en laatste 4
  const firstPart = apiKey.substring(0, 3);
  const lastPart = apiKey.substring(apiKey.length - 4);
  return `${firstPart}...${lastPart}`;
}

module.exports = {
  maskApiKey
};
