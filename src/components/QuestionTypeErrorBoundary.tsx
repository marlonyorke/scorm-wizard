import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';

interface QuestionTypeErrorBoundaryProps {
  children: ReactNode;
  questionType: string;
}

interface QuestionTypeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  border: 1px solid var(--error-color, #e74c3c);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  background: rgba(231, 76, 60, 0.1);
  
  .theme-neon & {
    border: 1px solid #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
  }
`;

const ErrorTitle = styled.h3`
  color: var(--error-color, #e74c3c);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  
  .theme-neon & {
    color: #ff6b6b;
  }
`;

const ErrorMessage = styled.p`
  margin: 0.5rem 0;
  color: var(--secondary-text, #666);
  
  .theme-neon & {
    color: #ccc;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: var(--primary-accent, #4361ee);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: var(--secondary-accent, #3a0ca3);
  }
  
  .theme-neon & {
    background: #00ff00;
    color: #000;
    
    &:hover {
      background: #00cc00;
    }
  }
`;

class QuestionTypeErrorBoundary extends Component<QuestionTypeErrorBoundaryProps, QuestionTypeErrorBoundaryState> {
  constructor(props: QuestionTypeErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): QuestionTypeErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.questionType} component:`, error, errorInfo);
    
    // Log to analytics if available
    if (window.analytics) {
      window.analytics.track('question_type_error', {
        type: this.props.questionType,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    // Reset to default state
    if (this.props.questionType === 'multiple-choice') {
      // Reset to empty question state
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>
            {this.props.questionType} Component Error
          </ErrorTitle>
          <ErrorMessage>
            There was an error loading the {this.props.questionType} question type.
            Please try refreshing or resetting the question.
          </ErrorMessage>
          {process.env.NODE_ENV === 'development' && (
            <ErrorMessage>
              <strong>Error:</strong> {this.state.error?.message}
            </ErrorMessage>
          )}
          <ActionButtons>
            <ActionButton onClick={this.handleRetry}>
              Try Again
            </ActionButton>
            <ActionButton onClick={this.handleReset}>
              Reset Question
            </ActionButton>
          </ActionButtons>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default QuestionTypeErrorBoundary;
