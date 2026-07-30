// src/components/common/WelcomeBanner.jsx
// A professional welcome banner for all dashboards inspired by modern SaaS platforms

import { useAuth } from '../../contexts/AuthContext';

export const WelcomeBanner = () => {
  const { user } = useAuth();
  
  // Get user's first name or full name
  const userName = user?.name || user?.fullName || user?.username || 'User';
  const firstName = userName.split(' ')[0];
  
  // Get current hour for time-based greeting
  const currentHour = new Date().getHours();
  let greeting = 'Good Evening';
  if (currentHour < 12) {
    greeting = 'Good Morning';
  } else if (currentHour < 17) {
    greeting = 'Good Afternoon';
  }

  return (
    <div className="welcome-banner">
      <div className="welcome-banner-grid"></div>
      <div className="welcome-banner-content">
        <h1 className="welcome-banner-title">
          {greeting}, <span className="welcome-banner-name">{firstName}</span>
        </h1>
        <p className="welcome-banner-subtitle">
          Track progress and stay organized
        </p>
      </div>

      <style>{`
        .welcome-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          border-radius: 0;
          padding: 2.5rem 2.5rem;
          margin: -24px -24px 24px -24px;
          box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
        }

        /* 3D Block Grid Pattern */
        .welcome-banner-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 107, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 0, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          background-position: -1px -1px;
          pointer-events: none;
          z-index: 1;
        }

        .welcome-banner-grid::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 60px,
              rgba(255, 107, 0, 0.02) 60px,
              rgba(255, 107, 0, 0.02) 120px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 60px,
              rgba(59, 130, 246, 0.015) 60px,
              rgba(59, 130, 246, 0.015) 120px
            );
          pointer-events: none;
        }

        .welcome-banner-content {
          position: relative;
          z-index: 2;
        }

        .welcome-banner-title {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.3),
            0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .welcome-banner-name {
          color: #ff6b00;
          background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(255, 107, 0, 0.3));
        }

        .welcome-banner-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
          font-weight: 400;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* 3D Block Decorations */
        .welcome-banner::before {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 5%;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, transparent 100%);
          transform: rotate(45deg);
          box-shadow: 
            0 4px 16px rgba(255, 107, 0, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .welcome-banner::after {
          content: '';
          position: absolute;
          top: -15px;
          right: 8%;
          width: 100px;
          height: 100px;
          background: linear-gradient(225deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%);
          transform: rotate(45deg);
          box-shadow: 
            0 4px 16px rgba(59, 130, 246, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.15);
          z-index: 1;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .welcome-banner {
            padding: 2rem 2rem;
            margin: -24px -24px 20px -24px;
          }

          .welcome-banner-title {
            font-size: 1.75rem;
          }

          .welcome-banner-subtitle {
            font-size: 0.9375rem;
          }
        }

        @media (max-width: 768px) {
          .welcome-banner {
            padding: 1.75rem 1.5rem;
            margin: -24px -24px 18px -24px;
          }

          .welcome-banner-title {
            font-size: 1.5rem;
          }

          .welcome-banner-subtitle {
            font-size: 0.875rem;
          }

          .welcome-banner-grid {
            background-size: 40px 40px;
          }

          .welcome-banner::before,
          .welcome-banner::after {
            opacity: 0.5;
          }
        }

        @media (max-width: 480px) {
          .welcome-banner {
            padding: 1.5rem 1rem;
            margin: -24px -24px 16px -24px;
          }

          .welcome-banner-title {
            font-size: 1.375rem;
          }

          .welcome-banner-subtitle {
            font-size: 0.8125rem;
          }

          .welcome-banner-grid {
            background-size: 30px 30px;
          }
        }
      `}</style>
    </div>
  );
};
