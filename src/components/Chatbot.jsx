import { useEffect, useRef, useState } from 'react';
import { cases, experience } from '../data';

const starterQuestions = [
  'View your work',
  'What services do you offer?',
  'How can I hire you?',
];

export default function Chatbot({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      text: 'Hi! I can help you explore Collin’s work, services, and experience—or point you to the best way to get in touch.',
    },
  ]);
  const nextId = useRef(1);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else triggerRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const sendMessage = (value) => {
    const text = value.trim();
    if (!text) return;

    const reply = answerFor(text);
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: 'user', text },
      { id: nextId.current++, role: 'assistant', ...reply },
    ]);
    setDraft('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const runAction = (action) => {
    if (action.type === 'navigate') {
      setOpen(false);
      onNavigate(action.target);
    }
  };

  return (
    <div className="chatbot">
      {open && (
        <section
          id="chatbot-panel"
          className="chatbot-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="chatbot-title"
        >
          <header className="chatbot-header">
            <div>
              <h2 id="chatbot-title">Portfolio assistant</h2>
              <p><span className="chatbot-status" aria-hidden="true" /> Answers from Collin’s portfolio</p>
            </div>
            <button
              className="chatbot-close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close portfolio assistant"
            >
              ×
            </button>
          </header>

          <div className="chatbot-messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((message) => (
              <div key={message.id} className={`chatbot-message chatbot-message-${message.role}`}>
                <p>{message.text}</p>
                {message.actions?.length > 0 && (
                  <div className="chatbot-actions">
                    {message.actions.map((action) => (
                      action.type === 'navigate' ? (
                        <button key={action.label} type="button" onClick={() => runAction(action)}>
                          {action.label}
                        </button>
                      ) : (
                        <a key={action.label} href={action.href} target={action.external ? '_blank' : undefined} rel={action.external ? 'noopener noreferrer' : undefined}>
                          {action.label}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="chatbot-suggestions" aria-label="Suggested questions">
                {starterQuestions.map((question) => (
                  <button key={question} type="button" onClick={() => sendMessage(question)}>
                    {question}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="chatbot-input">Ask about Collin’s work</label>
            <input
              id="chatbot-input"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a question..."
              maxLength={400}
              autoComplete="off"
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4Z" />
              </svg>
            </button>
          </form>
          <p className="chatbot-note">Replies use portfolio content only. Messages stay in this browser.</p>
        </section>
      )}

      <button
        ref={triggerRef}
        className={`chatbot-trigger ${open ? 'is-open' : ''}`}
        type="button"
        aria-expanded={open}
        aria-controls="chatbot-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <>
            <span aria-hidden="true">×</span>
            <span>Close chat</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
            </svg>
            <span>Ask me</span>
          </>
        )}
      </button>
    </div>
  );
}

function answerFor(question) {
  const query = question.toLowerCase().replace(/[’']/g, '');
  const namedProject = cases.find((project) => query.includes(project.title.toLowerCase()));

  if (namedProject) {
    return {
      text: `${namedProject.overview} ${namedProject.outcome}`,
      actions: [{ label: `Explore ${namedProject.title}`, type: 'navigate', target: 'work' }],
    };
  }

  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(query)) {
    return {
      text: 'Hello! Ask me about Collin’s services, selected projects, or experience. If you have a project in mind, I can help you get in touch.',
    };
  }

  if (/\b(service|services|offer|hire|designer|design|ui|ux|develop|build)\b/.test(query)) {
    return {
      text: 'Collin works across product strategy, UX research, product and UI/UX design, and UI/UX development for web and mobile products. He connects user needs and business goals to practical experiences.',
      actions: [{ label: 'Discuss a project', type: 'email', href: 'mailto:collinmanyande09@gmail.com?subject=Product%20design%20project' }],
    };
  }

  if (/\b(process|approach|how do you work|how does.*work)\b/.test(query)) {
    return {
      text: 'Collin starts by understanding the people and the problem, then shapes a practical product direction, tests an early version with users, and improves it based on what works.',
      actions: [{ label: 'More about Collin', type: 'navigate', target: 'about' }],
    };
  }

  if (/\b(work|project|projects|portfolio|case study|case studies|selected)\b/.test(query)) {
    return {
      text: `Selected projects include ${cases.map((project) => project.title).join(', ')}. Each case study explains the problem, approach, and progress so far.`,
      actions: [{ label: 'View selected work', type: 'navigate', target: 'work' }],
    };
  }

  if (/\b(experience|background|career|companies|roles)\b/.test(query)) {
    return {
      text: `Collin’s experience includes ${experience.map((role) => `${role.title} at ${role.company}`).join('; ')}.`,
      actions: [{ label: 'See experience', type: 'navigate', target: 'work' }],
    };
  }

  if (/\b(about|who are you|who is collin)\b/.test(query)) {
    return {
      text: 'Collin Manyande is a product design engineer and UI/UX developer who works at the intersection of product, business, and user experience.',
      actions: [{ label: 'More about Collin', type: 'navigate', target: 'about' }],
    };
  }

  if (/\b(contact|email|whatsapp|talk|start|availability|available|price|pricing|cost|budget|collaborat)\b/.test(query)) {
    return {
      text: 'For current availability, project scope, or pricing, send Collin a short note about what you’re looking to build. He’ll follow up directly.',
      actions: [
        { label: 'Email Collin', type: 'email', href: 'mailto:collinmanyande09@gmail.com?subject=Let%27s%20work%20together' },
        { label: 'WhatsApp', type: 'email', href: 'https://wa.me/263775978079', external: true },
      ],
    };
  }

  return {
    text: 'I can answer questions about Collin’s services, projects, and experience. For anything else, reach out directly and Collin can help.',
    actions: [
      { label: 'View selected work', type: 'navigate', target: 'work' },
      { label: 'Email Collin', type: 'email', href: 'mailto:collinmanyande09@gmail.com' },
    ],
  };
}
