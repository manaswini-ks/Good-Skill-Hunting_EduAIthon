import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TechMentor = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/student/api/tech-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from tech mentor');
      }

      const data = await response.json();

      if (data.success && data.data) {
        const newQA = {
          query,
          response: data.data.response,
          timestamp: new Date().toISOString(),
        };

        setResponse(data.data.response);
        setHistory((prevHistory) => [newQA, ...prevHistory]);
        setQuery('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error querying tech mentor:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text) => {
    if (!text) return null;
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

    const processContent = () => {
      // Split text into parts based on code blocks
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      const parts = [];
      let match;

      // Process code blocks
      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (lastIndex < match.index) {
          parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        parts.push({
          type: 'code',
          language: match[1] || '',
          content: match[2].trim(),
        });
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
      }

      return parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <pre
              key={`code-${index}`}
              style={{
                background: '#f5f7f9',
                padding: '12px',
                borderRadius: '4px',
                overflowX: 'auto',
                fontFamily: 'monospace',
                fontSize: '14px',
                margin: '12px 0',
              }}
            >
              <code>{part.content}</code>
            </pre>
          );
        } else {
          return formatTextContent(part.content, index);
        }
      });
    };

    const formatInlineElements = (text, keyPrefix) => {
      let result = [];
      let lastIndex = 0;
      let key = 0;

      // Process bold text (**text** or __text__)
      const boldRegex = /(\*\*|__)(.*?)\1/g;
      let match;

      while ((match = boldRegex.exec(text)) !== null) {
        if (lastIndex < match.index) {
          result.push(
            formatLinks(text.slice(lastIndex, match.index), `${keyPrefix}-text-${key++}`)
          );
        }
        result.push(
          <strong key={`${keyPrefix}-bold-${key++}`} style={{ fontWeight: 700 }}>
            {match[2]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        result.push(formatLinks(text.slice(lastIndex), `${keyPrefix}-text-${key++}`));
      }

      return result.length > 1 ? result : text;
    };

    const formatLinks = (text, keyPrefix) => {
      const linkRegex = /$$ ([^ $$]+)\]$$ ([^)]+) $$/g;
      let lastIndex = 0;
      let key = 0;
      const result = [];

      let match;
      while ((match = linkRegex.exec(text)) !== null) {
        if (lastIndex < match.index) {
          result.push(text.slice(lastIndex, match.index));
        }
        result.push(
          <a
            key={`${keyPrefix}-link-${key++}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#3498DB',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
      }

      return result.length > 1 ? result : text;
    };

    const formatTextContent = (content, baseIndex) => {
      const sections = [];
      let currentSection = [];
      let currentType = 'paragraph';
      let sectionIndex = 0;

      const lines = content.split('\n');

      lines.forEach((line) => {
        const weekHeaderRegex = /^(#+\s*Week\s+\d+:|Week\s+\d+:)/i;
        if (weekHeaderRegex.test(line)) {
          if (currentSection.length > 0) {
            sections.push({
              type: currentType,
              content: currentSection,
              key: `section-${baseIndex}-${sectionIndex++}`,
            });
            currentSection = [];
          }
          currentType = 'week-header';
          currentSection.push(line.replace(/^#+\s*/, ''));
        } else if (line.match(/^#{1,6}\s/)) {
          if (currentSection.length > 0) {
            sections.push({
              type: currentType,
              content: currentSection,
              key: `section-${baseIndex}-${sectionIndex++}`,
            });
            currentSection = [];
          }
          const level = line.match(/^(#{1,6})\s/)[1].length;
          currentType = `h${level}`;
          currentSection.push(line.replace(/^#{1,6}\s/, ''));
        } else if (line.match(/^\d+\.\s/) || line.match(/^-\s/) || line.match(/^\*\s/)) {
          if (currentType !== 'list' && currentSection.length > 0) {
            sections.push({
              type: currentType,
              content: currentSection,
              key: `section-${baseIndex}-${sectionIndex++}`,
            });
            currentSection = [];
          }
          currentType = 'list';
          currentSection.push(line);
        } else if (line.trim() === '') {
          if (currentSection.length > 0) {
            sections.push({
              type: currentType,
              content: currentSection,
              key: `section-${baseIndex}-${sectionIndex++}`,
            });
            currentSection = [];
          }
          currentType = 'paragraph';
        } else {
          if (currentType !== 'paragraph' && currentSection.length > 0) {
            sections.push({
              type: currentType,
              content: currentSection,
              key: `section-${baseIndex}-${sectionIndex++}`,
            });
            currentSection = [];
          }
          currentType = 'paragraph';
          currentSection.push(line);
        }
      });

      if (currentSection.length > 0) {
        sections.push({
          type: currentType,
          content: currentSection,
          key: `section-${baseIndex}-${sectionIndex++}`,
        });
      }

      return sections.map((section) => {
        const { type, content, key } = section;

        if (type === 'week-header') {
          return (
            <div
              key={key}
              style={{
                margin: '20px 0 12px',
                background: '#3498DB',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {formatInlineElements(content.join(' '), key)}
            </div>
          );
        } else if (type.startsWith('h')) {
          const level = parseInt(type.charAt(1));
          return (
            <div key={key} style={{ margin: '16px 0 8px' }}>
              {React.createElement(
                type,
                {
                  style: {
                    fontSize: 24 - level * 2,
                    fontWeight: 600,
                    color: '#2C3E50',
                    margin: '0 0 8px',
                  },
                },
                formatInlineElements(content.join(' '), key)
              )}
            </div>
          );
        } else if (type === 'list') {
          const isOrdered = content[0].match(/^\d+\.\s/);
          const ListTag = isOrdered ? 'ol' : 'ul';

          return (
            <ListTag
              key={key}
              style={{
                margin: '8px 0',
                paddingLeft: '24px',
              }}
            >
              {content.map((item, idx) => {
                const hasDay = item.includes('*Day');
                const dayStyle = hasDay
                  ? {
                      background: '#3498DB',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      margin: '0 4px',
                    }
                  : {};

                let processedItem = item.replace(/^(\d+\.|-|\*)\s/, '');

                if (hasDay) {
                  processedItem = processedItem.replace(
                    /\*Day (\d+(-\d+)?)\*/g,
                    (match, day) => `<span style="${Object.entries(dayStyle)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(';')}">Day ${day}</span>`
                  );
                }

                return (
                  <li
                    key={`${key}-item-${idx}`}
                    style={{
                      margin: hasDay ? '8px 0' : '4px 0',
                      color: '#34495E',
                    }}
                    dangerouslySetInnerHTML={{ __html: formatInlineElements(processedItem, `${key}-item-${idx}`) }}
                  />
                );
              })}
            </ListTag>
          );
        } else {
          return (
            <div key={key}>
              {content.map((line, idx) => (
                <p
                  key={`${key}-line-${idx}`}
                  style={{
                    margin: '8px 0',
                    color: '#34495E',
                    lineHeight: '1.6',
                  }}
                >
                  {formatInlineElements(line, `${key}-line-${idx}`)}
                </p>
              ))}
            </div>
          );
        }
      });
    };

    return processContent();
  };

  return (
    <div
      style={{
        background: '#EBF5FB',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            borderBottom: '1px solid #D6EAF8',
            paddingBottom: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#2E86C1',
                margin: 0,
              }}
            >
              Tech Mentor
            </h1>
            <p style={{ color: '#5D6D7E', margin: '8px 0 0', fontSize: 14 }}>
              Ask your software engineering questions and get expert answers
            </p>
          </div>
          <Link
            to="/questions"
            style={{
              background: '#3498DB',
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Back to Questions
          </Link>
        </header>

        <section
          style={{
            background: 'white',
            borderRadius: 4,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              color: '#2C3E50',
              fontWeight: 600,
              fontSize: 18,
              margin: '0 0 16px 0',
              borderBottom: '1px solid #EBF5FB',
              paddingBottom: 12,
            }}
          >
            Ask Your Question
          </h2>

          <form onSubmit={handleSubmit}>
            <textarea
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about software engineering, web development, system design, career advice, etc..."
              style={{
                width: '100%',
                border: '1px solid #D6EAF8',
                borderRadius: 4,
                padding: 12,
                fontSize: 15,
                marginBottom: 16,
                resize: 'vertical',
                background: '#fff',
                color: '#34495E',
                fontFamily: 'inherit',
              }}
              required
            />
            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#3498DB',
                  color: '#fff',
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Thinking...' : 'Ask Tech Mentor'}
              </button>
            </div>
          </form>
        </section>

        {loading && (
          <div
            style={{
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              padding: 20,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '3px solid #D6EAF8',
                borderLeftColor: '#3498DB',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            ></div>
            <p style={{ color: '#3498DB', margin: 0, fontWeight: 500 }}>Processing your question...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              padding: 20,
              marginBottom: 20,
            }}
          >
            <p style={{ color: '#E74C3C', fontWeight: 500, fontSize: 16, margin: '0 0 8px 0' }}>Error</p>
            <p style={{ color: '#5D6D7E', margin: 0 }}>{error}</p>
          </div>
        )}

        {response && !loading && (
          <section
            style={{
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              padding: 20,
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                color: '#2C3E50',
                fontWeight: 600,
                fontSize: 18,
                margin: '0 0 16px 0',
                borderBottom: '1px solid #EBF5FB',
                paddingBottom: 12,
              }}
            >
              Tech Mentor Response
            </h2>

            <div
              style={{
                color: '#34495E',
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              {formatResponse(response)}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section
            style={{
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              padding: 20,
            }}
          >
            <h2
              style={{
                color: '#2C3E50',
                fontWeight: 600,
                fontSize: 18,
                margin: '0 0 16px 0',
                borderBottom: '1px solid #EBF5FB',
                paddingBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Previous Questions ({history.length})</span>
              <button
                onClick={() => setHistory([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7FB3D5',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Clear History
              </button>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {history.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: 16,
                    borderLeft: '3px solid #3498DB',
                    background: '#FAFAFA',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      color: '#2C3E50',
                      fontSize: 16,
                      fontWeight: 500,
                      marginBottom: 8,
                    }}
                  >
                    Q: {item.query}
                  </div>

                  <div
                    style={{
                      color: '#34495E',
                      fontSize: 15,
                      marginBottom: 8,
                      lineHeight: 1.6,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '0 4px',
                    }}
                  >
                    <div
                      style={{
                        color: '#2C3E50',
                        fontSize: 16,
                        fontWeight: 500,
                        marginBottom: 8,
                      }}
                    >
                      A:
                    </div>
                    {formatResponse(item.response)}
                  </div>

                  <div
                    style={{
                      color: '#7FB3D5',
                      fontSize: 13,
                      textAlign: 'right',
                    }}
                  >
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TechMentor;