import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const QuestionDetails = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/shared/api/questions/${questionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const data = await response.json();
      setQuestion(data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching question:', error);
      setError(error.message);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!description.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/shared/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      await fetchQuestion(); // Refresh the question
      setDescription('');
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  if (loading) {
    return (
      <div style={{ 
        background: '#EBF5FB', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ 
          background: 'white',
          padding: '24px',
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            border: '3px solid #D6EAF8', 
            borderLeftColor: '#3498DB',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#3498DB', margin: 0, fontWeight: 500 }}>Loading question...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: '#EBF5FB', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: 500
        }}>
          <p style={{ color: '#E74C3C', fontWeight: 500, fontSize: 16 }}>Error</p>
          <p style={{ color: '#5D6D7E', margin: '8px 0 16px' }}>{error}</p>
          <Link to="/questions" style={{
            background: '#3498DB',
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-block'
          }}>
            Return to Questions
          </Link>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ 
        background: '#EBF5FB', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: 500
        }}>
          <p style={{ color: '#F39C12', fontWeight: 500, fontSize: 16 }}>Question Not Found</p>
          <p style={{ color: '#5D6D7E', margin: '8px 0 16px' }}>The question you're looking for doesn't exist or has been removed.</p>
          <Link to="/questions" style={{
            background: '#3498DB',
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-block'
          }}>
            Return to Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#EBF5FB', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '24px',
      }}>
        <header style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          borderBottom: '1px solid #D6EAF8',
          paddingBottom: 16
        }}>
          <div>
            <h1 style={{ 
              fontSize: 24, 
              fontWeight: 600, 
              color: '#2E86C1', 
              margin: 0
            }}>Question Details</h1>
          </div>
          <Link to="/questions" style={{ 
            background: '#3498DB',
            color: 'white',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500
          }}>
            Back to Questions
          </Link>
        </header>

        <div>
          {/* Question Content */}
          <section style={{ 
            background: 'white', 
            borderRadius: 4, 
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', 
            padding: 20,
            marginBottom: 20
          }}>
            <h2 style={{ 
              color: '#2C3E50', 
              fontWeight: 600, 
              fontSize: 18, 
              margin: '0 0 16px 0',
              borderBottom: '1px solid #EBF5FB',
              paddingBottom: 12
            }}>{question.title}</h2>
            <div style={{ 
              color: '#34495E', 
              fontSize: 15,
              marginBottom: 16,
              lineHeight: 1.6
            }}>{question.description}</div>
            <div style={{ 
              color: '#7FB3D5', 
              fontSize: 13
            }}>
              Posted on {new Date(question.createdAt).toLocaleDateString()}
            </div>
          </section>

          {/* Answers Section */}
          <section style={{ 
            background: 'white', 
            borderRadius: 4, 
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', 
            padding: 20,
            marginBottom: 20
          }}>
            <h2 style={{ 
              color: '#2C3E50', 
              fontWeight: 600, 
              fontSize: 18, 
              margin: '0 0 16px 0',
              borderBottom: '1px solid #EBF5FB',
              paddingBottom: 12
            }}>Answers ({question.answers?.length || 0})</h2>
            
            {question.answers?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {question.answers.map((answer, index) => (
                  <div key={index} style={{ 
                    padding: 16,
                    borderLeft: '3px solid #3498DB',
                    background: '#FAFAFA',
                    marginBottom: 8
                  }}>
                    <div style={{ 
                      color: '#34495E', 
                      fontSize: 15,
                      marginBottom: 8,
                      lineHeight: 1.6
                    }}>{answer.description}</div>
                    <div style={{ 
                      color: '#7FB3D5', 
                      fontSize: 13
                    }}>
                      Answered on {new Date(answer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                color: '#7FB3D5', 
                padding: '16px',
                textAlign: 'center',
                background: '#FAFAFA',
              }}>No answers yet. Be the first to answer this question.</div>
            )}
          </section>

          {/* Answer Form */}
          <section style={{ 
            background: 'white', 
            borderRadius: 4,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', 
            padding: 20
          }}>
            <h2 style={{ 
              color: '#2C3E50', 
              fontWeight: 600, 
              fontSize: 18, 
              margin: '0 0 16px 0',
              borderBottom: '1px solid #EBF5FB',
              paddingBottom: 12
            }}>Your Answer</h2>
            
            <form onSubmit={handleSubmit}>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type your answer here..."
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
                  fontFamily: 'inherit'
                }}
                required
              />
              <div style={{ textAlign: 'right' }}>
                <button
                  type="submit"
                  style={{ 
                    background: '#3498DB', 
                    color: '#fff', 
                    padding: '8px 20px', 
                    border: 'none', 
                    borderRadius: 4, 
                    fontWeight: 500, 
                    fontSize: 14, 
                    cursor: 'pointer'
                  }}
                >
                  Submit Answer
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;