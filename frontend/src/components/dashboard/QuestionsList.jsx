import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/shared/api/questions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newQuestion.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/shared/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newQuestion,
          description: "Question details..." // You can modify this
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit question');
      }

      await fetchQuestions(); // Refresh the list
      setNewQuestion('');
    } catch (error) {
      console.error('Error submitting question:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

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
          <p style={{ color: '#3498DB', margin: 0, fontWeight: 500 }}>Loading questions...</p>
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
          <button onClick={fetchQuestions} style={{
            background: '#3498DB',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            Try Again
          </button>
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
            }}>QnA</h1>
          </div>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '30% 70%', 
          gap: 20,
        }}>
          {/* Ask New Question Card */}
          <div>
            <section style={{ 
              background: 'white', 
              borderRadius: 4, 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', 
              padding: 20,
            }}>
              <h2 style={{ 
                color: '#2C3E50', 
                fontWeight: 600, 
                fontSize: 18, 
                margin: '0 0 16px 0',
                borderBottom: '1px solid #EBF5FB',
                paddingBottom: 12
              }}>
                Ask a New Question
              </h2>
              <div style={{ 
                backgroundColor: '#FAFAFA', 
                padding: 16,
                marginBottom: 16,
                border: '1px solid #EBF5FB'
              }}>
                <p style={{ margin: 0, color: '#5D6D7E', fontSize: 14 }}>
                  Need help or have a question? Ask our community and receive expert answers.
                </p>
              </div>
              <div>
                <textarea
                  rows={6}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question here..."
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
                />
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={handleSubmit}
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
                    Submit Question
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Questions List */}
          <div>
            <section style={{ 
              background: 'white', 
              borderRadius: 4, 
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', 
              padding: 20,
            }}>
              <h2 style={{ 
                color: '#2C3E50', 
                fontWeight: 600, 
                fontSize: 18, 
                margin: '0 0 16px 0',
                borderBottom: '1px solid #EBF5FB',
                paddingBottom: 12
              }}>
                Frequently Asked Questions
              </h2>
              
              {questions.length === 0 ? (
                <div style={{ 
                  color: '#7FB3D5', 
                  padding: '16px',
                  textAlign: 'center',
                  background: '#FAFAFA',
                }}>No questions yet. Be the first to ask!</div>
              ) : (
                <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                  {questions.map((question) => (
                    <div key={question._id} style={{ 
                      padding: 16,
                      borderBottom: '1px solid #EBF5FB',
                      transition: 'background-color 0.1s ease-in-out',
                      ':hover': { backgroundColor: '#F8FBFD' }
                    }}>
                      <Link to={`/questions/${question._id}`} style={{ 
                        textDecoration: 'none', 
                        color: '#2C3E50', 
                        fontWeight: 500, 
                        fontSize: 16, 
                        display: 'block'
                      }}>
                        <div>
                          <div style={{ color: '#34495E', lineHeight: 1.4 }}>{question.title}</div>
                          <div style={{ 
                            color: '#7FB3D5', 
                            fontWeight: 400, 
                            fontSize: 13, 
                            marginTop: 6,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span style={{ 
                              background: question.answers?.length > 0 ? '#EBF5FB' : '#FEF9E7',
                              color: question.answers?.length > 0 ? '#2E86C1' : '#F39C12',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 12
                            }}>
                              {question.answers?.length || 0} {question.answers?.length === 1 ? 'answer' : 'answers'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsList;